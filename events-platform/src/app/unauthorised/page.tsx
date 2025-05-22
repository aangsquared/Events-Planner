"use client"

import Link from "next/link"
import { useRole } from "../hooks/useRole"

export default function UnauthorizedPage() {
  const { user, role } = useRole()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-1 text-xs text-gray-500">
              Current role: <span className="font-medium">{role}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Link
              href="/dashboard"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Dashboard
            </Link>
          </div>

          <div>
            <Link
              href="/events"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Events
            </Link>
          </div>

          {role === "user" && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Need to create events? Contact an administrator to upgrade your
                account to staff.
              </p>
              <a
                href="mailto:admin@yourplatform.com"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
