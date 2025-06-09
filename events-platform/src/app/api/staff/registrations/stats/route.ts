import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

interface FirestoreRegistration {
    id: string;
    registeredAt: Timestamp | string;
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

        // Read registrations from Firestore
        const registrationsRef = collection(db, 'registrations');
        const registrationsSnapshot = await getDocs(registrationsRef);

        const registrations = registrationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FirestoreRegistration[];

        // Calculate statistics
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const totalRegistrations = registrations.length;

        const todayRegistrations = registrations.filter((registration: FirestoreRegistration) => {
            let regDate;
            if (registration.registeredAt instanceof Timestamp) {
                regDate = registration.registeredAt.toDate();
            } else {
                regDate = new Date(registration.registeredAt);
            }
            return regDate >= today && regDate < tomorrow;
        }).length;

        const pendingRegistrations = registrations.filter((registration: FirestoreRegistration) => {
            return registration.status === 'registered'; // Active registrations that haven't been processed
        }).length;

        return NextResponse.json({
            totalRegistrations,
            todayRegistrations,
            pendingRegistrations
        });

    } catch (error) {
        console.error('Error fetching registration stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch registration statistics' },
            { status: 500 }
        );
    }
} 