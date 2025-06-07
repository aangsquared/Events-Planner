// src/app/dashboard/page.tsx
"use client"

import { useRole } from "../hooks/useRole"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import LoadingSpinner from "../components/common/LoadingSpinner"

interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended' | 'ended';
}

export default function Dashboard() {
  const { user, role, isStaff } = useRole()
  const [recentActivity, setRecentActivity] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/registrations/activity');
        if (response.ok) {
          const data = await response.json();
          setRecentActivity(data.registrations);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActivity();
      // Refresh activity every 30 seconds
      const intervalId = setInterval(fetchActivity, 30000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isStaff ? "Staff Dashboard" : "My Events"}
              </h1>
              <p className="text-gray-600">
                Welcome back, {user.name}! ({role})
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isStaff ? (
            // Staff Dashboard
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create Event Card */}
              <Link href="/staff/events/create" className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Create Event
                        </h3>
                        <p className="text-sm text-gray-500">
                          Add a new event to the platform
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Manage Events Card */}
              <Link href="/dashboard/events" className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Manage Events
                        </h3>
                        <p className="text-sm text-gray-500">
                          View and edit your events
                        </p>
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
                        <svg
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          View Registrations
                        </h3>
                        <p className="text-sm text-gray-500">
                          See who's registered for events
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            // User Dashboard
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Browse Events Card */}
              <Link href="/events" className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Browse Events
                        </h3>
                        <p className="text-sm text-gray-500">
                          Find and register for events
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* My Registrations Card */}
              <Link href="/dashboard/my-registrations" className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          My Registrations
                        </h3>
                        <p className="text-sm text-gray-500">
                          View your event registrations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Recent Activity Section */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {isStaff
                    ? "Your latest event management activities"
                    : "Your recent event registrations"}
                </p>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="px-4 py-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading activity...</p>
                    </div>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="px-4 py-4 text-center text-gray-500">
                    No recent activity to display
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/events/${activity.eventId}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              {activity.eventName}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {activity.eventVenue} • {format(new Date(activity.eventDate), 'PPP')}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${activity.status === 'registered' ? 'bg-green-100 text-green-800' : 
                                activity.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                activity.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Registered on {format(new Date(activity.registeredAt), 'PP')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
