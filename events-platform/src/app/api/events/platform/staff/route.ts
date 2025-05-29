import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

interface PlatformEvent {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    venue: {
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    category: string;
    price: {
        min: number;
        max: number;
        currency: string;
    };
    capacity: number;
    availableTickets: number;
    status: 'active' | 'cancelled' | 'completed';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    tags: string[];
}

interface EventWithRegistrations extends PlatformEvent {
    registrations: number;
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is staff
    if (session.user.role !== 'staff' && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Query events created by this staff user
        const eventsQuery = query(
            collection(db, 'events'),
            where('createdBy', '==', session.user.id)
        );

        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PlatformEvent[];

        // For each event, get the registration count
        const eventsWithRegistrations = await Promise.all(
            events.map(async (event) => {
                const registrationsQuery = query(
                    collection(db, 'registrations'),
                    where('eventId', '==', event.id),
                    where('status', '==', 'registered')
                );
                const registrationsSnapshot = await getDocs(registrationsQuery);

                return {
                    ...event,
                    registrations: registrationsSnapshot.size
                };
            })
        );

        // Sort events by creation date, newest first
        const sortedEvents = eventsWithRegistrations.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ events: sortedEvents });
    } catch (error) {
        console.error('Error fetching staff events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}