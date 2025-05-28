import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getFirestore, collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { PlatformEvent } from '@/app/types/event';

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
  const { searchParams } = new URL(request.url);
  const createdBy = searchParams.get('createdBy');
  const isPublic = searchParams.get('isPublic');

  try {
    let eventsQuery = query(
      collection(db, 'events'),
      orderBy('startDate', 'asc')
    );

    if (createdBy) {
      eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', createdBy),
        orderBy('startDate', 'asc')
      );
    } else if (isPublic !== 'false') {
      eventsQuery = query(
        collection(db, 'events'),
        where('isPublic', '==', true),
        orderBy('startDate', 'asc')
      );
    }

    const querySnapshot = await getDocs(eventsQuery);
    const events: PlatformEvent[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        venue: data.venue,
        images: data.images || [],
        category: data.category,
        price: data.price,
        capacity: data.capacity,
        availableTickets: data.availableTickets,
        status: data.status,
        source: 'platform',
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isPublic: data.isPublic,
        tags: data.tags || [],
      });
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching platform events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is staff
  if (session.user.role !== 'staff' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const eventData = await request.json();
    
    const newEvent = {
      name: eventData.name,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      venue: eventData.venue,
      images: eventData.images || [],
      category: eventData.category,
      price: eventData.price,
      capacity: eventData.capacity,
      availableTickets: eventData.capacity,
      status: 'active',
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: eventData.isPublic !== false,
      tags: eventData.tags || [],
    };

    const docRef = await addDoc(collection(db, 'events'), newEvent);
    
    return NextResponse.json({
      id: docRef.id,
      ...newEvent,
      source: 'platform',
    });
  } catch (error) {
    console.error('Error creating platform event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}