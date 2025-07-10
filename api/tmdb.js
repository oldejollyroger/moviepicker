// This is a Vercel Edge Function. It runs on the server, not in the browser.
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Get the secret API key from Vercel's environment variables
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TMDB API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the path and query parameters from the incoming request from our frontend
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  const query = new URLSearchParams(url.searchParams);
  
  // Remove our 'path' parameter so it doesn't get passed to TMDb
  query.delete('path');

  // Build the final, secure URL to the real TMDb API
  const tmdbUrl = `https://api.themoviedb.org/3/${path}?api_key=${apiKey}&${query.toString()}`;

  try {
    // Make the actual call to TMDb from the server
    const response = await fetch(tmdbUrl);
    
    // Pass the response from TMDb directly back to our frontend
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data from TMDB' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}