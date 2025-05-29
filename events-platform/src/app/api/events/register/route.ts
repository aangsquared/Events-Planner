import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

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

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { eventId } = await request.json();

        if (!eventId) {
            return NextResponse.json(
                { error: 'Event ID is required' },
                { status: 400 }
            );
        }

        // Check if user is already registered for this event
        const existingRegistrations = query(
            collection(db, 'registrations'),
            where('userId', '==', session.user.id),
            where('eventId', '==', eventId),
            where('status', '==', 'registered')  // Only check for active registrations
        );

        const existingRegistrationsSnapshot = await getDocs(existingRegistrations);
        if (!existingRegistrationsSnapshot.empty) {
            return NextResponse.json(
                { error: 'You are already registered for this event' },
                { status: 400 }
            );
        }

        let eventData;

        // If it's a Ticketmaster event
        if (eventId.startsWith('tm_')) {
            const tmId = eventId.replace('tm_', '');
            const response = await fetch(
                `${request.nextUrl.origin}/api/events/ticketmaster/${tmId}`
            );

            if (!response.ok) {
                throw new Error('Event not found');
            }

            const data = await response.json();
            eventData = data.event;
        } else {
            // If it's a platform event
            const eventRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                return NextResponse.json(
                    { error: 'Event not found' },
                    { status: 404 }
                );
            }

            eventData = {
                id: eventDoc.id,
                ...eventDoc.data(),
            };
        }

        // Create registration
        const registration = {
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name,
            eventId: eventId,
            eventName: eventData.name,
            eventDate: eventData.startDate,
            eventVenue: eventData.venue.name,
            eventSource: eventId.startsWith('tm_') ? 'ticketmaster' : 'platform',
            registeredAt: new Date().toISOString(),
            status: 'registered',
            ticketCount: 1,
            // Store ticketmaster URL if it's a Ticketmaster event
            ticketUrl: eventId.startsWith('tm_') ? eventData.ticketmasterData?.url : undefined,
        };

        const registrationRef = await addDoc(collection(db, 'registrations'), registration);

        return NextResponse.json({
            id: registrationRef.id,
            ...registration,
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        return NextResponse.json(
            { error: 'Failed to register for event' },
            { status: 500 }
        );
    }
} 