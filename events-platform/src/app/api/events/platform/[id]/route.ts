import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is staff
    if (session.user.role !== 'staff' && session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const eventId = context.params.id;
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if the event belongs to this staff user
        if (eventDoc.data().createdBy !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this event' },
                { status: 403 }
            );
        }

        // Check if there are any active registrations
        const registrationsQuery = query(
            collection(db, 'registrations'),
            where('eventId', '==', eventId),
            where('status', '==', 'registered')
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);

        if (!registrationsSnapshot.empty) {
            return NextResponse.json(
                { error: 'Cannot delete event with active registrations' },
                { status: 400 }
            );
        }

        // Delete the event
        await deleteDoc(eventRef);

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { error: 'Failed to delete event' },
            { status: 500 }
        );
    }
}