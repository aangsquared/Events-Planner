import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';

interface Registration {
    id: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    eventSource: 'platform' | 'ticketmaster';
    registeredAt: string;
    status: 'registered' | 'cancelled' | 'attended';
    ticketCount: number;
    ticketUrl?: string;
    userId: string;
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
    console.log('Starting my-registrations request');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        console.log('No session or user found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', session.user.id);

    try {
        console.log('Attempting to fetch registrations from Firestore');
        // Get all registrations and filter in memory
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        console.log('Registrations fetched, count:', registrationsSnapshot.size);

        const registrations = registrationsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Registration[];

        console.log('Total registrations:', registrations.length);

        // Filter to only show the user's registrations
        const userRegistrations = registrations
            .filter(reg => reg.userId === session.user.id && reg.status === 'registered')
            .sort((a, b) => {
                const dateA = new Date(a.eventDate).getTime();
                const dateB = new Date(b.eventDate).getTime();
                return dateA - dateB;
            });

        console.log('User registrations found:', userRegistrations.length);

        return NextResponse.json({ registrations: userRegistrations });
    } catch (error) {
        const fbError = error as FirebaseError;
        console.error('Detailed error in fetching registrations:', {
            error: fbError,
            message: fbError.message,
            code: fbError.code,
            stack: fbError.stack
        });
        return NextResponse.json(
            { error: `Failed to fetch registrations: ${fbError.message}` },
            { status: 500 }
        );
    }
} 