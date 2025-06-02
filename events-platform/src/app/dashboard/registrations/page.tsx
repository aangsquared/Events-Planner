'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';

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
  const { isStaff } = useRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  // Redirect if not staff
  if (!isStaff) {
    router.push('/unauthorized');
    return null;
  }

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/registrations/staff');
        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }
        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        setError('Failed to load registrations');
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Get all registrations for the selected event or all events
  const registrations = selectedEvent === 'all'
    ? events.flatMap(event => event.registrations.map(reg => ({ ...reg, eventName: event.name, eventDate: event.startDate })))
    : events
        .find(event => event.id === selectedEvent)
        ?.registrations.map(reg => ({ ...reg, eventName: events.find(e => e.id === selectedEvent)?.name || '', eventDate: events.find(e => e.id === selectedEvent)?.startDate || '' })) || [];

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
              <h1 className="text-2xl font-semibold text-gray-900">View Registrations</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage event registrations and attendees
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <div className="px-4 py-3 border-b border-gray-200">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
  );
} 