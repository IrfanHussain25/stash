// // frontend/app/(app)/home/page.js
// 'use client';

// // Added useEffect to fetch data
// import { useState, useRef, useEffect } from 'react'; 
// import { useUser } from '../../UserContext';
// import Header from '../../../../components/header';
// import StashList from '../../../../components/StashList'; // Corrected path
// import { Plus, Link2, Zap, Sparkles, Target, Rocket, Brain, Shield, Clock, Search, Filter } from 'lucide-react';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// // Floating background elements (Unchanged)
// function FloatingBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       {/* Animated gradient orbs - Changed to indigo/cyan */}
//       <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
//       {/* Grid pattern (Unchanged) */}
//       <div className="absolute inset-0 opacity-[0.02]"
//            style={{
//              backgroundImage: `
//                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
//                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
//              `,
//              backgroundSize: '50px 50px'
//            }} />
//     </div>
//   );
// }

// // Quick Action Cards
// // PERFORMANCE FIX: Removed backdrop-blur-sm. 
// // It's too costly to have this on many small components.
// function QuickActionCard({ icon: Icon, title, description, onClick, color = 'blue' }) {
//   const colorClasses = {
//     blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40',
//     cyan: 'from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-400/40',
//     indigo: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-400/40'
//   };

//   return (
//     <button
//       onClick={onClick}
//       // Removed 'backdrop-blur-sm' for performance
//       className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border bg-gray-950/30
//         transition-all duration-300 hover:scale-105 hover:shadow-xl group text-left`}
//     >
//       <div className="flex items-start space-x-3">
//         <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 
//           group-hover:scale-110 transition-transform duration-300`}>
//           <Icon size={20} className="text-white" />
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
//           <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
//         </div>
//       </div>
//     </button>
//   );
// }

// // Stats Card Component
// // PERFORMANCE FIX: Removed backdrop-blur-sm.
// function StatsCard({ icon: Icon, label, value, trend }) {
//   // Determine trend color and arrow rotation
//   const trendColor = trend > 0 ? 'text-green-400' : (trend < 0 ? 'text-red-400' : 'text-gray-500');
//   const trendRotation = trend > 0 ? 'rotate-0' : (trend < 0 ? 'rotate-180' : 'rotate-90');
//   const trendArrowBorder = trend > 0 ? 'border-b-green-400' : (trend < 0 ? 'border-t-red-400' : 'border-l-gray-500');

//   return (
//     // Removed 'backdrop-blur-sm' for performance
//     <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-gray-400 text-sm mb-1">{label}</p>
//           <p className="text-2xl font-bold text-white">{value}</p>
//         </div>
//         <div className="p-2 rounded-lg bg-indigo-500/10">
//           <Icon size={20} className="text-indigo-400" />
//         </div>
//       </div>
//       {/* We only show the trend if it's not null */}
//       {trend !== null && (
//         <div className="flex items-center space-x-1 mt-2">
//           <div className={`w-0 h-0 border-x-4 border-x-transparent ${trendArrowBorder} ${
//             trend === 0 ? 'border-l-4' : 'border-t-4 border-b-4'
//           } transform ${trendRotation}`} />
//           <span className={`text-xs ${trendColor}`}>
//             {trend > 0 ? '+' : ''}{trend}{trend === 0 ? '' : '%'}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function HomePage() {
//   const { userEmail, logout } = useUser();
//   const [newItemUrl, setNewItemUrl] = useState('');
//   const [addError, setAddError] = useState(null);
//   const [isAdding, setIsAdding] = useState(false);
//   const [inputFocused, setInputFocused] = useState(false);
//   const inputRef = useRef(null);

//   // --- NEW: Lifted state from StashList ---
//   const [items, setItems] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0); // Kept refreshKey for manual add

//   // --- NEW: useEffect to fetch all library data ---
//   useEffect(() => {
//     async function fetchItems() {
//       if (!userEmail) return;

//       setIsLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`${API_URL}/v1/library`, {
//           headers: { 'X-User-Email': userEmail },
//         });
//         if (!res.ok) {
//           throw new Error('Failed to fetch stash. Server may be down.');
//         }
//         const data = await res.json();
//         setItems(data.items || []);
//       } catch (err) {
//         setError(err.message);
//         setItems([]);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     fetchItems();
//     // We *also* refetch if the user manually adds an item
//   }, [userEmail, refreshKey]);

//   // --- NEW: Dynamic Stats Calculation ---
//   const calculateStats = () => {
    

//     const total = items.length;
//     const processed = items.filter(item => item.status === 'processed').length;
    
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//     const thisWeek = items.filter(item => new Date(item.created_at) > oneWeekAgo).length;
    
//     const organizedPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

//     // We set trend to null for now, as calculating it requires more complex data
//     return [
//     ];
//   };

//   const stats = calculateStats();
//   // --- END: Dynamic Stats ---


//   const handleAddItem = async (e) => {
//     e.preventDefault();
//     if (!newItemUrl.trim() || !userEmail) return;

//     setIsAdding(true);
//     setAddError(null);
//     try {
//       // (Fetch logic is unchanged)
//       const res = await fetch(`${API_URL}/v1/capture`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-User-Email': userEmail
//         },
//         body: JSON.stringify({
//           type: 'url',
//           content: newItemUrl,
//         }),
//       });
//       if (!res.ok) {
//         let errorDetail = `Failed to add item (Error ${res.status})`;
//         try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch (jsonError) { /* Ignore */ }
//         throw new Error(errorDetail);
//       }
//       setNewItemUrl('');
//       // This key change will trigger the useEffect above to refetch all data
//       setRefreshKey(prevKey => prevKey + 1); 
//     } catch (err) {
//       setAddError(err.message);
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   const quickActions = [
//     {
//       icon: Link2,
//       title: "Save URL",
//       description: "Add a link to your collection",
//       onClick: () => inputRef.current?.focus(),
//       color: 'blue' // Using blue/cyan/indigo as defined
//     },
//     {
//       icon: Zap,
//       title: "Quick Save",
//       description: "Use browser extension",
//       onClick: () => window.open('https://chrome.google.com/webstore', '_blank'), // Example link
//       color: 'cyan'
//     },
//     {
//       icon: Target,
//       title: "AI Organize",
//       description: "Re-categorize all items",
//       onClick: () => console.log('AI Organize'),
//       color: 'indigo'
//     }
//   ];

//   return (
//     // Switched to bg-black for the "Full Black" glass theme
//     <div className="min-h-screen bg-black relative">
//       <FloatingBackground />
      
//       {/* Main Content */}
//       {/* Added 'z-10' and 'isolate' to create a stacking context */}
//       <div className="relative z-10 isolate">
//         {/* CORRECTED Header import path */}
//         <Header userEmail={userEmail} logoutFunction={logout} />

//         <div className="max-w-screen-2xl mx-auto">
//           {/* Welcome Section */}
//           <div className="mb-6 sm:mb-8">
//             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
//               Welcome back,{' '}
//               {/* Changed to indigo/cyan gradient */}
//               <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
//                 {userEmail?.split('@')[0]}
//               </span>
//             </h1>
//             <p className="text-gray-400 text-base sm:text-lg">
//               Your digital library is growing smarter every day
//             </p>
//           </div>

//           {/* Stats Grid - Now uses dynamic stats */}
          
         

//           {/* Main Input Section */}
//           <div className="mb-6 sm:mb-8">
//             {/* Kept 'backdrop-blur-xl' on this main container */}
//             <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 sm:p-6">
//               <div className="flex items-center space-x-2 mb-4">
//                 <Rocket size={18} className="sm:w-5 sm:h-5 text-indigo-400" />
//                 <h2 className="text-lg sm:text-xl font-semibold text-white">Add to Stash</h2>
//               </div>
              
//               <form onSubmit={handleAddItem} className="space-y-4">
//                 <div className="relative">
//                   <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-xl transition-opacity duration-300 ${
//                     inputFocused ? 'opacity-100' : 'opacity-0'
//                   }`} />
//                   <input
//                     ref={inputRef}
//                     type="url"
//                     value={newItemUrl}
//                     onChange={(e) => setNewItemUrl(e.target.value)}
//                     onFocus={() => setInputFocused(true)}
//                     onBlur={() => setInputFocused(false)}
//                     placeholder="Paste URL, article link, product page, video, or any content..."
//                     className="relative w-full p-3 sm:p-4 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
//                     disabled={isAdding}
//                     required
//                   />
//                   <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                     <button
//                       type="submit"
//                       disabled={isAdding || !newItemUrl.trim()}
//                       className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
//                     >
//                       {isAdding ? (
//                         <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <Plus size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {addError && (
//                   <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
//                     <p className="text-red-400 text-sm text-center">{addError}</p>
//                   </div>
//                 )}
//               </form>

//               {/* Quick Actions */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
//                 {quickActions.map((action, index) => (
//                   <QuickActionCard key={index} {...action} />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Stash List Section */}
//           {/* Kept 'backdrop-blur-xl' on this main container */}
//           <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
//             <div className="p-4 sm:p-6 border-b border-gray-800">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
//                 <div className="flex items-center space-x-3">
//                   <Search size={18} className="sm:w-5 sm:h-5 text-indigo-400" />
//                   <h2 className="text-lg sm:text-xl font-semibold text-white">Your Stash</h2>
//                 </div>
//                 <button className="flex items-center space-x-2 px-3 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm">
//                   <Filter size={14} className="sm:w-4 sm:h-4" />
//                   <span>Filter</span>
//                 </button>
//               </div>
//             </div>
            
//             {/* Stash List Component */}
//             <div className="p-4 sm:p-6">
//               {/* --- NEW: Pass props to StashList --- */}
//               <StashList 
//                 items={items} 
//                 isLoading={isLoading}
//                 error={error}
//                 userEmail={userEmail} 
//               />
//             </div>
//           </div>

//           {/* AI Features Banner (Updated to indigo/cyan) */}
//           <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl backdrop-blur-sm">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
//               <div className="flex-1">
//                 <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
//                   🧠 AI Processing Active
//                 </h3>
//                 <p className="text-gray-400 text-xs sm:text-sm">
//                   Your items are being automatically categorized and tagged in real-time
//                 </p>
//               </div>
//               <div className="flex items-center space-x-2 self-start sm:self-auto">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
//                 <span className="text-green-400 text-xs sm:text-sm font-medium">Live</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





'use client';

// Added useEffect to fetch data
import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../UserContext';
import Header from '../../../../components/Header';
import StashList from '../../../../components/StashList'; // Corrected path
import { Plus, Link2, Zap, Sparkles, Target, Rocket, Brain, Shield, Clock, Search, Filter, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Floating background elements (Unchanged)
function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute inset-0 opacity-[0.02]"
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: '50px 50px'
           }} />
    </div>
  );
}

// Quick Action Cards (Unchanged)
function QuickActionCard({ icon: Icon, title, description, onClick, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40',
    cyan: 'from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-400/40',
    indigo: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-400/40'
  };
  return (
    <button onClick={onClick} className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border bg-gray-950/30 transition-all duration-300 hover:scale-105 hover:shadow-xl group text-left`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 group-hover:scale-110 transition-transform duration-300`}><Icon size={20} className="text-white" /></div>
        <div className="flex-1"><h3 className="font-semibold text-white text-sm mb-1">{title}</h3><p className="text-gray-400 text-xs leading-relaxed">{description}</p></div>
      </div>
    </button>
  );
}

// Stats Card Component (Unchanged)
function StatsCard({ icon: Icon, label, value, trend }) {
  // ... (StatsCard code remains the same)
}


// --- MAIN HOME PAGE COMPONENT ---
export default function HomePage() {
  const { userEmail, logout } = useUser();
  const inputRef = useRef(null); // Ref for URL input focus

  // --- State for URL input ---
  const [newItemUrl, setNewItemUrl] = useState('');
  const [addUrlError, setAddUrlError] = useState(null);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // --- State for Image input ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [addImageError, setAddImageError] = useState(null);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const fileInputRef = useRef(null); // Ref for resetting file input

  // --- State for Stash List ---
  const [items, setItems] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering refetch

  // --- Fetch All Library Data ---
  useEffect(() => {
    async function fetchItems() {
      if (!userEmail) return;
      setIsLoadingList(true); setListError(null);
      try {
        const res = await fetch(`${API_URL}/v1/library`, { headers: { 'X-User-Email': userEmail } });
        if (!res.ok) throw new Error('Failed to fetch stash.');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) { setListError(err.message); setItems([]); }
      finally { setIsLoadingList(false); }
    }
    fetchItems();
  }, [userEmail, refreshKey]); // Refetch on user change or manual trigger

  

  // --- Dynamic Stats Calculation ---
  const calculateStats = () => {
    const total = items.length;
    const processed = items.filter(item => item.status === 'processed').length;
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = items.filter(item => new Date(item.created_at) > oneWeekAgo).length;
    const organizedPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
    return [
      { icon: Sparkles, label: "Total Items", value: total, trend: null }, // Trend calculation needs historical data
      { icon: Brain, label: "AI Organized", value: `${organizedPercent}%`, trend: null },
      { icon: Clock, label: "Added This Week", value: thisWeek, trend: null },
    ];
  };
  const stats = calculateStats();

  // --- Handler for Adding URL ---
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newItemUrl.trim() || !userEmail) return;
    setIsAddingUrl(true); setAddUrlError(null);
    try {
      const res = await fetch(`${API_URL}/v1/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-Email': userEmail }, body: JSON.stringify({ type: 'url', content: newItemUrl }), });
      if (!res.ok) { let eD = `Err ${res.status}`; try { const d = await res.json(); eD = d.detail || eD; } catch {} throw new Error(eD); }
      setNewItemUrl(''); setRefreshKey(k => k + 1); console.log("URL added.");
    } catch (err) { setAddUrlError(err.message); }
    finally { setIsAddingUrl(false); }
  };

  // --- Handler for Image File Change ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file); setAddImageError(null);
      const reader = new FileReader(); reader.onloadend = () => setPreviewUrl(reader.result); reader.readAsDataURL(file);
    } else { setSelectedFile(null); setPreviewUrl(null); if (file) setAddImageError('Invalid image.'); event.target.value = null; }
  };

  // --- Handler for Adding Image ---
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!selectedFile || !userEmail) { setAddImageError('Select image.'); return; }
    setIsAddingImage(true); setAddImageError(null); const formData = new FormData(); formData.append('file', selectedFile);
    try {
      const res = await fetch(`${API_URL}/v1/capture/image`, { method: 'POST', headers: { 'X-User-Email': userEmail }, body: formData, });
      if (!res.ok) { let eD = `Err ${res.status}`; try { const d = await res.json(); eD = d.detail || eD; } catch {} throw new Error(eD); }
      setSelectedFile(null); setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input visually
      setRefreshKey(k => k + 1); console.log("Image uploaded.");
    } catch (err) { setAddImageError(err.message); }
    finally { setIsAddingImage(false); }
  };

  // Quick actions data
  const quickActions = [
    { icon: Link2, title: "Save URL", description: "Add a link to your collection", onClick: () => inputRef.current?.focus(), color: 'blue' },
    // Changed second action to Upload Image
    { icon: ImageIcon, title: "Upload Image", description: "Add an image from your device", onClick: () => fileInputRef.current?.click(), color: 'cyan' },
    { icon: Target, title: "AI Organize", description: "Re-categorize all items", onClick: () => console.log('AI Organize Triggered'), color: 'indigo' }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 relative">
      <FloatingBackground />
      <div className="relative z-10 isolate">
        <Header userEmail={userEmail} logoutFunction={logout} />

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"> {/* Adjusted padding and max-width */}
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{userEmail?.split('@')[0]}</span></h1>
            <p className="text-gray-400 text-base sm:text-lg">Your digital library is growing smarter every day</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Combined Input Section */}
          <div className="mb-6 sm:mb-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 sm:p-6">
            {/* URL Input */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                 <Rocket size={18} className="sm:w-5 sm:h-5 text-indigo-400" />
                 <h2 className="text-lg sm:text-xl font-semibold text-white">Add URL to Stash</h2>
               </div>
               <form onSubmit={handleAddUrl} className="relative">
                 <input ref={inputRef} type="url" value={newItemUrl} onChange={(e) => setNewItemUrl(e.target.value)} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder="Paste URL, article link, product page, video..." required disabled={isAddingUrl} className={`relative w-full p-3 sm:p-4 pr-12 border border-gray-700 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-sm sm:text-base`}/>
                 <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-xl transition-opacity duration-300 pointer-events-none ${inputFocused ? 'opacity-100' : 'opacity-0'}`} />
                 <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                   <button type="submit" disabled={isAddingUrl || !newItemUrl.trim()} className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group">
                     {isAddingUrl ? (<div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<Plus size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />)}
                   </button>
                 </div>
               </form>
               {addUrlError && (<div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-red-400 text-xs text-center">{addUrlError}</p></div>)}
            </div>

            {/* Image Input */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                 <ImageIcon size={18} className="sm:w-5 sm:h-5 text-cyan-400" />
                 <h2 className="text-lg sm:text-xl font-semibold text-white">Or Add Image</h2>
               </div>
               <form onSubmit={handleAddImage} className="space-y-3">
                 <input ref={fileInputRef} id="imageUpload" type="file" accept="image/*" onChange={handleFileChange} key={`file-input-${refreshKey}`} disabled={isAddingImage} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-600 file:to-blue-600 file:text-white hover:file:opacity-90 disabled:opacity-50 cursor-pointer"/>
                 {previewUrl && <div className="mt-2"><img src={previewUrl} alt="Preview" className="max-h-32 rounded border border-gray-700"/></div>}
                 <button type="submit" disabled={isAddingImage || !selectedFile} className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap text-sm">
                   {isAddingImage ? 'Uploading...' : 'Add Image'}
                 </button>
               </form>
               {addImageError && (<div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"><p className="text-red-400 text-xs text-center">{addImageError}</p></div>)}
            </div>
          </div>

          {/* Quick Actions (Unchanged) */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 sm:mb-8">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div> */}

          {/* Stash List Section */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-3"><Search size={18} className="sm:w-5 sm:h-5 text-indigo-400" /><h2 className="text-lg sm:text-xl font-semibold text-white">Your Stash</h2></div>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm"><Filter size={14} className="sm:w-4 sm:h-4" /><span>Filter</span></button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <StashList items={items} isLoading={isLoadingList} error={listError} userEmail={userEmail} />
            </div>
          </div>

          {/* AI Banner (Unchanged) */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl backdrop-blur-sm">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
               <div className="flex-1"><h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">🧠 AI Processing Active</h3><p className="text-gray-400 text-xs sm:text-sm">Items are automatically categorized and tagged</p></div>
               <div className="flex items-center space-x-2 self-start sm:self-auto"><div className="w-2 h-2 bg-green-400 rounded-full animate-ping" /><span className="text-green-400 text-xs sm:text-sm font-medium">Live</span></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}