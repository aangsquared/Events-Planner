import { NextRequest, NextResponse } from 'next/server';
import { Event, EventFilters, PlatformEvent, TicketmasterEvent } from '@/app/types/event';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const filters: EventFilters = {
    category: searchParams.get('category') || undefined,
    city: searchParams.get('city') || undefined,
    search: searchParams.get('search') || undefined,
    source: (searchParams.get('source') as 'all' | 'ticketmaster' | 'platform') || 'all',
  };

  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '20');

  try {
    const allEvents: Event[] = [];

    // Fetch platform events if requested
    if (filters.source === 'all' || filters.source === 'platform') {
      try {
        const platformResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/events/platform`,
          { 
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 } // Cache for 5 minutes
          }
        );
        
        if (platformResponse.ok) {
          const platformData = await platformResponse.json();
          allEvents.push(...platformData.events);
        }
      } catch (error) {
        console.error('Error fetching platform events:', error);
      }
    }

    // Fetch Ticketmaster events if requested
    if (filters.source === 'all' || filters.source === 'ticketmaster') {
      try {
        const tmParams = new URLSearchParams();
        if (filters.city) tmParams.append('city', filters.city);
        if (filters.search) tmParams.append('keyword', filters.search);
        if (filters.category) tmParams.append('category', filters.category);
        tmParams.append('size', (size * 2).toString()); // Get more to account for filtering
        tmParams.append('page', page.toString());

        const tmResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/events/ticketmaster?${tmParams}`,
          { 
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 600 } // Cache for 10 minutes
          }
        );
        
        if (tmResponse.ok) {
          const tmData = await tmResponse.json();
          allEvents.push(...tmData.events);
        }
      } catch (error) {
        console.error('Error fetching Ticketmaster events:', error);
      }
    }

    // Apply additional filtering
    let filteredEvents = allEvents;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue.name.toLowerCase().includes(searchLower) ||
        event.venue.city.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredEvents = filteredEvents.filter(event =>
        event.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    if (filters.city) {
      filteredEvents = filteredEvents.filter(event =>
        event.venue.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Paginate
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        page,
        size,
        totalElements: filteredEvents.length,
        totalPages: Math.ceil(filteredEvents.length / size),
      },
      filters: filters,
    });
  } catch (error) {
    console.error('Error fetching unified events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}