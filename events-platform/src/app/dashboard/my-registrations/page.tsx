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
  eventEndDate?: string;
  eventVenue: string;
  eventSource: 'platform' | 'ticketmaster';
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended' | 'ended';
  ticketCount: number;
  ticketUrl?: string;
}

export default function MyRegistrationsPage() {
  const router = useRouter();
  const { user, isLoading: roleLoading } = useRole();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch data if user is logged in
    if (!roleLoading && user) {
      const fetchRegistrations = async () => {
        try {
          console.log('Fetching my registrations...');
          const response = await fetch('/api/registrations/my-registrations');
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API response not ok:', response.status, response.statusText, errorData);
            throw new Error(errorData.error || 'Failed to fetch registrations');
          }

          const data = await response.json();
          console.log('Received registrations:', {
            count: data.registrations?.length || 0,
          });

          setRegistrations(data.registrations || []);
        } catch (err) {
          console.error('Error in fetchRegistrations:', err);
          setError(err instanceof Error ? err.message : 'Failed to load registrations');
        } finally {
          setLoading(false);
        }
      };

      fetchRegistrations();
    }
  }, [user, roleLoading]);

  // Show loading state while checking role
  if (roleLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  // Redirect if not logged in
  if (!roleLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Loading registrations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader 
        title="My Registrations" 
        subtitle="View your event registrations" 
      />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {error && (
              <div className="p-4 bg-red-50 text-red-700">
                <p>{error}</p>
              </div>
            )}

            {registrations.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">You haven't registered for any events yet.</p>
                <Link
                  href="/events"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Events
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
                          Tickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{registration.eventName}</div>
                            <div className="text-sm text-gray-500">
                              Registered on {format(new Date(registration.registeredAt), 'PP')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(registration.eventDate), 'PPp')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.eventVenue}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                registration.status === 'registered'
                                  ? 'bg-green-100 text-green-800'
                                  : registration.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : registration.status === 'ended'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.ticketCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/events/${registration.eventId}`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View Event
                            </Link>
                            {registration.ticketUrl && (
                              <a
                                href={registration.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Ticket
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-900">
                      {registrations.length} Registration{registrations.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {registration.eventName}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Registered on {format(new Date(registration.registeredAt), 'PP')}
                            </p>
                          </div>
                          <span
                            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                              registration.status === 'registered'
                                ? 'bg-green-100 text-green-800'
                                : registration.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : registration.status === 'ended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-900">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {format(new Date(registration.eventDate), 'PPp')}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {registration.eventVenue}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {registration.ticketCount} Ticket{registration.ticketCount !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/events/${registration.eventId}`}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                          >
                            View Event
                          </Link>
                          {registration.ticketUrl && (
                            <a
                              href={registration.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            >
                              View Ticket
                            </a>
                          )}
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