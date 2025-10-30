// frontend/components/Header.js
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import { LogOut, User, Settings, Search, Sparkles, Zap, ChevronDown } from 'lucide-react';

export default function Header({ userEmail, logoutFunction }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Added check for isDropdownOpen to prevent unnecessary checks
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]); // Dependency added

  return (
    // Removed border-b as the new design might not need it, adjust if needed
    <header className="relative z-50 p-4 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60 mb-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Left Section - Logo & Title */}
        <div className="flex items-center space-x-4">
          {/* Animated Logo */}
          <div className="relative">
             {/* Gradient matches login page */}
            
          </div>
          
          
        </div>

        {/* Right Section - Search Icon & User Controls */}
        <div className="flex items-center space-x-4">
          
          {/* NEW: Search Icon Button Linking to /search */}
          <Link href="/search" legacyBehavior>
            <a className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-300 hover:scale-105"
               aria-label="Search Stash">
              <Search size={18} />
            </a>
          </Link>

          {/* REMOVED: Notifications Bell */}

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <User size={16} className="text-white" />
              </div>
              
              {/* User Email (Truncated) - Consider hiding on smaller screens if needed */}
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-medium text-white leading-tight truncate max-w-[120px]">
                  {userEmail}
                </p>
              </div>
              
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-300 mr-1 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* User Summary */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      {/* Display full email here */}
                      <p className="text-sm font-semibold text-white truncate">{userEmail}</p> 
                    </div>
                  </div>
                </div>

                {/* Menu Items - Simplified */}
                <div className="p-2">
                  <Link href="/settings" legacyBehavior>
                    <a 
                      onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                      className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200">
                      <Settings size={18} />
                      <span>Settings</span>
                    </a>
                  </Link>
                </div>

                {/* Logout Section */}
                <div className="p-2 border-t border-gray-800">
                  <button
                    onClick={() => {
                        logoutFunction();
                        setIsDropdownOpen(false); // Close dropdown on logout
                    }}
                    className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REMOVED: Quick Stats Bar */}
    </header>
  );
}