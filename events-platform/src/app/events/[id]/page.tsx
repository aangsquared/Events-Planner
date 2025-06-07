'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Event } from '@/app/types/event';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Link from 'next/link';
import AddToCalendarButton from '@/app/components/AddToCalendarButton';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (error) {
        setError('Failed to load event details');
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const handleSignUp = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      setRegistering(true);
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register for event');
      }

      router.push('/dashboard/my-events');
    } catch (error) {
      setError('Failed to register for event');
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {error || 'Event not found'}
            </h1>
            <Link
              href="/events"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/events"
            className="text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="relative h-96">
            {event.images[0] && (
              <Image
                src={event.images[0]}
                alt={event.name}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="p-8">
            {/* Title and Status */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Date and Time */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Date and Time
                  </h2>
                  <p className="text-gray-600">
                    {format(new Date(event.startDate), 'PPP p')}
                    {event.endDate && (
                      <>
                        {' '}
                        - <br />
                        {format(new Date(event.endDate), 'PPP p')}
                      </>
                    )}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Location
                  </h2>
                  <p className="text-gray-600">
                    {event.venue.name}
                    <br />
                    {event.venue.address && (
                      <>
                        {event.venue.address}
                        <br />
                      </>
                    )}
                    {event.venue.city}
                    {event.venue.state && `, ${event.venue.state}`}
                    <br />
                    {event.venue.country}
                  </p>
                </div>

                {/* Price */}
                {event.price && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Price
                    </h2>
                    <p className="text-gray-600">
                      {event.price.currency} {event.price.amount}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {event.description || 'No description available.'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Category
                  </h2>
                  <p className="text-gray-600">{event.category}</p>
                </div>

                {/* Additional Details for Ticketmaster Events */}
                {event.source === 'ticketmaster' && event.ticketmasterData && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Additional Information
                    </h2>
                    {event.ticketmasterData.classifications && (
                      <div className="mb-2">
                        <p className="text-gray-600">
                          {event.ticketmasterData.classifications
                            .map(
                              (c) =>
                                `${c.segment}${c.genre ? ` - ${c.genre}` : ''}${
                                  c.subGenre ? ` - ${c.subGenre}` : ''
                                }`
                            )
                            .join(', ')}
                        </p>
                      </div>
                    )}
                    {event.ticketmasterData.sales?.public && (
                      <div className="text-sm text-gray-500">
                        {event.ticketmasterData.sales.public.startDateTime && (
                          <p>
                            Sales Start:{' '}
                            {format(
                              new Date(
                                event.ticketmasterData.sales.public.startDateTime
                              ),
                              'PPP p'
                            )}
                          </p>
                        )}
                        {event.ticketmasterData.sales.public.endDateTime && (
                          <p>
                            Sales End:{' '}
                            {format(
                              new Date(
                                event.ticketmasterData.sales.public.endDateTime
                              ),
                              'PPP p'
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {event.source === 'ticketmaster' ? (
                <>
                  <a
                    href={event.ticketmasterData?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Buy Tickets on Ticketmaster
                  </a>
                  <button
                    onClick={handleSignUp}
                    disabled={registering}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                        Adding to My Events...
                      </div>
                    ) : (
                      'Add to My Events'
                    )}
                  </button>
                  <AddToCalendarButton
                    eventName={event.name}
                    startTime={event.startDate}
                    endTime={event.endDate || event.startDate}
                    location={`${event.venue.name}, ${event.venue.address}, ${event.venue.city}, ${event.venue.state}, ${event.venue.country}`}
                    description={event.description}
                  />
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignUp}
                    disabled={registering}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing Up...
                      </div>
                    ) : (
                      'Sign Up for Event'
                    )}
                  </button>
                  <AddToCalendarButton
                    eventName={event.name}
                    startTime={event.startDate}
                    endTime={event.endDate || event.startDate}
                    location={`${event.venue.name}, ${event.venue.address}, ${event.venue.city}, ${event.venue.state}, ${event.venue.country}`}
                    description={event.description}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 