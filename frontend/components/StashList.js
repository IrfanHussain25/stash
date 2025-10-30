// frontend/components/StashList.js
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import SmartStack from './SmartStack';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  RefreshCw, 
  Zap, 
  Sparkles,
  Eye,
  EyeOff,
  Download,
  Archive,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Advanced Filter Component
function FilterPanel({ isOpen, filters, onFiltersChange, onClose }) {
  if (!isOpen) return null;

  const statusOptions = ['All', 'Processed', 'Processing', 'Failed'];
  const typeOptions = ['All', 'Article', 'Video', 'Product', 'Recipe', 'Book', 'Other'];
  const sortOptions = ['Newest', 'Oldest', 'Title A-Z', 'Title Z-A'];

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center space-x-2">
          <SlidersHorizontal size={16} />
          <span>Filters & Sort</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => onFiltersChange({ ...filters, status })}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  filters.status === status
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(type => (
              <button
                key={type}
                onClick={() => onFiltersChange({ ...filters, type })}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  filters.type === type
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onFiltersChange({ status: 'All', type: 'All', sort: 'Newest' })}
            className="flex-1 px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Bulk Actions Component
function BulkActions({ selectedItems, onBulkAction, onClearSelection }) {
  if (selectedItems.length === 0) return null;

  const actions = [
    { icon: Archive, label: 'Archive', action: 'archive' },
    { icon: Download, label: 'Export', action: 'export' },
    { icon: Trash2, label: 'Delete', action: 'delete', destructive: true },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-semibold">{selectedItems.length}</span>
        </div>
        <span className="text-white text-sm">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {actions.map(({ icon: Icon, label, action, destructive }) => (
          <button
            key={action}
            onClick={() => onBulkAction(action)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              destructive
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
        <button
          onClick={onClearSelection}
          className="px-3 py-2 text-gray-400 hover:text-white text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default function StashList({ userEmail, refreshKey }) { 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'All', type: 'All', sort: 'Newest' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/v1/library`, {
          headers: { 'X-User-Email': userEmail },
        });

        if (!res.ok) {
          let errorDetail = `Failed to fetch items (Error ${res.status})`;
          try {
            const errData = await res.json();
            errorDetail = errData.detail || errorDetail;
          } catch (jsonError) { /* Ignore */ }
          throw new Error(errorDetail);
        }

        const data = await res.json();
        const allItems = data.items || [];
        const sortedItems = [...allItems].sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          return 0;
        });
        
        setItems(sortedItems);
      } catch (err) {
        setError(err.message);
        console.error("StashList: Fetch error:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }

    fetchItems();
  }, [userEmail, refreshKey]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // The useEffect will trigger due to refreshKey change
  };

  // Filter and sort items based on current filters and search
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search filter
      const matchesSearch = !searchQuery || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.smart_stack?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'All' || 
        (filters.status === 'Processed' && item.status === 'processed') ||
        (filters.status === 'Processing' && item.status === 'pending') ||
        (filters.status === 'Failed' && item.status === 'failed');

      // Type filter (simplified - you might want to map smart_stack to types)
      const matchesType = filters.type === 'All' || 
        item.smart_stack?.toLowerCase().includes(filters.type.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'Oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'Title A-Z':
          return (a.title || '').localeCompare(b.title || '');
        case 'Title Z-A':
          return (b.title || '').localeCompare(a.title || '');
        case 'Newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [items, searchQuery, filters]);

  // Grouping Logic
  const groupedItems = useMemo(() => {
    return filteredAndSortedItems.reduce((acc, item) => {
      let stackKey = 'Other';
      if (item.status === 'pending') {
        stackKey = 'Processing';
      } else if (item.status === 'failed') {
        stackKey = 'Failed'; 
      } else if (item.status === 'processed' && item.smart_stack) {
        stackKey = String(item.smart_stack); 
      }
      if (!acc[stackKey]) {
        acc[stackKey] = [];
      }
      acc[stackKey].push(item);
      return acc;
    }, {});
  }, [filteredAndSortedItems]);

  // Bulk actions handler
  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} on items:`, Array.from(selectedItems));
    // Implement bulk actions here
    setSelectedItems(new Set()); // Clear selection after action
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const availableCategories = Object.keys(groupedItems);
  const isEmpty = availableCategories.length === 0 && !loading;
  const sortedCategories = availableCategories.sort((a, b) => {
    if (a === 'Processing') return -1;
    if (b === 'Processing') return 1;
    if (a === 'Failed') return -1;
    if (b === 'Failed') return 1;
    return a.localeCompare(b);
  });

  const recentlyAddedItems = filteredAndSortedItems.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-1">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles size={24} className="text-blue-400" />
            <span>Your Digital Library</span>
          </h2>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your stashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-300"
            >
              <Filter size={18} />
              <span className="text-sm">Filters</span>
            </button>
            <FilterPanel
              isOpen={showFilters}
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-2xl font-bold text-white">{filteredAndSortedItems.length}</div>
          <div className="text-gray-400 text-sm">Total Items</div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-2xl font-bold text-cyan-400">
            {filteredAndSortedItems.filter(item => item.status === 'processed').length}
          </div>
          <div className="text-gray-400 text-sm">Processed</div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {filteredAndSortedItems.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-gray-400 text-sm">Processing</div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{sortedCategories.length}</div>
          <div className="text-gray-400 text-sm">Categories</div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={Array.from(selectedItems)}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedItems(new Set())}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading your digital library...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && filteredAndSortedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={24} className="text-red-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Unable to load items</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-blue-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-3">Your Stash is Empty</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Start building your digital library by saving URLs, articles, products, and more. 
            Everything will be automatically organized by AI.
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !isEmpty && (
        <div className="space-y-8">
          {/* Recently Added Section */}
          {recentlyAddedItems.length > 0 && (
            <SmartStack
              key="recently-added"
              title="Recently Added"
              items={recentlyAddedItems}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onItemSelect={toggleItemSelection}
            />
          )}

          {/* Category Stacks */}
          {sortedCategories.map(stackName => 
            <SmartStack 
              key={stackName} 
              title={stackName} 
              items={groupedItems[stackName]}
              viewMode={viewMode}
              selectedItems={selectedItems}
              onItemSelect={toggleItemSelection}
            />
          )}
        </div>
      )}
    </div>
  );
}