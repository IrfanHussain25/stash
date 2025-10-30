// frontend/app/(app)/categories/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../../UserContext';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../../../components/Header';
import ItemCard from '../../../../../components/ItemCardOld';
import { 
  Loader2, 
  ServerCrash, 
  ChevronLeft, 
  Tag, 
  Grid3X3,
  List,
  Filter,
  ArrowLeft,
  FolderOpen,
  Calendar,
  Eye,
  Sparkles
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Slugify function (unchanged)
function slugify(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/ & /g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const { userEmail, logout } = useUser();

  const [items, setItems] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (!userEmail || !slug) return;

    async function fetchCategoryItems() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/v1/library`, {
          headers: { 'X-User-Email': userEmail },
        });

        if (!res.ok) throw new Error('Failed to fetch library.');

        const data = await res.json();
        const allItems = data.items || [];

        // Filter items for this category
        const filtered = allItems.filter(item => {
          const itemSlug = slugify(item.smart_stack);
          return itemSlug === slug;
        });
        
        // Sort by date (newest first)
        const sortedItems = [...filtered].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });

        setItems(sortedItems);

        // Set category title
        if (sortedItems.length > 0) {
          setCategoryTitle(sortedItems[0].smart_stack);
        } else {
          const title = slug
            .replace(/-/g, ' ')
            .replace(/ and /g, ' & ')
            .replace(/\b\w/g, l => l.toUpperCase());
          setCategoryTitle(title);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategoryItems();
  }, [userEmail, slug]);

  // Enhanced render logic
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Collection</h3>
          <p className="text-gray-400">Gathering your {categoryTitle.toLowerCase()} items...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ServerCrash size={32} className="text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Collection</h3>
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

    if (items.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen size={32} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Empty Collection</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            No items found in the {categoryTitle.toLowerCase()} category yet.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Sparkles size={20} />
            <span>Add Some Items</span>
          </button>
        </div>
      );
    }

    // Grid View
    if (viewMode === 'grid') {
      return (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <ItemCard key={item.id} item={item} viewMode="grid" />
          ))}
        </div>
      );
    }

    // List View
    return (
      <div className="mt-8 space-y-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} viewMode="list" />
        ))}
      </div>
    );
  };

  // Calculate category statistics
  const totalItems = items.length;
  const processedItems = items.filter(item => item.status === 'processed').length;
  const latestItem = items.length > 0 ? new Date(items[0].created_at) : null;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="w-full px-2 sm:px-4 py-4">
        {/* Header */}
        <Header userEmail={userEmail} logoutFunction={logout} />

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="flex items-start space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => router.push('/categories')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-gray-400 
                         rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300 
                         border border-gray-700 hover:border-gray-600 mt-1"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <FolderOpen size={24} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    {categoryTitle}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} • AI-organized collection
                  </p>
                </div>
              </div>
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

        {/* Category Statistics */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-white">{totalItems}</div>
              <div className="text-gray-400 text-sm">Total Items</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{processedItems}</div>
              <div className="text-gray-400 text-sm">Processed</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-cyan-400">
                {Math.round(processedItems / totalItems * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Organized</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">
                {latestItem ? latestItem.toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-gray-400 text-sm">Last Added</div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {renderContent()}

        {/* Back to Top Button for long lists */}
        {items.length > 8 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg 
                         hover:bg-gray-700 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="rotate-90" />
              <span>Back to Top</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}