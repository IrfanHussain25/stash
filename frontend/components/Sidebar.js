// frontend/components/Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Component, 
  Info, 
  ChevronLeft,
  User,
  Settings,
  Sparkles,
  Brain
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Glass morphism background
function GlassBackground({ isCollapsed }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/5 opacity-50" />
      <div className="absolute inset-0 backdrop-blur-xl bg-gray-950/90 border-r border-gray-800/60" />
      <div className="absolute inset-0 opacity-[0.015]"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} />
    </>
  );
}

// Floating indicator for active state
function ActivePulse({ isActive }) {
  if (!isActive) return null;
  return (
    <>
      <div className="absolute left-0 top-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-indigo-400 rounded-r-full -translate-y-1/2" />
      <div className="absolute left-0 top-1/2 w-1 h-6 bg-indigo-400 rounded-r-full -translate-y-1/2 animate-pulse" />
    </>
  );
}

// Advanced NavItem with micro-interactions
function NavItem({ href, label, icon: Icon, isCollapsed, badge }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative px-3 ${isCollapsed ? 'py-2' : 'py-1.5'}`}>
      <Link
        href={href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex items-center rounded-xl transition-all duration-300 group
          border border-transparent
          ${isActive 
            ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 text-white shadow-lg shadow-indigo-500/10 border-indigo-500/30'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700/50 hover:shadow-lg'
          }
          ${isCollapsed ? 'justify-center w-12 h-12' : 'justify-start w-full h-12 pl-4 pr-3'}
          overflow-hidden`}
      >
        <ActivePulse isActive={isActive} />
        <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-500/5 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl
          ${isActive ? 'opacity-100' : ''}`} />
        
        {/* Icon with glow effect */}
        <div className={`relative z-10 flex items-center justify-center
          ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
          transition-colors duration-300`}>
          <Icon size={20} className="relative z-10" />
          {isActive && (
            <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full scale-125" />
          )}
        </div>
        
        {/* Label and badge */}
        {/* --- THIS IS THE CORRECTED LINE FOR ALIGNMENT --- */}
        <div className={`relative z-10 flex items-center justify-between 
          transition-all duration-300 overflow-hidden
          ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100 ml-3 flex-1'}`}>
        {/* --- The `flex-1` is now *only* applied when expanded --- */}
          
          <span className="font-medium text-sm whitespace-nowrap tracking-wide">{label}</span>
          
          {badge && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium min-w-[20px] text-center
              ${isActive ? 'bg-white/20 text-white' : 'bg-gray-700/50 text-gray-300'}
            `}>
              {badge}
            </span>
          )}
        </div>

        {/* Enhanced tooltip for collapsed state */}
        {isCollapsed && isHovered && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
            <div className="font-semibold">{label}</div>
            {badge && (
              <div className="text-xs text-gray-400 mt-0.5">{badge} items</div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

// Section divider
function SectionDivider({ label, isCollapsed }) {
  if (isCollapsed) return null;
  return (
    <div className="px-4 py-3">
      <div className="flex items-center space-x-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
          {label}
        </span>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1" />
      </div>
    </div>
  );
}

// AI Status Indicator
function AIStatus({ isCollapsed }) {
  const isProcessing = true; // We can make this dynamic later
  
  return (
    <div className={`mx-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/30 
      border border-gray-700/30 backdrop-blur-sm
      ${isCollapsed ? 'hidden' : 'block'}`}>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className={`w-2 h-2 ${isProcessing ? 'bg-green-400 animate-ping' : 'bg-gray-500'} rounded-full absolute`} />
          <div className={`w-2 h-2 ${isProcessing ? 'bg-green-400' : 'bg-gray-500'} rounded-full relative`} />
        </div>
        <span className="text-xs font-medium text-gray-300">
          {isProcessing ? "AI Active" : "AI Idle"}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {isProcessing ? "Processing new items..." : "All items synced"}
      </div>
    </div>
  );
}

export default function Sidebar({ isCollapsed, onToggle }) {
  const [mounted, setMounted] = useState(false);

  // --- Simplified Nav Items for *our* app ---
  const mainNavItems = [
    { href: '/home', label: 'Home', icon: LayoutDashboard },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/categories', label: 'Categories', icon: Component },
  ];

  // const bottomNavItems = [
  //   { href: '/settings', label: 'Settings', icon: Settings },
  //   { href: '/about', label: 'About', icon: Info },
  // ];
  // --- END Simplified Nav ---

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevents hydration mismatch for the complex layout
  if (!mounted) {
    return (
      <aside className={`relative flex flex-col bg-gray-950 border-r border-gray-800 text-white h-screen
        ${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-500`}>
        <div className="animate-pulse p-4">...</div>
      </aside>
    );
  }

  return (
    <aside className={`relative flex flex-col text-white h-screen
      transition-all duration-500 ease-out
      ${isCollapsed ? 'w-20' : 'w-72'}`}>
      
      <GlassBackground isCollapsed={isCollapsed} />
      
      {/* Header */}
      <div className={`relative flex items-center h-20 shrink-0 border-b border-gray-800/40
        ${isCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'}`}>
        
        {/* Logo */}
        <div className={`flex items-center transition-all duration-500
          ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          
          <div className={`relative flex items-center justify-center 
            bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl 
            shadow-lg shadow-indigo-500/25 transition-all duration-500
            ${isCollapsed ? 'w-12 h-12' : 'w-14 h-14'}`}>
            <Sparkles 
              size={isCollapsed ? 20 : 24} 
              className="text-white drop-shadow-sm" 
            />
            <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-2xl scale-110" />
          </div>
          
          <div className={`transition-all duration-500 overflow-hidden
            ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-4'}`}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Stash
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 tracking-wide">Zero-Effort Save</p>
          </div>
        </div>
      </div>

      

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <SectionDivider label="Main" isCollapsed={isCollapsed} />
        {mainNavItems.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      {/* <div className="border-t border-gray-800/40 py-4">
        <SectionDivider label="Account" isCollapsed={isCollapsed} />
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </div> */}

      {/* --- The Corrected "Hanging" button --- */}
      <button
        onClick={onToggle}
        className={`absolute top-22 -right-3.5 z-50 flex items-center justify-center h-7 w-7
          bg-gray-800/80 backdrop-blur-sm border border-gray-700/60 text-gray-400 
          rounded-full transition-all duration-300
          hover:bg-gray-700/80 hover:text-white hover:border-gray-600/60 
          hover:scale-110 focus:outline-none shadow-xl`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft 
          size={16} 
          className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>

    </aside>
  );
}