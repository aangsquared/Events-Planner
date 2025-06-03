'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/app/hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';
import DashboardHeader from '@/app/components/DashboardHeader';

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
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader title="My Registrations" subtitle="Loading..." />
        <div className="py-8">
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
      </div>
    );
  }

  // Redirect if not logged in
  if (!roleLoading && !user) {
    router.push('/auth/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader title="My Registrations" subtitle="Loading..." />
        <div className="py-8">
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
      </div>
    );
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 