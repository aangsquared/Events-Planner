import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

interface FirestoreEvent {
    id: string;
    startDate: Timestamp | string;
    status: string;
}

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and is staff
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is staff
        const userRole = session.user.role;
        if (userRole !== 'staff' && userRole !== 'admin') {
            return NextResponse.json({ error: 'Access denied. Staff only.' }, { status: 403 });
        }

        // Read events from Firestore
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);

        const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FirestoreEvent[];

        // Calculate statistics
        const now = new Date();
        const totalEvents = events.length;

        const upcomingEvents = events.filter((event: FirestoreEvent) => {
            let startDate;
            if (event.startDate instanceof Timestamp) {
                startDate = event.startDate.toDate();
            } else {
                startDate = new Date(event.startDate);
            }
            return startDate > now && event.status === 'active';
        }).length;

        const pastEvents = events.filter((event: FirestoreEvent) => {
            let startDate;
            if (event.startDate instanceof Timestamp) {
                startDate = event.startDate.toDate();
            } else {
                startDate = new Date(event.startDate);
            }
            return startDate <= now || event.status === 'completed';
        }).length;

        return NextResponse.json({
            totalEvents,
            upcomingEvents,
            pastEvents
        });

    } catch (error) {
        console.error('Error fetching event stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event statistics' },
            { status: 500 }
        );
    }
} 