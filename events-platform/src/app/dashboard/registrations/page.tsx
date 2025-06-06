'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';
import DashboardHeader from '@/app/components/DashboardHeader';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  userEmail: string;
  userName: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended' | 'ended';
  ticketCount: number;
}

interface Event {
  id: string;
  name: string;
  startDate: string;
  registrations: Registration[];
}

export default function ViewRegistrationsPage() {
  const router = useRouter();
  const { isStaff, isLoading: roleLoading } = useRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    // Only redirect if role loading is complete and user is not staff
    if (!roleLoading && !isStaff) {
      router.push('/unauthorised');
      return;
    }

    // Only fetch data if user is staff
    if (!roleLoading && isStaff) {
      const fetchRegistrations = async () => {
        try {
          console.log('Fetching registrations...');
          const response = await fetch('/api/registrations/staff');
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API response not ok:', response.status, response.statusText, errorData);
            throw new Error(errorData.error || 'Failed to fetch registrations');
          }

          const data = await response.json();
          console.log('Received data:', {
            eventsCount: data.events?.length || 0,
            events: data.events?.map((e: Event) => ({
              id: e.id,
              name: e.name,
              registrationsCount: e.registrations?.length || 0
            }))
          });

          setEvents(data.events || []);
        } catch (err) {
          console.error('Error in fetchRegistrations:', err);
          setError(err instanceof Error ? err.message : 'Failed to load registrations');
        } finally {
          setLoading(false);
        }
      };

      fetchRegistrations();
    }
  }, [isStaff, roleLoading, router]);

  // Show loading state while checking role
  if (roleLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  // Don't render anything if not staff (will be redirected)
  if (!isStaff) {
    return null;
  }

  // Get all registrations for the selected event or all events
  const registrations = selectedEvent === 'all'
    ? events.flatMap(event => event.registrations.map(reg => ({ ...reg, eventName: event.name, eventDate: event.startDate })))
    : events
        .find(event => event.id === selectedEvent)
        ?.registrations.map(reg => ({ ...reg, eventName: events.find(e => e.id === selectedEvent)?.name || '', eventDate: events.find(e => e.id === selectedEvent)?.startDate || '' })) || [];

  console.log('Filtered registrations:', {
    selectedEvent,
    registrationsCount: registrations.length,
    registrations: registrations.map(r => ({
      id: r.id,
      eventName: r.eventName,
      userName: r.userName
    }))
  });

  if (loading) {
    return <LoadingSpinner text="Loading registrations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        title="View Registrations" 
        subtitle="Manage event registrations and attendees" 
      />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {error && (
              <div className="p-4 bg-red-50 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <div className="px-4 py-3 border-b border-gray-200">
              <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Event
              </label>
              <select
                id="eventFilter"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              >
                <option value="all">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({format(new Date(event.startDate), 'PP')})
                  </option>
                ))}
              </select>
            </div>

            {registrations.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">No registrations found for {selectedEvent === 'all' ? 'any events' : 'this event'}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{registration.userName}</div>
                          <div className="text-sm text-gray-500">{registration.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <Link href={`/events/${registration.eventId}`} className="text-indigo-600 hover:text-indigo-900">
                              {registration.eventName}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(registration.eventDate), 'PPP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(registration.registeredAt), 'PPp')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${registration.status === 'registered' ? 'bg-green-100 text-green-800' : 
                              registration.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              registration.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.ticketCount}
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
    </div>
  );
} 