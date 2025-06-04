import { NextRequest, NextResponse } from 'next/server';
import { TicketmasterAPIEvent, TicketmasterEvent } from '@/app/types/event';

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
            amount: tmEvent.priceRanges[0].min,
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
                segment: c.segment?.name || 'Other',
                genre: c.genre?.name || 'Other',
                subGenre: c.subGenre?.name,
            })),
        },
        lastSynced: new Date().toISOString(),
    };
}

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    if (!TICKETMASTER_API_KEY) {
        return NextResponse.json(
            { error: 'Ticketmaster API key not configured' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(
            `${TICKETMASTER_BASE_URL}/events/${context.params.id}?apikey=${TICKETMASTER_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Ticketmaster API error: ${response.status}`);
        }

        const data = await response.json();
        const transformedEvent = transformTicketmasterEvent(data);

        return NextResponse.json({ event: transformedEvent });
    } catch (error) {
        console.error('Error fetching Ticketmaster event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event from Ticketmaster' },
            { status: 500 }
        );
    }
} 