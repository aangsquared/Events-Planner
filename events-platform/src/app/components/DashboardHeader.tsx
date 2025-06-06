'use client';

import { useRole } from "../hooks/useRole"

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, role } = useRole()

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
        </div>
      </div>
    </header>
  )
} 