"use client"

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '../hooks/useRole';

export default function UnauthorisedPage() {
  const router = useRouter();
  const { user, role, isLoading, isAuthenticated } = useRole();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Unauthorised Access
            </h2>

            {isLoading ? (
              <p className="mt-2 text-sm text-gray-600">
                Checking your session...
              </p>
            ) : isAuthenticated ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  You are signed in as:
                </p>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">Role: {role || 'No role assigned'}</p>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  You don't have permission to access this page. This might be because:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside text-left">
                  <li>You need a different role to access this page</li>
                  <li>Your session needs to be refreshed</li>
                  <li>You're trying to access a restricted area</li>
                </ul>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  You are not signed in
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Please sign in to access this page. If you believe you should have access, make sure to use the correct account.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Page
            </button>
            {!isAuthenticated && (
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
