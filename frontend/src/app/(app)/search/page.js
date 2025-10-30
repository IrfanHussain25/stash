// 'use client';

// import { useState, useEffect } from 'react';
// import { useUser } from '../../UserContext';
// import Header from '../../../../components/header';
// import SmartStack from '../../../../components/SmartStack';
// import ItemCard from '../../../../components/ItemCard';
// import { Search, History, X, Loader2, AlertTriangle, SearchX, Inbox } from 'lucide-react'; 

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// const RECENT_SEARCHES_KEY = 'stash_recent_searches'; // Key for localStorage

// // --- NEW: Reusable Loading State Component ---
// function LoadingState({ message }) {
//   return (
//     <div className="flex flex-col items-center justify-center text-center text-gray-400 mt-10 pt-16">
//       <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
//       <h2 className="text-xl font-medium">{message || 'Loading...'}</h2>
//       <p>Please wait a moment.</p>
//     </div>
//   );
// }

// // --- NEW: Reusable Error State Component ---
// function ErrorState({ message }) {
//   return (
//     <div className="flex flex-col items-center justify-center text-center text-red-400 mt-10 pt-16 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
//       <AlertTriangle size={48} className="mx-auto mb-4" />
//       <h2 className="text-xl font-medium">An Error Occurred</h2>
//       <p>{message || 'Something went wrong. Please try again.'}</p>
//     </div>
//   );
// }

// // --- NEW: Reusable Empty State Component ---
// function EmptyState({ icon: Icon, title, children }) {
//   return (
//     <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-10 pt-16">
//       <Icon size={48} className="mx-auto mb-4" />
//       <h2 className="text-xl font-medium">{title}</h2>
//       {children}
//     </div>
//   );
// }


// // --- Component for the "Recently Added" grid ---
// function RecentlyAddedGrid({ items }) {
//   if (!items || items.length === 0) {
//     return (
//       <EmptyState icon={Inbox} title="Your Stash is Empty">
//         <p>Your most recent items will appear here once you add some.</p>
//       </EmptyState>
//     );
//   }

//   return (
//     <div className="mt-12">
//       <h2 className="text-xl font-bold text-white mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex items-center gap-3">
//         <span className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
//           <History size={20} className="text-cyan-400" />
//         </span>
//         Recently Added
//       </h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {items.map(item => (
//           <ItemCard key={item.id} item={item} viewMode="grid" /> 
//         ))}
//       </div>
//     </div>
//   );
// }

// // --- Component for the "Recent Searches" pills ---
// function RecentSearchesList({ searches, onClick, onRemove }) {
//   if (!searches || searches.length === 0) {
//     return null; // Don't render if there are no recent searches
//   }

//   return (
//     <div className="mb-8">
//       <div className="flex items-center gap-2 mb-3">
//         <History size={16} className="text-gray-500" />
//         <h3 className="text-sm font-medium text-gray-500">Recent Searches</h3>
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {searches.map((searchTerm) => (
//           <button
//             key={searchTerm}
//             onClick={() => onClick(searchTerm)}
//             className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-800 text-gray-300 rounded-full 
//                        text-sm transition-all duration-200 group
//                        hover:bg-indigo-600 hover:text-white"
//           >
//             {searchTerm}
//             <span
//               onClick={(e) => {
//                 e.stopPropagation(); // Stop click from triggering search
//                 onRemove(searchTerm);
//               }}
//               className="p-1 rounded-full transition-colors duration-200
//                          group-hover:bg-indigo-500
//                          hover:!bg-red-500/20 hover:!text-red-400"
//               title="Remove"
//             >
//               <X size={14} />
//             </span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }


// export default function SearchPage() {
//   const { userEmail, logout } = useUser();

//   // Search state
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState(null); // null = not searched yet
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // "Recently Added" state
//   const [recentlyAdded, setRecentlyAdded] = useState([]);
//   const [isRecentLoading, setIsRecentLoading] = useState(true);

//   // "Recent Searches" state
//   const [recentSearches, setRecentSearches] = useState([]);

//   // Load recent items AND recent searches on mount
//   useEffect(() => {
//     // 1. Load recent searches from localStorage
//     try {
//       const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
//       if (storedSearches) {
//         setRecentSearches(JSON.parse(storedSearches));
//       }
//     } catch (e) {
//       console.error("Failed to parse recent searches", e);
//       localStorage.removeItem(RECENT_SEARCHES_KEY);
//     }
    
//     // 2. Load "Recently Added" items from API
//     async function fetchRecentItems() {
//       if (!userEmail) return;
//       setIsRecentLoading(true);
//       try {
//         const res = await fetch(`${API_URL}/v1/library`, {
//           headers: { 'X-User-Email': userEmail },
//         });
//         if (!res.ok) throw new Error('Failed to fetch recent items');
//         const data = await res.json();
//         const allItems = data.items || [];
//         const sortedItems = [...allItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setRecentlyAdded(sortedItems.slice(0, 24)); 
//       } catch (err) {
//         console.error("Error fetching recent items:", err);
//         // We don't set a page-level error, just let the grid be empty
//       } finally {
//         setIsRecentLoading(false);
//       }
//     }
//     fetchRecentItems();
//   }, [userEmail]);

//   // Extracted search logic
//   const runSearch = async (searchTerm) => {
//     if (!searchTerm.trim()) return;

//     setIsLoading(true);
//     setError(null);
//     setResults(null); 

//     try {
//       const res = await fetch(`${API_URL}/v1/search?q=${encodeURIComponent(searchTerm)}`, {
//         headers: { 'X-User-Email': userEmail },
//       });
//       if (!res.ok) {
//         let errorDetail = `Search failed (Error ${res.status})`;
//         try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch (jsonError) { /* Ignore */ }
//         throw new Error(errorDetail);
//       }
//       const data = await res.json();
//       setResults(data.items || []);

//       // Add to recent searches on success
//       const newQuery = searchTerm.trim().toLowerCase();
//       setRecentSearches(prevSearches => {
//         // Add to front, remove duplicates, limit to 5
//         const updated = [newQuery, ...prevSearches.filter(s => s.toLowerCase() !== newQuery)];
//         const limited = updated.slice(0, 5);
//         localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limited));
//         return limited;
//       });

//     } catch (err) {
//       console.error("Search error:", err);
//       setError(err.message);
//       setResults([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Search form submit handler
//   const handleSearchSubmit = async (e) => {
//     e.preventDefault();
//     runSearch(query);
//   };

//   // Handler for clicking a recent search pill
//   const handleClickPill = (searchTerm) => {
//     setQuery(searchTerm); // Put text in search bar
//     runSearch(searchTerm); // Run the search
//   };

//   // Handler for removing a recent search pill
//   const handleRemovePill = (searchTerm) => {
//     const newSearches = recentSearches.filter(s => s !== searchTerm);
//     setRecentSearches(newSearches);
//     localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
//   };


//   // Grouping Logic (for search results)
//   const groupedResults = (results || []).reduce((acc, item) => {
//     let stackKey = 'Other'; 
//     if (item.status === 'processed' && item.smart_stack) stackKey = String(item.smart_stack); 
//     if (!acc[stackKey]) acc[stackKey] = [];
//     acc[stackKey].push(item);
//     return acc;
//   }, {});
//   const availableCategories = Object.keys(groupedResults).sort();

//   // Main render function
//   const renderContent = () => {
//     if (isLoading) {
//       return <LoadingState message="Searching your Stash..." />;
//     }
//     if (error) {
//       return <ErrorState message={error} />;
//     }
//     if (results !== null && results.length === 0) {
//       return (
//         <EmptyState icon={SearchX} title="No Results Found">
//           <p>Try a different search query for "{query}".</p>
//         </EmptyState>
//       );
//     }
//     if (results !== null && results.length > 0) {
//       // Show Search Results
//       return (
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold text-white mb-6">
//             Found {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
//           </h2>
//           {availableCategories.map(stackName => 
//             <SmartStack 
//               key={stackName} 
//               title={stackName} 
//               items={groupedResults[stackName]} 
//             />
//           )}
//         </div>
//       );
//     }
//     // Initial State: Show "Recently Added" grid
//     if (results === null) {
//       if (isRecentLoading) {
//         return <LoadingState message="Loading recent items..." />;
//       }
//       return <RecentlyAddedGrid items={recentlyAdded} />;
//     }
//   };

//   return (
//     <div className="p-4 sm:p-8">
//       <Header userEmail={userEmail} logoutFunction={logout} />
      
//       {/* Constrain main content width for large screens */}
//       <main className="max-w-7xl mx-auto">
//         {/* Search Form */}
//         <form onSubmit={handleSearchSubmit} className="mt-4 mb-8 flex flex-col sm:flex-row gap-3">
//           {/* ENHANCED: Search Input with Icon */}
//           <div className="relative flex-grow">
//             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//               <Search size={20} className="text-gray-500" />
//             </div>
//             <input
//               type="search"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search for 'that pasta thing' or 'gift for mom'..."
//               className="w-full p-4 pl-12 text-lg border border-gray-800 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               disabled={isLoading}
//             />
//           </div>
//           {/* ENHANCED: Search Button with Text */}
//           <button
//             type="submit"
//             className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isLoading || !query.trim()}
//           >
//             <Search size={20} />
//             <span className="font-semibold">Search</span>
//           </button>
//         </form>

//         {/* Render Recent Searches *only* in initial state */}
//         {results === null && !isLoading && (
//           <RecentSearchesList
//             searches={recentSearches}
//             onClick={handleClickPill}
//             onRemove={handleRemovePill}
//           />
//         )}

//         {/* --- Content Area (renders grid OR carousels) --- */}
//         <div>
//           {renderContent()}
//         </div>
//       </main>
//     </div>
//   );
// }


// frontend/app/(app)/search/page.js




'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../UserContext';
import Header from '../../../../components/Header';
import SmartStack from '../../../../components/SmartStack';
import ItemCard from '../../../../components/ItemCardOld';
import { Search, History, X, Sparkles, Filter, ArrowRight, Zap, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const RECENT_SEARCHES_KEY = 'stash_recent_searches';

// Enhanced Recently Added Grid
function RecentlyAddedGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-16 py-20">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-400 mb-3">Search Your Digital Library</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Find anything you've saved using natural language. Search for recipes, articles, products, or any content.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Sparkles size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recently Added</h2>
            <p className="text-gray-400 text-sm">Your latest saved items</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {items.length} items
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <ItemCard key={item.id} item={item} viewMode="grid" />
        ))}
      </div>
    </div>
  );
}

// Enhanced Recent Searches Component
function RecentSearchesList({ searches, onClick, onRemove }) {
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <History size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
            <p className="text-gray-400 text-sm">Quickly access your previous searches</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
            onRemove('all');
          }}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {searches.map((searchTerm) => (
          <button
            key={searchTerm}
            onClick={() => onClick(searchTerm)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-xl 
                       text-sm transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-300 hover:scale-105
                       border border-gray-700 hover:border-blue-500/30"
          >
            <span className="font-medium">{searchTerm}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onRemove(searchTerm);
              }}
              className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors group-hover:bg-blue-500/20"
              title="Remove"
            >
              <X size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Search Stats Component
function SearchStats({ results, query, isLoading }) {
  if (isLoading || !results || results.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Zap size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-gray-400 text-sm">
              for "<span className="text-blue-400">{query}</span>"
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <Clock size={16} className="inline mr-1" />
          Just now
        </div>
      </div>
    </div>
  );
}

// Quick Suggestions Component
function QuickSuggestions({ onSearch }) {
  const suggestions = [
    "Recipes with chicken",
    "Tech articles",
    "Book recommendations", 
    "Product reviews",
    "Travel ideas",
    "Gift suggestions"
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Sparkles size={20} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Try Searching For</h3>
          <p className="text-gray-400 text-sm">Common categories in your library</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch(suggestion)}
            className="p-3 bg-gray-800/50 backdrop-blur-sm text-gray-400 rounded-lg text-sm 
                       transition-all duration-300 hover:bg-indigo-500/20 hover:text-indigo-300 
                       hover:scale-105 border border-gray-700 hover:border-indigo-500/30
                       text-center break-words"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { userEmail, logout } = useUser();

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // "Recently Added" state
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [isRecentLoading, setIsRecentLoading] = useState(true);

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent items and searches on mount
  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (e) {
      console.error("Failed to parse recent searches", e);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
    
    // Load "Recently Added" items from API
    async function fetchRecentItems() {
      if (!userEmail) return;
      setIsRecentLoading(true);
      try {
        const res = await fetch(`${API_URL}/v1/library`, {
          headers: { 'X-User-Email': userEmail },
        });
        if (!res.ok) throw new Error('Failed to fetch recent items');
        const data = await res.json();
        const allItems = data.items || [];
        const sortedItems = [...allItems].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentlyAdded(sortedItems.slice(0, 24)); 
      } catch (err) {
        console.error("Error fetching recent items:", err);
      } finally {
        setIsRecentLoading(false);
      }
    }
    fetchRecentItems();
  }, [userEmail]);

  // Search logic
  const runSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null); 

    try {
      const res = await fetch(`${API_URL}/v1/search`, { // Calls the endpoint
        method: 'POST', // Uses POST
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail 
        },
        body: JSON.stringify({ query: searchTerm }) // Sends the full query
      });
      if (!res.ok) {
        let errorDetail = `Search failed (Error ${res.status})`;
        try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch (jsonError) { /* Ignore */ }
        throw new Error(errorDetail);
      }
      const data = await res.json();
      setResults(data.items || []);

      // Add to recent searches on success
      const newQuery = searchTerm.trim().toLowerCase();
      setRecentSearches(prevSearches => {
        const updated = [newQuery, ...prevSearches.filter(s => s.toLowerCase() !== newQuery)];
        const limited = updated.slice(0, 5);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limited));
        return limited;
      });

    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search form submit handler
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    runSearch(query);
  };

  // Handler for clicking a recent search pill
  const handleClickPill = (searchTerm) => {
    setQuery(searchTerm);
    runSearch(searchTerm);
  };

  // Handler for removing a recent search pill
  const handleRemovePill = (searchTerm) => {
    if (searchTerm === 'all') {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } else {
      const newSearches = recentSearches.filter(s => s !== searchTerm);
      setRecentSearches(newSearches);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    }
  };

  // Handler for quick suggestions
  const handleQuickSearch = (suggestion) => {
    setQuery(suggestion);
    runSearch(suggestion);
  };

  // Grouping Logic for search results
  const groupedResults = (results || []).reduce((acc, item) => {
    let stackKey = 'Other'; 
    if (item.status === 'processed' && item.smart_stack) stackKey = String(item.smart_stack); 
    if (!acc[stackKey]) acc[stackKey] = [];
    acc[stackKey].push(item);
    return acc;
  }, {});
  const availableCategories = Object.keys(groupedResults).sort();

  // Main render function
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Searching Your Library</h3>
          <p className="text-gray-400">Looking for "{query}"...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Search Failed</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => runSearch(query)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (results !== null && results.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Results Found</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            We couldn't find anything matching "<span className="text-blue-400">{query}</span>"
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setResults(null)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Library
            </button>
            <button
              onClick={() => runSearch(query)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Search Again
            </button>
          </div>
        </div>
      );
    }
    
    if (results !== null && results.length > 0) {
      return (
        <div className="mt-8">
          <SearchStats results={results} query={query} isLoading={isLoading} />
          {availableCategories.map(stackName => 
            <SmartStack 
              key={stackName} 
              title={stackName} 
              items={groupedResults[stackName]} 
            />
          )}
        </div>
      );
    }
    
    // Initial State: Show "Recently Added" grid
    if (results === null) {
      if (isRecentLoading) {
        return (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-400">Loading your library...</span>
          </div>
        );
      }
      return (
        <>
          <QuickSuggestions onSearch={handleQuickSearch} />
          <RecentlyAddedGrid items={recentlyAdded} />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="w-full px-2 sm:px-4 py-4">
        {/* Header */}
        <Header userEmail={userEmail} logoutFunction={logout} />

        {/* Main Search Section */}
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Search Form */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Search Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Digital Library</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Find anything you've saved using natural language. Your AI-powered search understands context and meaning.
            </p>
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for 'that pasta recipe' or 'gift ideas for mom' or 'tech articles about AI'..."
                  className="w-full pl-12 pr-24 py-4 text-lg border border-gray-700 rounded-2xl bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Searches */}
          {results === null && !isLoading && (
            <RecentSearchesList
              searches={recentSearches}
              onClick={handleClickPill}
              onRemove={handleRemovePill}
            />
          )}

          {/* Content Area */}
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}