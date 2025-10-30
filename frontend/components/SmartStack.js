// // frontend/components/SmartStack.js
// 'use client'; 

// import React, { useRef, useState, useEffect } from 'react';
// import ItemCard from './ItemCard';
// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   ArrowRight, 
//   Grid3X3,
//   List,
//   Sparkles,
//   Clock,
//   AlertCircle,
//   FolderOpen,
// } from 'lucide-react'; 
// import Link from 'next/link'; 

// export default function SmartStack({ 
//   title, 
//   items, 
//   viewMode = 'grid', 
//   selectedItems = new Set(),
//   onItemSelect 
// }) {
//   const scrollRef = useRef(null);
//   const [showScrollButtons, setShowScrollButtons] = useState(false);
//   const [isScrolling, setIsScrolling] = useState(false);
//   const [stackViewMode, setStackViewMode] = useState(viewMode); 

//   // FIXED: Horizontal scrolling detection
//   useEffect(() => {
//     const checkScrollable = () => {
//       if (stackViewMode === 'grid' || stackViewMode === 'carousel') {
//         const container = scrollRef.current;
//         if (container) {
//           // FIXED: Proper overflow detection with container check
//           const hasOverflow = container.scrollWidth > container.clientWidth;
//           setShowScrollButtons(hasOverflow);
//         } else {
//           setShowScrollButtons(false);
//         }
//       } else {
//         setShowScrollButtons(false);
//       }
//     };

//     checkScrollable();
    
//     // FIXED: Use requestAnimationFrame for better timing
//     const rafId = requestAnimationFrame(() => {
//       checkScrollable();
//     });
    
//     // FIXED: Add event listener with proper cleanup
//     window.addEventListener('resize', checkScrollable);
    
//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener('resize', checkScrollable);
//     };
//   }, [items, stackViewMode]);

//   // Get total count and items to show
//   const totalItems = items ? items.length : 0;
  
//   // Define categories and slugs
//   const nonLinkableTitles = ['Recently Added', 'Processing', 'Failed', 'Other'];
//   const isLinkableCategory = !nonLinkableTitles.includes(title);
  
//   const slug = title.toLowerCase().replace(/ & /g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
//   // Limit items *only* if showing the "View All" card logic makes sense (i.e., linkable category)
//   // For grid/list view, we now show all items. Carousel still limits.
//   const shouldLimitItems = stackViewMode === 'carousel' && isLinkableCategory;
//   const hasMoreItems = totalItems > 10;
//   const itemsToShow = shouldLimitItems ? (items ? items.slice(0, 10) : []) : (items || []); 

//   // Don't render if no items originally
//   if (!items || items.length === 0) { 
//     return null; 
//   }

//   // FIXED: Simplified scroll handler
//   const scroll = (direction) => {
//     const container = scrollRef.current;
//     if (container) {
//       setIsScrolling(true);
//       const scrollAmount = container.offsetWidth * 0.8; 
      
//       container.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth',
//       });

//       // FIXED: Simple timeout without complex event listeners
//       setTimeout(() => {
//         setIsScrolling(false);
//       }, 400);
//     }
//   };

//   // Get icon and color for stack type
//   const getStackConfig = () => {
//     const configs = {
//       'Processing': { icon: Clock, color: 'yellow', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
//       'Failed': { icon: AlertCircle, color: 'red', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
//       'Recently Added': { icon: Sparkles, color: 'cyan', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
//       'Other': { icon: FolderOpen, color: 'gray', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' },
//       'default': { icon: FolderOpen, color: 'indigo', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' } 
//     };
//     return configs[title] || configs.default;
//   };

//   const stackConfig = getStackConfig();
//   const StackIcon = stackConfig.icon;

//   // Format title
//   const formatTitle = (title) => {
//     const formats = {
//       'Processing': '⏳ Processing',
//       'Failed': '❌ Failed Items',
//       'Recently Added': '✨ Recently Added',
//       'Other': '📁 Miscellaneous',
//       'default': title.endsWith('y') ? title.slice(0, -1) + 'ies' : title + 's'
//     };
//     return formats[title] || formats.default;
//   };

//   const stackTitle = formatTitle(title);
//   // Show scroll buttons only in horizontal modes if needed
//   const showHorizontalScrollButtons = (stackViewMode === 'grid' || stackViewMode === 'carousel') && showScrollButtons;


//   // --- Combined Horizontal Scrolling View ---
//   // Both 'grid' and 'carousel' modes will use this layout now
//   const HorizontalScrollingView = () => (
//     <div className="relative"> {/* Needed for absolute positioning of buttons */}
//       <div
//         ref={scrollRef}
//         // *** THIS IS THE FIX ***
//         className="flex flex-nowrap overflow-x-auto scroll-smooth scrollbar-hide gap-4 py-4 px-2"
//         style={{ 
//           WebkitOverflowScrolling: 'touch',
//           scrollbarWidth: 'none',
//           msOverflowStyle: 'none'
//         }}
//       >
//         {/* Use itemsToShow (limited for carousel, all for grid if needed) */}
//         {itemsToShow.map(item => ( 
//           <div key={item.id} className="w-80 lg:w-96 flex-shrink-0">
//             <ItemCard 
//               item={item} 
//               // Pass the current mode down for potential style differences in ItemCard
//               viewMode={stackViewMode} 
//               isSelected={selectedItems.has(item.id)}
//               onSelect={() => onItemSelect && onItemSelect(item.id)}
//             />
//           </div>
//         ))}

//         {/* Show "View All" card only if items were limited (carousel mode logic) */}
//         {shouldLimitItems && hasMoreItems && isLinkableCategory && (
//           <div className="w-80 lg:w-96 flex-shrink-0">
//             <Link
//               href={`/categories/${slug}`}
//               className="flex flex-col items-center justify-center h-full min-h-[200px]
//                           bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-dashed border-gray-700
//                           text-gray-400 transition-all duration-300 group
//                           hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-400
//                           hover:scale-105 hover:shadow-xl" 
//             >
//               <div className="p-4 bg-indigo-500/10 rounded-xl mb-3 group-hover:scale-110 transition-transform">
//                 <ArrowRight size={28} className="text-indigo-400" />
//               </div>
//               <span className="font-semibold text-lg text-center">View All</span>
//               <span className="text-sm text-center mt-1">{totalItems} items</span>
//               <span className="text-xs text-gray-500 mt-2 text-center">Explore complete collection</span>
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Scroll Buttons */}
//       {showHorizontalScrollButtons && (
//         <>
//           <button
//             onClick={() => scroll('left')}
//             disabled={isScrolling}
//             className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 ml-2 
//                           bg-gray-900/80 backdrop-blur-sm text-white rounded-full p-3
//                           transition-all duration-300 hover:scale-110
//                           hover:bg-indigo-500 hover:shadow-lg shadow-indigo-500/25
//                           disabled:opacity-50 disabled:cursor-not-allowed
//                           ${isScrolling ? 'scale-95' : ''}`} 
//             aria-label="Scroll left"
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <button
//             onClick={() => scroll('right')}
//             disabled={isScrolling}
//             className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 mr-2
//                           bg-gray-900/80 backdrop-blur-sm text-white rounded-full p-3
//                           transition-all duration-300 hover:scale-110
//                           hover:bg-indigo-500 hover:shadow-lg shadow-indigo-500/25
//                           disabled:opacity-50 disabled:cursor-not-allowed
//                           ${isScrolling ? 'scale-95' : ''}`} 
//             aria-label="Scroll right"
//           >
//             <ChevronRight size={20} />
//           </button>
//         </>
//       )}
//     </div>
//   );

//   // --- List view layout ---
//   const ListView = () => (
//     <div className="space-y-3 py-4">
//       {/* Show ALL items in list view */}
//       {(items || []).map(item => ( 
//         <div key={item.id}>
//           <ItemCard 
//             item={item} 
//             viewMode="list"
//             isSelected={selectedItems.has(item.id)}
//             onSelect={() => onItemSelect && onItemSelect(item.id)}
//           />
//         </div>
//       ))}
//       {/* No "View All" card needed here */}
//     </div>
//   );


//   return (
//     <div className="mb-12 relative group/stack"> 
      
//       {/* Enhanced Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
//         {/* Left Section - Title and Info */}
//         <div className="flex items-center space-x-4 mb-4 lg:mb-0">
//           <div className={`p-3 rounded-xl ${stackConfig.bgColor} ${stackConfig.borderColor} border`}>
//             <StackIcon size={24} className={`text-${stackConfig.color}-400`} />
//           </div>
//           <div>
//             <h2 className="text-xl font-bold text-white flex items-center space-x-2">
//               <span>{stackTitle}</span>
//               <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm font-normal">
//                 {totalItems}
//               </span>
//             </h2>
//             <p className="text-gray-400 text-sm">
//               {title === 'Processing' && 'AI is organizing these items...'}
//               {title === 'Failed' && 'Items that need attention'}
//               {title === 'Recently Added' && 'Latest additions to your library'}
//               {title === 'Other' && 'Miscellaneous items'}
//               {isLinkableCategory && `Collection of ${title.toLowerCase()} items`}
//             </p>
//           </div>
//         </div>

//         {/* Right Section - Controls */}
//         <div className="flex items-center space-x-3">
          
//           {/* View Mode Toggle */}
//           <div className="flex items-center space-x-1 p-1 bg-gray-800 rounded-lg">
//             {/* Button for Horizontal Scroll (Grid Icon) */}
//             <button
//               onClick={() => setStackViewMode('grid')}
//               className={`p-2 rounded transition-all duration-200 ${
//                 stackViewMode === 'grid' || stackViewMode === 'carousel' // Highlight if horizontal
//                   ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
//                   : 'text-gray-400 hover:text-white'
//               }`}
//               title="Horizontal View" 
//             >
//               <Grid3X3 size={16} /> 
//             </button>
//             {/* Button for Vertical List */}
//             <button
//               onClick={() => setStackViewMode('list')}
//               className={`p-2 rounded transition-all duration-200 ${
//                 stackViewMode === 'list' 
//                   ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
//                   : 'text-gray-400 hover:text-white'
//               }`}
//                 title="List View"
//             >
//               <List size={16} />
//             </button>
//           </div>

//           {/* View All Link */}
//           {isLinkableCategory && (
//             <Link 
//               href={`/categories/${slug}`} 
//               className="flex items-center space-x-2 px-4 py-2 
//                         bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20
//                         hover:bg-indigo-500 hover:text-white hover:border-indigo-500
//                         transition-all duration-300 group/link text-sm"
//             >
//               <span className="font-medium">View All</span> 
//               <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="relative">
//         {/* Render horizontal view for both 'grid' and 'carousel' modes */}
//         {(stackViewMode === 'grid' || stackViewMode === 'carousel') && <HorizontalScrollingView />}
//         {stackViewMode === 'list' && <ListView />}
//       </div>
      
//       {/* Removed Progress Indicator */}

//     </div>
//   );
// }

// frontend/components/SmartStack.js
'use client'; 

import React, { useRef } from 'react';
import ItemCard from './ItemCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'; 
import Link from 'next/link'; 

export default function SmartStack({ title, items, viewMode, selectedItems, onItemSelect, onDelete }) {
  const scrollRef = useRef(null);

  // Get total count *before* slicing
  const totalItems = items ? items.length : 0;
  
  // --- Define linkable categories ---
  const nonLinkableTitles = ['Recently Added', 'Processing', 'Failed', 'Other'];
  const isLinkableCategory = !nonLinkableTitles.includes(title);
  
  // --- Define slug logic up high so we can reuse it ---
  const slug = title.toLowerCase().replace(/ & /g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  // Create a "View More" card if we have more than 10 items
  const hasMoreItems = totalItems > 10;
  
  // Get only the first 10 items to display
  const itemsToShow = items ? items.slice(0, 10) : [];

  // Don't render anything if there are no items
  if (itemsToShow.length === 0) {
    return null; 
  }

  // --- Scroll Handler (unchanged) ---
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.offsetWidth * 0.8; 
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // --- Title Logic (unchanged) ---
  let stackTitle = title;
  if (title === 'Processing') {
      stackTitle = '⏳ Processing Items';
  } else if (title === 'Failed') {
      stackTitle = '❌ Failed Items';
  } else if (title === 'Recently Added') {
      stackTitle = '✨ Recently Added';
  } else if (title === 'Other') {
      stackTitle = 'Miscellaneous';
  } else if (title.endsWith('y')) {
      stackTitle = title.slice(0, -1) + 'ies';
  } else {
      stackTitle = title + 's';
  }
  
  const showButtons = itemsToShow.length > 3 || (hasMoreItems && isLinkableCategory);

  return (
    <div className="mb-10 relative group"> 
      
      {/* --- Title Header --- */}
      {/* We use items-baseline to align the large title and the small link */}
      <div className="flex justify-between items-baseline mb-4 border-b border-gray-800 pb-2">
        {/* Title (left side) */}
        <h2 className="text-xl font-semibold text-gray-300">
          {stackTitle}
          <span className="text-sm text-gray-500 ml-2">({totalItems})</span>
        </h2>
        
        {/* "View All" link (right side) */}
        {isLinkableCategory && (
          <Link 
            href={`/categories/${slug}`} 
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors flex-shrink-0"
            // flex-shrink-0 stops the link from wrapping if the title is very long
          >
            View All
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {/* --- END: Title Header --- */}


      {/* --- The Horizontal Scroller --- */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-hide gap-4 py-4"
      >
        {/* --- Map over itemsToShow (max 10) --- */}
        {itemsToShow.map(item => (
          <div key={item.id} className="">
            <ItemCard item={item} />
          </div>
        ))}

        {/* --- "View All" Card --- */}
        {hasMoreItems && isLinkableCategory && (
          <div className="w-80 lg:w-96 flex-shrink-0">
            <Link
              href={`/categories/${slug}`} // Use the slug we defined above
              className="flex flex-col items-center justify-center h-full
                         bg-gray-950 rounded-lg border-2 border-dashed border-gray-800
                         text-gray-500 transition-all duration-200
                         hover:bg-gray-900 hover:border-gray-700 hover:text-gray-300"
            >
              <ArrowRight size={32} className="mb-2" />
              <span className="font-semibold">View All {totalItems}</span>
              <span className="text-sm">in {title}</span>
            </Link>
          </div>
        )}
      </div>

      {/* --- Scroll Buttons --- */}
      {showButtons && (
        <>
          {/* Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                       bg-gray-900/50 backdrop-blur-sm text-white rounded-full p-2
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-gray-800/80 -ml-4"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button> {/* <-- FIXED closing tag */}

          {/* Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                       bg-gray-900/50 backdrop-blur-sm text-white rounded-full p-2
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-gray-800/80 -mr-4"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button> {/* <-- FIXED closing tag */}
        </>
      )}
    </div>
  );
}