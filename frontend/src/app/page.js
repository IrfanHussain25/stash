// 'use client';
// import { useState, useEffect } from 'react';
// import { useUser } from './UserContext';
// // Import your components (adjust path if needed)
// import Header from '../../components/Header';
// import StashList from '../../components/StashList';

// // API URL - Ensure this is set in Vercel/Render env vars for deployment
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// // --- Login/Signup Component (Keep the same nice version) ---
// function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [isLoginView, setIsLoginView] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const { login, signup } = useUser();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);
//     try {
//       if (isLoginView) await login(email, password);
//       else await signup(email, password);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
//       <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
//         {/* Header */}
//         <h1 className="text-3xl font-bold text-center">Stash</h1>
//         <h2 className="text-xl text-gray-300 text-center">
//           {isLoginView ? 'Sign in to your account' : 'Create a new account'}
//         </h2>
//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isLoading} className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"/>
//           <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isLoading} className="w-full p-3 mt-1 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"/>
//           {error && <p className="text-red-500 text-sm text-center">{error}</p>}
//           <button type="submit" disabled={isLoading} className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50">
//             {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
//           </button>
//         </form>
//         {/* Toggle Link */}
//         <p className="text-sm text-center text-gray-400">
//           {isLoginView ? "Don't have an account? " : "Already have an account? "}
//           <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setEmail(''); setPassword(''); }} disabled={isLoading} className="font-medium text-blue-400 hover:text-blue-500 disabled:opacity-50">
//             {isLoginView ? 'Sign up' : 'Sign in'}
//           </button>
//         </p>
//       </div>
//     </main>
//   );
// }


// // --- Main App Component (With separate URL and Image forms) ---
// function StashApp() {
//   const { userEmail, logout } = useUser();

//   // State for URL form
//   const [newUrl, setNewUrl] = useState('');
//   const [urlAddError, setUrlAddError] = useState(null);
//   const [isAddingUrl, setIsAddingUrl] = useState(false);

//   // State for Image form
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [imageAddError, setImageAddError] = useState(null);
//   const [isAddingImage, setIsAddingImage] = useState(false);

//   // State to trigger refresh in StashList
//   const [refreshKey, setRefreshKey] = useState(0);

//   // --- Handler for URL Form ---
//   const handleAddUrl = async (e) => {
//     e.preventDefault();
//     if (!newUrl.trim() || !userEmail) return;

//     setIsAddingUrl(true);
//     setUrlAddError(null);
//     try {
//       const res = await fetch(`${API_URL}/v1/capture`, { // Use the URL/Text endpoint
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-User-Email': userEmail
//         },
//         body: JSON.stringify({
//           type: 'url', // Send type as 'url'
//           content: newUrl,
//         }),
//       });
//       if (!res.ok) {
//          let errorDetail = `Failed to add URL (Error ${res.status})`;
//          try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch { /* Ignore */ }
//          throw new Error(errorDetail);
//       }
//       setNewUrl(''); // Clear input
//       setRefreshKey(prevKey => prevKey + 1); // Trigger refresh
//       console.log("URL added, triggering refresh.");
//     } catch (err) {
//       setUrlAddError(err.message);
//     } finally {
//       setIsAddingUrl(false);
//     }
//   };

//   // --- Handler for Image Form ---
//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       setSelectedFile(file);
//       setImageAddError(null);
//       const reader = new FileReader();
//       reader.onloadend = () => setPreviewUrl(reader.result);
//       reader.readAsDataURL(file);
//     } else { /* Reset state */ setSelectedFile(null); setPreviewUrl(null); if (file) setImageAddError('Invalid image file.'); event.target.value = null; }
//   };

//   const handleAddImage = async (e) => {
//     e.preventDefault();
//     if (!selectedFile || !userEmail) { setImageAddError('Please select an image first.'); return; }

//     setIsAddingImage(true);
//     setImageAddError(null);
//     const formData = new FormData();
//     formData.append('file', selectedFile);

//     try {
//       const res = await fetch(`${API_URL}/v1/capture/image`, { // Use the Image endpoint
//         method: 'POST',
//         headers: { 'X-User-Email': userEmail }, // No Content-Type needed for FormData
//         body: formData,
//       });
//        if (!res.ok) {
//          let errorDetail = `Failed to add image (Error ${res.status})`;
//          try { const errData = await res.json(); errorDetail = errData.detail || errorDetail; } catch { /* Ignore */ }
//          throw new Error(errorDetail);
//        }
//       // Clear form and refresh
//       setSelectedFile(null); setPreviewUrl(null); e.target.reset();
//       setRefreshKey(prevKey => prevKey + 1);
//       console.log("Image uploaded, triggering refresh.");
//     } catch (err) {
//       setImageAddError(err.message);
//     } finally {
//       setIsAddingImage(false);
//     }
//   };

//   return (
//     <main className="p-4 sm:p-8 max-w-5xl mx-auto text-white min-h-screen">
//       <Header userEmail={userEmail} logoutFunction={logout} />

//       {/* --- URL Add Form --- */}
//       <form onSubmit={handleAddUrl} className="mb-6 flex flex-col sm:flex-row gap-2">
//         <input
//           type="url"
//           value={newUrl}
//           onChange={(e) => setNewUrl(e.target.value)}
//           placeholder="Add a URL to your stash..."
//           className="flex-grow p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//           disabled={isAddingUrl}
//           required
//         />
//         <button
//           type="submit"
//           className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
//           disabled={isAddingUrl || !newUrl.trim()}
//         >
//           {isAddingUrl ? 'Adding URL...' : 'Add URL'}
//         </button>
//       </form>
//       {urlAddError && <p className="text-red-500 text-sm text-center mb-4">Error: {urlAddError}</p>}

//       {/* --- Image Add Form --- */}
//       <form onSubmit={handleAddImage} className="mb-8 p-4 border border-gray-600 rounded bg-gray-700">
//          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300 mb-2">
//            Or add an Image:
//          </label>
//          <div className="flex flex-col sm:flex-row gap-3 items-center">
//              <input id="imageUpload" type="file" accept="image/*" onChange={handleFileChange} key={`file-input-${refreshKey}`} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 cursor-pointer" disabled={isAddingImage}/>
//              <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap" disabled={isAddingImage || !selectedFile}>
//                {isAddingImage ? 'Uploading...' : 'Add Image'}
//              </button>
//          </div>
//           {previewUrl && <div className="mt-4"><img src={previewUrl} alt="Preview" className="max-h-40 rounded border border-gray-500"/></div>}
//           {imageAddError && <p className="text-red-500 text-sm text-center mt-3">{imageAddError}</p>}
//       </form>

//       {/* --- Stash List --- */}
//       <StashList userEmail={userEmail} key={refreshKey} />
//     </main>
//   );
// }

// // --- Main Page Component (Entry Point - Unchanged) ---
// export default function Home() {
//   const { userEmail } = useUser();
//   if (!userEmail) {
//     return <LoginScreen />;
//   }
//   return <StashApp />;
// }






'use client';

import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
// Import your components (adjust path if needed, e.g., '../components/Header')
import Header from '../../components/Header';
import StashList from '../../components/StashList';
// Import icons for the enhanced LoginScreen
import { Sparkles, Zap, Bookmark, Eye, Lock, Mail, Key, ArrowRight } from 'lucide-react';

// API URL - Ensure this is set in Vercel/Render env vars for deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Helper Components from Enhanced UI ---

// Animated background particles
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10"> {/* Added z-index */}
      {/* Gradient orbs - Using indigo */}
      <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-indigo-400/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 group">
      {/* Using indigo */}
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// --- ENHANCED Login/Signup Component (Merged) ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useUser(); // Uses the functional context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLoginView) {
        await login(email, password); // Calls context login
      } else {
        await signup(email, password); // Calls context signup
      }
      // On success, the Home component will re-render and show StashApp
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Only stop loading on error
    }
  };

  // Feature list data
  const features = [
    { icon: Zap, title: "AI-Powered Organization", description: "Automatically categorize and tag your saved content" },
    { icon: Bookmark, title: "One-Click Save", description: "Save anything from anywhere with a single action" }, // Adjusted description
    { icon: Eye, title: "Smart Retrieval", description: "Find items instantly with smart grouping and tags" } // Adjusted description
  ];

  return (
    // Uses the enhanced layout
    <main className="min-h-screen flex items-center justify-center bg-black text-gray-200 p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        {/* Left Side - Brand & Features */}
        <div className="w-full lg:w-1/2 space-y-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Stash
              </h1>
            </div>
            <p className="text-2xl lg:text-3xl font-light text-gray-300 leading-tight">
              The zero-effort universal
              <span className="block bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent font-semibold">
                save button for your digital life
              </span>
            </p>
            <p className="text-gray-400 text-lg">
              Save anything. Organize automatically. Find instantly.
            </p>
          </div>
          {/* Features Grid */}
          <div className="grid gap-3 max-w-md">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full lg:w-96">
          <div className="p-8 space-y-6 bg-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl">
            {/* Card Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {isLoginView ? 'Welcome back' : 'Join Stash'}
              </h2>
              <p className="text-gray-400">
                {isLoginView ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400"><Mail size={16} /><span>Email</span></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={isLoading} className="w-full p-3 border border-gray-800 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"/>
              </div>
              {/* Password Field */}
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-sm text-gray-400"><Key size={16} /><span>Password</span></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLoading} className="w-full p-3 border border-gray-800 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"/>
              </div>
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className="w-full p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 group">
                <span>{isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}</span>
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />}
              </button>
            </form>
            {/* Divider */}
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-950 text-gray-500">or</span></div></div>
            {/* Toggle View */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setEmail(''); setPassword(''); }} disabled={isLoading} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 disabled:opacity-50">
                  {isLoginView ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
            {/* Security Note */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Lock size={12} />
              {/* Updated security note */}
            
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


// --- Main App Component (Unchanged - Contains App Logic) ---
function StashApp() {
  const { userEmail, logout } = useUser();

  // State for URL form
  const [newUrl, setNewUrl] = useState('');
  const [urlAddError, setUrlAddError] = useState(null);
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // State for Image form
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageAddError, setImageAddError] = useState(null);
  const [isAddingImage, setIsAddingImage] = useState(false);

  // State to trigger refresh in StashList
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Handler for URL Form ---
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl.trim() || !userEmail) return;
    setIsAddingUrl(true); setUrlAddError(null);
    try {
      const res = await fetch(`${API_URL}/v1/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-Email': userEmail }, body: JSON.stringify({ type: 'url', content: newUrl, }), });
      if (!res.ok) { let eD = `Err ${res.status}`; try { const d = await res.json(); eD = d.detail || eD; } catch {} throw new Error(eD); }
      setNewUrl(''); setRefreshKey(k => k + 1); console.log("URL added.");
    } catch (err) { setUrlAddError(err.message); } finally { setIsAddingUrl(false); }
  };

  // --- Handler for Image Form ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file); setImageAddError(null);
      const reader = new FileReader(); reader.onloadend = () => setPreviewUrl(reader.result); reader.readAsDataURL(file);
    } else { setSelectedFile(null); setPreviewUrl(null); if (file) setImageAddError('Invalid image.'); event.target.value = null; }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!selectedFile || !userEmail) { setImageAddError('Select image.'); return; }
    setIsAddingImage(true); setImageAddError(null); const formData = new FormData(); formData.append('file', selectedFile);
    try {
      const res = await fetch(`${API_URL}/v1/capture/image`, { method: 'POST', headers: { 'X-User-Email': userEmail }, body: formData, });
      if (!res.ok) { let eD = `Err ${res.status}`; try { const d = await res.json(); eD = d.detail || eD; } catch {} throw new Error(eD); }
      setSelectedFile(null); setPreviewUrl(null); e.target.reset(); setRefreshKey(k => k + 1); console.log("Image uploaded.");
    } catch (err) { setImageAddError(err.message); } finally { setIsAddingImage(false); }
  };

  return (
    // Uses the simpler StashApp layout
    <main className="p-4 sm:p-8 max-w-5xl mx-auto text-white min-h-screen bg-gray-900"> {/* Added bg color */}
      <Header userEmail={userEmail} logoutFunction={logout} />

      {/* --- URL Add Form --- */}
      <form onSubmit={handleAddUrl} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Add a URL to your stash..." required disabled={isAddingUrl} className="flex-grow p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"/>
        <button type="submit" disabled={isAddingUrl || !newUrl.trim()} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap">
          {isAddingUrl ? 'Adding URL...' : 'Add URL'}
        </button>
      </form>
      {urlAddError && <p className="text-red-500 text-sm text-center mb-4">Error: {urlAddError}</p>}

      {/* --- Image Add Form --- */}
      <form onSubmit={handleAddImage} className="mb-8 p-4 border border-gray-600 rounded bg-gray-700">
         <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-300 mb-2">Or add an Image:</label>
         <div className="flex flex-col sm:flex-row gap-3 items-center">
             <input id="imageUpload" type="file" accept="image/*" onChange={handleFileChange} key={`file-input-${refreshKey}`} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 cursor-pointer" disabled={isAddingImage}/>
             <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 whitespace-nowrap" disabled={isAddingImage || !selectedFile}>
               {isAddingImage ? 'Uploading...' : 'Add Image'}
             </button>
         </div>
          {previewUrl && <div className="mt-4"><img src={previewUrl} alt="Preview" className="max-h-40 rounded border border-gray-500"/></div>}
          {imageAddError && <p className="text-red-500 text-sm text-center mt-3">{imageAddError}</p>}
      </form>

      {/* --- Stash List --- */}
      <StashList userEmail={userEmail} key={refreshKey} />
    </main>
  );
}


// --- Main Page Component (Entry Point - Unchanged) ---
// export default function Home() {
//   const { userEmail } = useUser();
  
//   // Using simple check, no isLoading needed here
  
//   // Decide whether to show Login or the Main App
//   if (!userEmail) {
//     // Render the new enhanced LoginScreen
//     return <LoginScreen />; 
//   }
  
//   // Render the functional StashApp
//   return <StashApp />; 
// }



// --- Main Page Component (Entry Point) ---
export default function Home() {
  const { userEmail, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    if (!isLoading && userEmail && pathname === '/') {
      router.push('/home');
    }
  }, [isLoading, userEmail, router, pathname]); 

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* REPLACED purple with indigo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-spin" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (userEmail && pathname === '/') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* REPLACED purple with indigo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-spin" />
          <span className="text-gray-400">Redirecting...</span>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return <LoginScreen />;
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* REPLACED purple with indigo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-spin" />
        <span className="text-gray-400">Loading...</span>
      </div>
    </div>
  );
}