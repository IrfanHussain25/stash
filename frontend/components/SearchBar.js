// frontend/components/Sidebar.js

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Component, // A good icon for "Categories"
  Info, 
  ChevronLeft 
} from 'lucide-react';
import { useState } from 'react'; // We will manage state in the parent

// Reusable NavItem component
function NavItem({ href, label, icon: Icon, isCollapsed }) {
  const pathname = usePathname();
  // Check if the current path starts with the link's href.
  // This handles nested routes (e.g., /categories/books)
  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`
        flex items-center p-3 rounded-lg text-gray-300 transition-colors
        hover:bg-gray-700 hover:text-white
        ${isActive ? 'bg-blue-600 text-white shadow-lg' : ''}
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
      title={isCollapsed ? label : undefined} // Show tooltip when collapsed
    >
      <Icon size={22} className="shrink-0" />
      <span 
        className={`
          ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-200
          ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
        `}
      >
        {label}
      </span>
    </Link>
  );
}

// The main Sidebar component
export default function Sidebar({ isCollapsed, onToggle }) {
  const navItems = [
    { href: '/home', label: 'Home', icon: LayoutDashboard },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/categories', label: 'Categories', icon: Component },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    // Sidebar container
    <aside 
      className={`
        relative flex flex-col bg-gray-800 text-white h-screen
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo and App Title */}
      <div className="flex items-center h-16 border-b border-gray-700 px-4 shrink-0">
        <div 
          className={`
            flex items-center justify-center overflow-hidden
            transition-all duration-200
            ${isCollapsed ? 'w-full' : 'w-auto'}
          `}
        >
          {/* Your Logo/Icon Here */}
          <span className="text-2xl font-bold">S</span>
        </div>
        <span 
          className={`
            ml-2 text-2xl font-bold whitespace-nowrap overflow-hidden
            transition-all duration-200
            ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
          `}
        >
          Stash
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          absolute top-14 -right-3.5 z-10
          flex items-center justify-center h-7 w-7
          bg-gray-700 text-white rounded-full
          shadow-md transition-all duration-300
          hover:bg-blue-600 focus:outline-none
        `}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft 
          size={18} 
          className={`
            transition-transform duration-300
            ${isCollapsed ? 'rotate-180' : 'rotate-0'}
          `} 
        />
      </button>

      {/* Optional: Footer or User Info Section */}
      <div className="p-4 border-t border-gray-700 shrink-0">
        {/* You could put user info here, but your Header.js already has it. */}
        {/* Keeping this area clean for now. */}
      </div>
    </aside>
  );
}