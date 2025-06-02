import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Query all registrations for the user, ordered by registration date
        const registrationsQuery = query(
            collection(db, 'registrations'),
            where('userId', '==', session.user.id),
            orderBy('registeredAt', 'desc')
        );

        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registrations = registrationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Return the most recent 10 registrations
        return NextResponse.json({
            registrations: registrations.slice(0, 10)
        });
    } catch (error) {
        console.error('Error fetching registration activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch registration activity' },
            { status: 500 }
        );
    }
} 