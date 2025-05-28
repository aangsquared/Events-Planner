import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { Event } from '@/app/types/event';

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

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const id = context.params.id;

        // If it's a Ticketmaster event (ID starts with 'tm_')
        if (id.startsWith('tm_')) {
            const tmId = id.replace('tm_', '');
            const response = await fetch(
                `${request.nextUrl.origin}/api/events/ticketmaster/${tmId}`
            );

            if (!response.ok) {
                throw new Error('Event not found');
            }

            const data = await response.json();
            return NextResponse.json({ event: data.event });
        }

        // If it's a platform event
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const event: Event = {
            id: docSnap.id,
            ...docSnap.data(),
            source: 'platform',
        } as Event;

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        );
    }
} 