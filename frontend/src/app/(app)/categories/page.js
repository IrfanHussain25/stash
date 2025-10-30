// frontend/app/(app)/categories/page.js
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../UserContext';
import Header from '../../../../components/Header';
import Link from 'next/link';
import { 
  Tag, 
  Loader2, 
  ServerCrash, 
  Search, 
  FolderOpen, 
  Grid3X3,
  List,
  X,
  Filter,
  Zap,
  Sparkles
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Enhanced Category Card Component
function CategoryCard({ title, count, icon: Icon = FolderOpen }) {
  const slug = title.toLowerCase().replace(/ & /g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return (
    <Link
      href={`/categories/${slug}`}
      className="group block p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 
                 transition-all duration-300 
                 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105
                 hover:bg-gradient-to-br hover:from-gray-900 hover:to-gray-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Icon size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            {count !== undefined ? `${count} items` : 'Explore collection'}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    </Link>
  );
}

export default function CategoriesPage() {
  const { userEmail, logout } = useUser();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (!userEmail) return;

    async function fetchCategories() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/v1/library`, {
          headers: { 'X-User-Email': userEmail },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch library. Server might be down.');
        }

        const data = await res.json();
        const allItems = data.items || [];

        // Filter for processed items that have a stack
        const processedItems = allItems.filter(
          item => item.status === 'processed' && item.smart_stack
        );

        // Calculate category counts
        const counts = {};
        processedItems.forEach(item => {
          counts[item.smart_stack] = (counts[item.smart_stack] || 0) + 1;
        });

        // Use a Set to get unique category names
        const categorySet = new Set(processedItems.map(item => item.smart_stack));
        categorySet.delete('Other');

        // Convert to array and sort by count (descending) then alphabetically
        const sortedCategories = Array.from(categorySet).sort((a, b) => {
          const countDiff = counts[b] - counts[a];
          return countDiff !== 0 ? countDiff : a.localeCompare(b);
        });

        setCategories(sortedCategories);
        setCategoryCounts(counts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [userEmail]);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Logic
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Your Collections</h3>
          <p className="text-gray-400">Organizing your digital library...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ServerCrash size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Categories</h3>
          <p className="text-red-400 mb-4 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag size={32} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Categories Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            As you save more content, AI will automatically organize them into categories for you.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Sparkles size={20} />
            <span>Start Adding Items</span>
          </Link>
        </div>
      );
    }

    if (filteredCategories.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Categories Found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No categories match "<span className="text-blue-400">{searchQuery}</span>"
          </p>
        </div>
      );
    }

    // Grid View
    if (viewMode === 'grid') {
      return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard 
              key={category} 
              title={category} 
              count={categoryCounts[category]}
            />
          ))}
        </div>
      );
    }

    // List View
    return (
      <div className="mt-8 space-y-3">
        {filteredCategories.map(category => (
          <Link
            key={category}
            href={`/categories/${category.toLowerCase().replace(/ & /g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
            className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 
                       transition-all duration-300 hover:border-blue-500 hover:bg-gray-800/50 group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderOpen size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-gray-400">
                  {categoryCounts[category]} items
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="w-full px-2 sm:px-4 py-4">
        {/* Header */}
        <Header userEmail={userEmail} logoutFunction={logout} />

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Tag size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Collections</span>
              </h1>
              <p className="text-gray-400 mt-1">
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} • AI-organized
              </p>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center space-x-1 p-1 bg-gray-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories... (e.g., 'recipes', 'books', 'products')"
            className="w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Stats Bar */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-gray-400 text-sm">Total Categories</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">
                {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-gray-400 text-sm">Organized Items</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">
                {Math.max(...Object.values(categoryCounts))}
              </div>
              <div className="text-gray-400 text-sm">Largest Category</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(Object.values(categoryCounts).reduce((sum, count) => sum + count, 0) / categories.length)}
              </div>
              <div className="text-gray-400 text-sm">Avg per Category</div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {renderContent()}
      </div>
    </div>
  );
}