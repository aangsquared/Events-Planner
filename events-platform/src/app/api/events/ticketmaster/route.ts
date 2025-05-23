import { NextRequest, NextResponse } from 'next/server';
import { TicketmasterAPIResponse, TicketmasterAPIEvent, TicketmasterEvent } from '@/app/types/event';

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

function transformTicketmasterEvent(tmEvent: TicketmasterAPIEvent): TicketmasterEvent {
  const venue = tmEvent._embedded?.venues?.[0];
  const classification = tmEvent.classifications?.[0];
  
  return {
    id: `tm_${tmEvent.id}`,
    name: tmEvent.name,
    description: tmEvent.info || tmEvent.pleaseNote || '',
    startDate: tmEvent.dates.start.dateTime || 
               `${tmEvent.dates.start.localDate}${tmEvent.dates.start.localTime ? `T${tmEvent.dates.start.localTime}` : 'T00:00:00'}`,
    endDate: tmEvent.dates.end?.dateTime || 
             (tmEvent.dates.end?.localDate ? `${tmEvent.dates.end.localDate}${tmEvent.dates.end.localTime ? `T${tmEvent.dates.end.localTime}` : 'T23:59:59'}` : undefined),
    venue: {
      name: venue?.name || 'TBA',
      address: venue?.address?.line1 || '',
      city: venue?.city?.name || '',
      state: venue?.state?.name,
      country: venue?.country?.name || '',
      latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : undefined,
      longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : undefined,
    },
    images: tmEvent.images?.map(img => img.url) || [],
    category: classification?.genre?.name || classification?.segment?.name || 'Entertainment',
    price: tmEvent.priceRanges?.[0] ? {
      min: tmEvent.priceRanges[0].min,
      max: tmEvent.priceRanges[0].max,
      currency: tmEvent.priceRanges[0].currency,
    } : undefined,
    status: tmEvent.dates.status.code === 'onsale' ? 'active' : 
            tmEvent.dates.status.code === 'cancelled' ? 'cancelled' : 
            tmEvent.dates.status.code === 'postponed' ? 'postponed' : 
            tmEvent.dates.status.code === 'rescheduled' ? 'rescheduled' : 'active',
    source: 'ticketmaster',
    ticketmasterData: {
      originalId: tmEvent.id,
      url: tmEvent.url,
      ticketUrl: tmEvent.url,
      priceRanges: tmEvent.priceRanges,
      sales: {
        public: {
          startDateTime: tmEvent.sales?.public?.startDateTime,
          endDateTime: tmEvent.sales?.public?.endDateTime,
        },
      },
      classifications: tmEvent.classifications?.map(c => ({
        segment: c.segment.name,
        genre: c.genre.name,
        subGenre: c.subGenre?.name,
      })),
    },
    lastSynced: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!TICKETMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Ticketmaster API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '';
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const size = parseInt(searchParams.get('size') || '20');
  const page = parseInt(searchParams.get('page') || '0');
  const sort = searchParams.get('sort') || 'date,asc';

  try {
    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      size: size.toString(),
      page: page.toString(),
      sort,
    });

    if (city) params.append('city', city);
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('classificationName', category);
    
    // Only get upcoming events
    params.append('startDateTime', new Date().toISOString());

    const response = await fetch(`${TICKETMASTER_BASE_URL}/events.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data: TicketmasterAPIResponse = await response.json();
    
    const events = data._embedded?.events || [];
    const transformedEvents = events.map(transformTicketmasterEvent);

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        page: data.page.number,
        size: data.page.size,
        totalElements: data.page.totalElements,
        totalPages: data.page.totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events from Ticketmaster' },
      { status: 500 }
    );
  }
}