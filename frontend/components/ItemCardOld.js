// 'use client';
// import React from 'react';

// // Helper to check if a string looks like a URL
// const isUrl = (string) => {
//   try {
//     new URL(string);
//     return true;
//   } catch (_) {
//     return false;
//   }
// };

// export default function ItemCard({ item }) {
//   // Determine if the card should be clickable and get the target URL
//   const isLink = (item.content_type === 'url' || item.content_type === 'image_url') && isUrl(item.raw_content);
//   const linkUrl = isLink ? item.raw_content : null;

//   // --- Handle Pending State ---
//   if (item.status === 'pending' || !item.processed_data) {
//     const cardContent = (
//       <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
//         {/* Main content */}
//         <div className="flex-grow mb-3 overflow-hidden">
//           {item.content_type === 'image_url' ? (
//             <img src={item.raw_content} alt="Processing..." className="max-h-32 w-full object-contain rounded" loading="lazy" />
//           ) : (
//             <p className="text-blue-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>
//               {item.raw_content || 'No raw content'}
//             </p>
//           )}
//         </div>
//         {/* Footer */}
//         <div className="mt-auto pt-2 border-t border-gray-600">
//           <p className="text-xs text-yellow-400">Processing...</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
//           </p>
//         </div>
//       </div>
//     );

//     // Render as a link only if it's a valid URL type
//     return isLink ? (
//       <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-90 transition-opacity">
//         {cardContent}
//       </a>
//     ) : (
//       cardContent // Render plain div if not a link
//     );
//   }

//   // --- Handle Failed State ---
//   if (['failed', 'failed_vision', 'failed_gemini', 'failed_extraction', 'failed_download', 'skipped_ocr', 'skipped'].includes(item.status)) {
//     const cardContent = (
//       <div className="p-4 border border-red-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
//         {/* Main content */}
//         <div className="flex-grow mb-3 overflow-hidden">
//           {item.content_type === 'image_url' ? (
//             <img src={item.raw_content} alt="Failed processing" className="max-h-32 w-full object-contain rounded" loading="lazy" />
//           ) : (
//             <p className="text-gray-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>{item.raw_content || 'No raw content'}</p>
//           )}
//         </div>
//         {/* Footer */}
//         <div className="mt-auto pt-2 border-t border-gray-600">
//           <p className="text-xs text-red-400 font-semibold">Processing Failed</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
//           </p>
//         </div>
//       </div>
//     );

//     // Render as a link only if it's a valid URL type
//     return isLink ? (
//       <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-90 transition-opacity">
//         {cardContent}
//       </a>
//     ) : (
//       cardContent // Render plain div if not a link
//     );
//   }

//   // --- Render Processed Item ---
//   const {
//       title = (item.content_type === 'image_url' ? 'Processed Image' : 'No Title Available'),
//       summary = '',
//       primary_category = 'Other',
//       specific_tags = [],
//       key_info = {},
//       image_tags = []
//   } = item.processed_data || {};
//   const displayTags = specific_tags.length > 0 ? specific_tags : image_tags;

//   const cardContent = (
//     <div className="p-4 border border-gray-600 rounded-lg bg-gray-700 text-white flex flex-col justify-between h-full shadow-md hover:border-gray-500 transition-colors duration-200">
//       {/* Image */}
//       {item.content_type === 'image_url' && (
//         <div className="mb-3 max-h-48 overflow-hidden rounded bg-gray-600 flex items-center justify-center">
//           <img src={item.raw_content} alt={title || 'Stashed Image'} className="w-full h-auto max-h-48 object-contain" loading="lazy" />
//         </div>
//       )}
//       {/* Text Content */}
//       <div className="flex-grow mb-3">
//         <h3 className="text-lg font-semibold mb-2 line-clamp-2" title={title}>{title}</h3>
//         {summary && <p className="text-sm text-gray-300 line-clamp-3" title={summary}>{summary}</p>}
//       </div>
//       {/* Tags */}
//       {displayTags && displayTags.length > 0 && (
//         <div className="mb-3 flex flex-wrap gap-1">
//           {displayTags.slice(0, 5).map((tag, index) => (
//             <span key={`${tag}-${index}`} className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded whitespace-nowrap">{tag}</span>
//           ))}
//         </div>
//       )}
//       {/* Footer */}
//       <div className="mt-auto border-t border-gray-600 pt-2 text-xs">
//         {item.content_type !== 'image_url' && key_info && Object.keys(key_info).length > 0 && (
//           <div className="text-gray-400 mb-1 space-y-1">
//             {Object.entries(key_info).slice(0, 1).map(([key, value]) => (
//               <p key={key} className="truncate" title={`${key.replace(/_/g, ' ')}: ${String(value)}`}>
//                 <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}
//               </p>
//             ))}
//           </div>
//         )}
//         <p className="text-gray-500 mt-1">
//           Category: {primary_category} | Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
//         </p>
//       </div>
//     </div>
//   );

//   // Render as a link only if it's a valid URL type
//   return isLink ? (
//     <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer h-full"> {/* Added h-full */}
//       {cardContent}
//     </a>
//   ) : (
//     <div className="h-full">{cardContent}</div> // Wrap in div with h-full if not a link
//   );
// }







'use client';
import React from 'react';

// Helper function to get hostname from URL
const getHostname = (url) => {
  // Check if url is a non-empty string before trying to parse
  if (typeof url !== 'string' || !url.trim()) {
    return 'Invalid URL'; // Or return url itself, or null
  }
  try {
    // Ensure the URL has a scheme for correct parsing
    let parsedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Default to https if no scheme provided
      parsedUrl = 'https://' + url; 
    }
    return new URL(parsedUrl).hostname.replace(/^www\./, ''); // Remove 'www.' prefix
  } catch (_) {
    // If parsing fails, return the original string or an indicator
    return url; // Return original string if it's not a valid URL
  }
};

export default function ItemCard({ item }) {
  // Determine if the card should be clickable and get the target URL
  const isLink = (item.content_type === 'url' || item.content_type === 'image_url') && typeof item.raw_content === 'string' && item.raw_content.startsWith('http');
  const linkUrl = isLink ? item.raw_content : null;

  // Determine the source text
  let sourceText = 'Source not available';
  if (item.content_type === 'url' || item.content_type === 'image_url') {
      sourceText = getHostname(item.raw_content);
  } else if (item.content_type === 'text') {
      sourceText = 'Text Input';
  } else if (item.content_type === 'image') { // Handle potential old 'image' type if needed
      sourceText = 'Uploaded Image (Base64)';
  }

  // --- Handle Pending State ---
  if (item.status === 'pending' || !item.processed_data) {
    const cardContent = (
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
        {/* Main content */}
        <div className="grow mb-3 overflow-hidden">
          {item.content_type === 'image_url' ? (
            <img src={item.raw_content} alt="Processing..." className="max-h-32 w-full object-contain rounded" loading="lazy" />
          ) : (
            <p className="text-blue-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>
              {item.raw_content || 'No raw content'}
            </p>
          )}
        </div>
        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-gray-600">
          <p className="text-gray-400 mb-1 truncate text-xs" title={item.raw_content || 'Source not available'}>
            Source: {sourceText}
          </p>
          <p className="text-xs text-yellow-400">Processing...</p>
          <p className="text-xs text-gray-500 mt-1">
            Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    );

    return isLink ? (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-90 transition-opacity h-full">
        {cardContent}
      </a>
    ) : (
      <div className="h-full">{cardContent}</div>
    );
  }

  // --- Handle Failed State ---
  if (['failed', 'failed_vision', 'failed_gemini', 'failed_extraction', 'failed_download', 'skipped_ocr', 'skipped'].includes(item.status)) {
    const cardContent = (
      <div className="p-4 border border-red-700 rounded-lg bg-gray-800 opacity-70 h-full flex flex-col justify-between shadow-md">
        {/* Main content */}
        <div className="grow mb-3 overflow-hidden">
          {item.content_type === 'image_url' ? (
            <img src={item.raw_content} alt="Failed processing" className="max-h-32 w-full object-contain rounded" loading="lazy" />
          ) : (
            <p className="text-gray-400 text-sm break-all line-clamp-3" title={item.raw_content || 'No raw content'}>{item.raw_content || 'No raw content'}</p>
          )}
        </div>
        {/* Footer */}
        <div className="mt-auto pt-2 border-t border-gray-600">
          <p className="text-gray-400 mb-1 truncate text-xs" title={item.raw_content || 'Source not available'}>
            Source: {sourceText}
          </p>
          <p className="text-xs text-red-400 font-semibold">Processing Failed</p>
          <p className="text-xs text-gray-500 mt-1">
            Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    );

     return isLink ? (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-90 transition-opacity h-full">
        {cardContent}
      </a>
    ) : (
       <div className="h-full">{cardContent}</div>
    );
  }

  // --- Render Processed Item ---
  const {
      title = (item.content_type === 'image_url' ? 'Processed Image' : 'No Title Available'),
      summary = '',
      primary_category = 'Other',
      specific_tags = [],
      key_info = {},
      image_tags = [] // Tags specifically from image analysis
  } = item.processed_data || {};

  // Decide which tags to primarily display
  // Use specific_tags if they exist (usually from Gemini text analysis), else use image_tags
  const displayTags = specific_tags && specific_tags.length > 0 ? specific_tags : image_tags;

  const cardContent = (
    // Added group class for hover effect on link
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-700 text-white flex flex-col justify-between h-full shadow-md group-hover:border-gray-500 transition-colors duration-200">
      
      {/* Image Display */}
      {item.content_type === 'image_url' && (
          <div className="mb-3 max-h-48 overflow-hidden rounded bg-gray-600 flex items-center justify-center">
              <img src={item.raw_content} alt={title || 'Stashed Image'} className="w-full h-auto max-h-48 object-contain" loading="lazy"/>
          </div>
      )}
      
      {/* Text Content Area */}
      <div className="grow mb-3">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-200" title={title}>
            {title}
        </h3>
        {summary && <p className="text-sm text-gray-300 line-clamp-3" title={summary}>{summary}</p>}
      </div>

      {/* Tags Display */}
      {displayTags && displayTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
              {displayTags.slice(0, 5).map((tag, index) => ( // Show max 5 tags
                  <span key={`${tag}-${index}`} className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded whitespace-nowrap">
                      {tag}
                  </span>
              ))}
          </div>
      )}
      
      {/* Footer */}
      <div className="mt-auto border-t border-gray-600 pt-2 text-xs">
         {/* Source Display */}
         <p className="text-gray-400 mb-1 truncate" title={item.raw_content || 'Source not available'}>
           Source: {sourceText}
         </p>
         
         {/* Key Info (Only if not image_url and exists) */}
        {item.content_type !== 'image_url' && key_info && Object.keys(key_info).length > 0 && (
          <div className="text-gray-400 mb-1 space-y-1">
            {Object.entries(key_info).slice(0, 1).map(([key, value]) => (
              <p key={key} className="truncate" title={`${key.replace(/_/g, ' ')}: ${String(value)}`}>
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}
              </p>
            ))}
          </div>
        )}
        {/* Category and Date */}
        <p className="text-gray-500 mt-1">
          Category: {primary_category} | Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
  );

  // Render as a link if applicable, adding group class for hover effect
  return isLink ? (
    <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer h-full group"> 
      {cardContent}
    </a>
  ) : (
    <div className="h-full">{cardContent}</div> // Wrap in div with h-full if not a link
  );
}