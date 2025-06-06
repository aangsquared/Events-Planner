'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';
import DashboardHeader from '@/app/components/DashboardHeader';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

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
}

export default function StaffEventsPage() {
  const router = useRouter();
  const { isStaff } = useRole();
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not staff
  if (!isStaff) {
    router.push('/unauthorised');
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
    return <LoadingSpinner text="Loading events..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        title="Manage Events" 
        subtitle="View and manage your platform events"
      />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {error && (
              <div className="p-4 bg-red-50 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {events.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">You haven't created any events yet.</p>
                <Link
                  href="/staff/events/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
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
                              href={`/staff/events/${event.id}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View
                            </Link>
                            <Link
                              href={`/staff/events/edit/${event.id}`}
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

                {/* Mobile Card View */}
                <div className="sm:hidden">
                  <div className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 space-y-3">
                        {/* Event Title */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{event.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Created {format(new Date(event.createdAt), 'PP')}
                          </p>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2">
                          {/* Date and Venue */}
                          <div className="flex items-start space-x-2">
                            <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-xs font-medium text-gray-900">
                                {format(new Date(event.startDate), 'PPp')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {event.venue.name}, {event.venue.city}, {event.venue.state}
                              </p>
                            </div>
                          </div>

                          {/* Status and Registrations */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  event.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  event.isPublic
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {event.isPublic ? 'Public' : 'Private'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-xs text-gray-600">
                                {event.registrations || 0}/{event.capacity}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-4 pt-2 border-t border-gray-100">
                          <Link
                            href={`/staff/events/${event.id}`}
                            className="flex-1 text-center py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                          >
                            View
                          </Link>
                          <Link
                            href={`/staff/events/edit/${event.id}`}
                            className="flex-1 text-center py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 