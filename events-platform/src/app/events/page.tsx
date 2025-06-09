"use client"

import { useState, useEffect, useCallback } from "react"
import { Event, EventFilters } from "@/app/types/event"
import { useRole } from "@/app/hooks/useRole"
import Link from "next/link"
import Image from "next/image"
import ErrorBoundary from "@/app/components/ErrorBoundary"
import { getEventImage } from "@/app/utils/imageUtils"
import DashboardHeader from "@/app/components/DashboardHeader"

interface EventsResponse {
  events: Event[]
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
  filters: EventFilters
}

export default function EventsPage() {
  const { user, isStaff } = useRole()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  })

  const [filters, setFilters] = useState<EventFilters>({
    source: "all",
    search: "",
    category: "",
    city: "",
  })

  const fetchEvents = useCallback(
    async (page = 0) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          size: pagination.size.toString(),
        })

        if (filters.search) params.append("search", filters.search)
        if (filters.category) params.append("category", filters.category)
        if (filters.city) params.append("city", filters.city)
        if (filters.source && filters.source !== "all")
          params.append("source", filters.source)

        const response = await fetch(`/api/events?${params}`)

        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }

        const data: EventsResponse = await response.json()

        if (page === 0) {
          setEvents(data.events)
        } else {
          setEvents((prev) => [...prev, ...data.events])
        }

        setPagination(data.pagination)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination.size]
  )

  useEffect(() => {
    fetchEvents(0)
  }, [fetchEvents, filters])

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const loadMore = () => {
    if (pagination.page < pagination.totalPages - 1) {
      fetchEvents(pagination.page + 1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (event: Event) => {
    if (!event.price) return "Price TBA";
    if (Number(event.price.amount) === 0) return "Free";
    return `${event.price.currency} ${event.price.amount}`;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          title="Events" 
          subtitle="Discover events from Ticketmaster and our platform" 
        />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search events..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts & Theatre">Arts & Theatre</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Family">Family</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city || ""}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  placeholder="Enter city..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={filters.source || "all"}
                  onChange={(e) => handleFilterChange("source", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="all">All Sources</option>
                  <option value="ticketmaster">Ticketmaster</option>
                  <option value="platform">Our Platform</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <p className="text-gray-600">
              Showing {events.length} of {pagination.totalElements} events
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {loading && events.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Event Image */}
                  <Link href={`/events/${event.id}`} className="block">
                    <div className="h-48 bg-gray-200 relative cursor-pointer">
                      {event.images.length > 0 ? (
                        <div className="relative h-full">
                          <Image
                            src={getEventImage(event.images)}
                            alt={event.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/images/event-placeholder.jpg';
                              img.onerror = null;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Source Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.source === "ticketmaster"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {event.source === "ticketmaster"
                            ? "Ticketmaster"
                            : "Platform"}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {event.status !== "active" && (
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : event.status === "postponed"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {event.status.charAt(0).toUpperCase() +
                              event.status.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Event Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {event.name}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{event.category}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(event.startDate)}
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.venue.name}, {event.venue.city}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(event)}
                      </div>

                      <div className="flex space-x-2">
                        {event.source === "ticketmaster" ? (
                          <Link
                            href={`/events/${event.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            View Details
                          </Link>
                        ) : (
                          <Link
                            href={`/events/${event.id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && pagination.page < pagination.totalPages - 1 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Load More Events
              </button>
            </div>
          )}

          {/* Loading More */}
          {loading && events.length > 0 && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading more events...
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && events.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No events found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
              {isStaff && (
                <div className="mt-6">
                  <Link
                    href="/staff/events/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New Event
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
