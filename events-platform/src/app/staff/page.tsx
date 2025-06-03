'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';
import { signOut } from 'next-auth/react';

interface PlatformEvent {
  id: string;
  name: string;
  startDate: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  status: 'active' | 'cancelled' | 'completed';
  capacity: number;
  availableTickets: number;
  registrations?: number;
  createdAt: string;
  isPublic: boolean;
  price?: {
    amount: number;
    currency: string;
  };
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const { isStaff } = useRole();
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not staff
  if (!isStaff) {
    router.push('/unauthorized');
    return null;
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events/platform/staff');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/platform/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(event => event.id !== eventId));
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Event Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage your events from one place
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create New Event
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {events.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">You haven't created any events yet.</p>
              <Link
                href="/events/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-500">
                          Created {format(new Date(event.createdAt), 'PP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(event.startDate), 'PPp')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.venue.name}, {event.venue.city}, {event.venue.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.registrations || 0} / {event.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.price ? `${event.price.amount} ${event.price.currency}` : 'Free'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.isPublic
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/events/${event.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/events/edit/${event.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 