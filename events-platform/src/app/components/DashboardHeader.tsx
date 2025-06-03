'use client';

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useRole } from "../hooks/useRole"

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, role, isStaff } = useRole()
  const pathname = usePathname()
  const isOnDashboard = pathname === '/dashboard'

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-gray-600">
              {subtitle || `Welcome back, ${user?.name || 'User'}! (${role})`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {!isOnDashboard && (
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            )}
            {isStaff ? (
              <>
                <Link
                  href="/events/create"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Event
                </Link>
                <Link
                  href="/dashboard/events"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Manage Events
                </Link>
                <Link
                  href="/dashboard/registrations"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  View Registrations
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/events"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Browse Events
                </Link>
                <Link
                  href="/dashboard/my-registrations"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  My Registrations
                </Link>
              </>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 