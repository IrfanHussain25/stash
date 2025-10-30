// frontend/app/(app)/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '../UserContext'; // Path goes up one level
import Sidebar from '../../../components/Sidebar';

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userEmail, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This protects all pages inside (app)
    if (!isLoading && !userEmail) {
      router.push('/');
    }
  }, [isLoading, userEmail, router]);

  if (isLoading || !userEmail) {
    // Show a loading screen or blank screen while checking auth
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  // If we are here, the user is logged in. Show the layout.
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* --- 1. The Sidebar --- */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* --- 2. The Main Content (Home, Search, etc.) --- */}
      <main className="flex-1 overflow-y-auto" key={pathname}>
        {children}
      </main>
    </div>
  );
}