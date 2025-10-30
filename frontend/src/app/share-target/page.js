// 'use client';
// import { useEffect, Suspense } from 'react';
// import { useSearchParams } from 'next/navigation';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com';

// function ShareTargetComponent() {
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     // Get the email from localStorage
//     const email = localStorage.getItem('stash_user_email');
//     if (!email) {
//       // If not logged in, open the app (which will show login)
//       window.open('/');
//       window.close();
//       return;
//     }

//     const url = searchParams.get('url');
//     const text = searchParams.get('text');
//     const sharedContent = url || text;

//     if (sharedContent) {
//       fetch(`${API_URL}/v1/capture`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-User-Email': email // <-- Send email as header
//         },
//         body: JSON.stringify({
//           type: url ? 'url' : 'text',
//           content: sharedContent,
//         }),
//       })
//       .then(() => window.close())
//       .catch(() => window.close());
//     } else {
//       window.close();
//     }
//   }, [searchParams]);

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h1>Saving to Stash...</h1>
//     </div>
//   );
// }

// export default function ShareTargetPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <ShareTargetComponent />
//     </Suspense>
//   );
// }





'use client';
import { useEffect, Suspense } from 'react';
// No useSearchParams needed if relying solely on POST

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to read File/Blob as Base64 Data URL
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    // Ensure it's a file/blob
    if (!file || !(file instanceof Blob)) {
        return reject(new Error("Input is not a file or blob"));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file); // Reads as data URL (includes prefix like data:image/png;base64,)
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function ShareTargetComponent() {
  useEffect(() => {
    const processShare = async () => {
      console.log("Share Target Activated");
      const email = localStorage.getItem('stash_user_email');
      if (!email) {
        console.log("Share Target: No user email found, opening app.");
        window.open('/'); // Open app to prompt login
        window.close();
        return;
      }

      let itemType = null;
      let itemContent = null;
      let errorMsg = null;

      try {
            // --- Check for files shared via POST ---
            // This relies on the navigator.serviceWorker registration intercepting fetch
            // OR accessing the launchQueue if available (newer PWA features)
            // A simpler, but less standard way, is to assume the browser might place
            // shared files in a hidden input if the manifest asks correctly.
            // Let's assume a simplified GET fallback first, then placeholder for POST

            const queryParams = new URLSearchParams(window.location.search);
            const sharedUrl = queryParams.get('url');
            const sharedText = queryParams.get('text');
            
            if (sharedUrl) {
                itemType = 'url';
                itemContent = sharedUrl;
                console.log("Share Target: Detected URL via query params:", sharedUrl);
            } else if (sharedText) {
                itemType = 'text';
                itemContent = sharedText;
                console.log("Share Target: Detected text via query params:", sharedText);
            } else {
                 // --- Placeholder for File Handling ---
                 // This part is the most complex. A truly robust solution often involves
                 // a Service Worker intercepting the POST request made by the OS share.
                 // Let's simulate detecting an image from a hypothetical source for now.
                 console.warn("Share Target: POST file data handling not robustly implemented.");
                 // You would need logic here to get the actual shared file data.
                 // For testing, you could try using navigator.clipboard.read() if applicable,
                 // or more advanced PWA APIs if available.
                 // If you manually POST data to this endpoint, you could read it.
                 // Since the OS makes the POST, client-side JS here might not see it directly.
                 // We will skip image handling via share target for now due to complexity.
                 errorMsg = "Image sharing via native share requires advanced PWA setup (Service Worker). URL/Text sharing should work.";
                 // --- End Placeholder ---
            }

      } catch (err) {
          console.error("Share Target: Error processing share data:", err);
          errorMsg = "Could not process shared data.";
      }


      if (errorMsg){
           alert(errorMsg); // Show error to user
           window.close();
           return;
      }


      if (itemType && itemContent) {
        console.log(`Sending item type: ${itemType} to backend...`);
        try {
          const res = await fetch(`${API_URL}/v1/capture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Email': email
            },
            body: JSON.stringify({
              type: itemType,
              content: itemContent, // URL, Text, or (if implemented) Base64
            }),
          });
          if (!res.ok) {
              const errData = await res.json().catch(() => ({ detail: 'Unknown error' }));
              console.error("Share Target: Failed to capture item via backend:", res.status, errData);
              alert(`Failed to save item: ${errData.detail || res.statusText}`);
          } else {
              console.log("Share Target: Item sent to backend successfully.");
          }
        } catch (err) {
           console.error("Share Target: Network error sending item:", err);
           alert("Network error. Could not save item.");
        } finally {
           window.close();
        }
      } else {
        console.log("Share Target: No shareable URL or Text content detected in query params.");
        // If no URL/Text found via GET, assume it might be a file POST we can't handle yet.
         alert("Sharing this type of content is not fully supported yet.");
        window.close(); // Close if no content found
      }
    };

    // Delay processing slightly to ensure localStorage is readable
    setTimeout(processShare, 100); 

  }, []); // Run only once

  return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'white', backgroundColor: '#1f2937' }}>
      <h1>Saving to Stash...</h1>
      <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Please wait.</p>
    </div>
  );
}

// Suspense wrapper remains the same
export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareTargetComponent />
    </Suspense>
  );
}