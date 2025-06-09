'use client';

import { useState, useEffect, useRef } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // If user is not authenticated, show sign in button
  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
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
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name || 'User'}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-[110]"
          role="menu"
        >
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
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  isStaff: boolean;
  currentPath: string;
  user: NextAuthUser | null | undefined;
}) => {
  const navItems = !user 
    ? [] // No navigation items for anonymous users
    : isStaff
    ? [
        { href: '/staff/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/staff/events/create', icon: PlusCircle, label: 'Create Event' },
        { href: '/staff/events', icon: Edit2, label: 'Manage Events' },
        { href: '/staff/registrations', icon: Users, label: 'View Registrations' },
      ]
    : [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/events', icon: Calendar, label: 'Browse Events' },
        { href: '/dashboard/my-registrations', icon: Ticket, label: 'My Registrations' },
      ];

  return (
    <>
      {/* Invisible overlay for click-outside-to-close functionality */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[45]" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Slide-out navigation menu */}
      <nav 
        className={`fixed top-0 left-0 w-64 max-w-sm bg-white h-full shadow-xl flex flex-col z-[50] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
          {navItems.length > 0 ? (
            navItems.map((item) => (
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
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">Sign in to access navigation menu</p>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default function Header() {
  const { user, isStaff } = useRole();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Don't render header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  // Navigation items based on authentication and role
  const navItems = !user 
    ? [] // No navigation items for anonymous users
    : isStaff
    ? [
        { href: '/staff/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/staff/events/create', icon: PlusCircle, label: 'Create Event' },
        { href: '/staff/events', icon: Edit2, label: 'Manage Events' },
        { href: '/staff/registrations', icon: Users, label: 'View Registrations' },
      ]
    : [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/events', icon: Calendar, label: 'Browse Events' },
        { href: '/dashboard/my-registrations', icon: Ticket, label: 'My Registrations' },
      ];

  const logoHref = !user ? '/events' : isStaff ? '/staff/dashboard' : '/dashboard';

  return (
    <header className="bg-white border-b h-16 fixed top-0 left-0 right-0 w-full z-[100] shadow-sm">
      <div className="w-full h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-none lg:max-w-7xl lg:mx-auto min-w-0">
        {/* Mobile menu button */}
        {navItems.length > 0 && (
          <div className="flex items-center md:hidden flex-shrink-0">
            <button
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        {/* Logo - Always centered on mobile, left-aligned on desktop */}
        <div className="flex-1 flex justify-center md:justify-start md:flex-none min-w-0">
          <Link href={logoHref} className="flex-shrink-0">
            <span className="text-xl font-bold text-gray-900 truncate">Events Planner</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
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

        {/* User Menu - Always visible */}
        <div className="flex-shrink-0">
          <UserDropdown user={user} isStaff={isStaff} />
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isStaff={isStaff}
          currentPath={pathname}
          user={user}
        />
      </div>
    </header>
  );
} 