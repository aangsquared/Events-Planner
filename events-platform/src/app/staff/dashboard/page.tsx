'use client';

import { useEffect, useState } from 'react';
import { useRole } from '../../hooks/useRole';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlusCircle, CalendarDays, Users, Clock } from 'lucide-react';

interface EventSummary {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

interface RegistrationSummary {
  totalRegistrations: number;
  todayRegistrations: number;
  pendingRegistrations: number;
}

export default function StaffDashboard() {
  const { user, isStaff } = useRole();
  const [eventStats, setEventStats] = useState<EventSummary | null>(null);
  const [registrationStats, setRegistrationStats] = useState<RegistrationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch event statistics
        const eventResponse = await fetch('/api/staff/events/stats');
        const eventData = await eventResponse.json();
        setEventStats(eventData);

        // Fetch registration statistics
        const registrationResponse = await fetch('/api/staff/registrations/stats');
        const registrationData = await registrationResponse.json();
        setRegistrationStats(registrationData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isStaff) {
      fetchDashboardData();
    }
  }, [user, isStaff]);

  if (!isStaff) {
    return <div>Access denied. Staff only area.</div>;
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarDays className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{eventStats?.totalEvents || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{registrationStats?.totalRegistrations || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Registrations</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{registrationStats?.todayRegistrations || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Event Card */}
            <Link href="/staff/events/create" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PlusCircle className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Create Event</h3>
                      <p className="text-sm text-gray-500">Add a new event to the platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Manage Events Card */}
            <Link href="/staff/events" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarDays className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Manage Events</h3>
                      <p className="text-sm text-gray-500">View and edit your events</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* View Registrations Card */}
            <Link href="/staff/registrations" className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">View Registrations</h3>
                      <p className="text-sm text-gray-500">See who's registered for events</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 