import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';

interface Registration {
    id: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    eventEndDate?: string;
    eventVenue: string;
    eventSource: 'platform' | 'ticketmaster';
    registeredAt: string;
    status: 'registered' | 'cancelled' | 'attended' | 'ended';
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

        // Create a query to only fetch the user's registrations
        const registrationsRef = collection(db, 'registrations');
        const userRegistrationsQuery = query(
            registrationsRef,
            where('userId', '==', session.user.id),
            where('status', '==', 'registered')
        );

        const registrationsSnapshot = await getDocs(userRegistrationsQuery);
        console.log('User registrations fetched, count:', registrationsSnapshot.size);

        const registrations = registrationsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Registration[];

        // Process the registrations to update status for ended events
        const processedRegistrations = registrations
            .map(reg => {
                const now = new Date();
                const eventEndDate = reg.eventEndDate ? new Date(reg.eventEndDate) : new Date(reg.eventDate);
                eventEndDate.setHours(23, 59, 59, 999);

                if (now > eventEndDate) {
                    return { ...reg, status: 'ended' };
                }
                return reg;
            })
            .sort((a, b) => {
                const dateA = new Date(a.eventDate).getTime();
                const dateB = new Date(b.eventDate).getTime();
                return dateA - dateB;
            });

        console.log('Processed registrations count:', processedRegistrations.length);

        return NextResponse.json({ registrations: processedRegistrations });
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