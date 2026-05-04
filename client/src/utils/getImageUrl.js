export function getImageUrl(url) {
  if (!url) return '/placeholder.jpg';
  
  // If it's a relative path to an uploaded file, prepend the backend URL
  if (url.startsWith('/uploads')) {
    // Using the same backend URL that is hardcoded in other components
    return `http://localhost:5000${url}`;
  }

  // The seed data uses /images/... paths which don't actually exist on the server
  if (url.startsWith('/images/')) {
    return '/placeholder.jpg';
  }
  
  // If it's another relative path like /placeholder.jpg, return as is so the frontend serves it
  return url;
}
