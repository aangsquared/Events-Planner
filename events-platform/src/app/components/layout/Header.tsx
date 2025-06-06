'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home,
  Calendar,
  Ticket,
  PlusCircle,
  Edit2,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  User,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import type { User as NextAuthUser } from "next-auth"

const NavButton = ({ 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean;
}) => (
  <Link
    href={href}
    className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors
      ${isActive 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
      }`}
    aria-label={label}
  >
    <Icon size={24} className="mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

const UserDropdown = ({ 
  user, 
  isStaff 
}: { 
  user: NextAuthUser | null | undefined;
  isStaff: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {user?.image ? (
            <Image
              src={user.image}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <User size={20} className="text-gray-500" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50"
          role="menu"
        >
          <Link
            href="/account/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} className="mr-3" />
            Account Settings
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: '/auth/signin' });
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            role="menuitem"
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({
  isOpen,
  onClose,
  isStaff,
  currentPath,
}: {
  isOpen: boolean;
  onClose: () => void;
  isStaff: boolean;
  currentPath: string;
}) => {
  const navItems = isStaff
    ? [
        { href: '/staff/events/create', icon: PlusCircle, label: 'Create Event' },
        { href: '/staff/events', icon: Edit2, label: 'Manage Events' },
        { href: '/staff/registrations', icon: Users, label: 'View Registrations' },
      ]
    : [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/events/browse', icon: Calendar, label: 'Browse Events' },
        { href: '/registrations', icon: Ticket, label: 'My Registrations' },
      ];

  return (
    <div
      className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <nav className="relative w-64 max-w-sm bg-white h-full shadow-xl flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                currentPath === item.href
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={onClose}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default function Header() {
  const { user, isStaff } = useRole();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  const navItems = isStaff
    ? [
        { href: '/staff/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/staff/events/create', icon: PlusCircle, label: 'Create Event' },
        { href: '/staff/events', icon: Edit2, label: 'Manage Events' },
        { href: '/staff/registrations', icon: Users, label: 'View Registrations' },
      ]
    : [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/events', icon: Calendar, label: 'Browse Events' },
        { href: '/dashboard/registrations', icon: Ticket, label: 'My Registrations' },
      ];

  return (
    <header className="bg-white border-b h-16 fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href={isStaff ? '/staff/dashboard' : '/dashboard'} className="flex-shrink-0">
          <span className="text-xl font-bold text-gray-900">Events Planner</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavButton
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        {/* User Menu */}
        <UserDropdown user={user} isStaff={isStaff} />

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isStaff={isStaff}
          currentPath={pathname}
        />
      </div>
    </header>
  );
} 