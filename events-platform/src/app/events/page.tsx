import React from "react"

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Event cards will be added here */}
        <div className="p-4 border rounded-lg shadow-sm">
          <p className="text-gray-500">No events available yet.</p>
        </div>
      </div>
    </div>
  )
}
