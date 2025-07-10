// This is a standard Node.js Serverless Function
export default async function handler(req, res) {
  // Get the secret API key from Vercel's environment variables
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }
  
  // Get the path and query parameters from the incoming request
  const { path, ...query } = req.query;

  // Build the full query string from the received query object
  const queryString = new URLSearchParams(query).toString();
  const tmdbUrl = `https://api.themoviedb.org/3/${path}?api_key=${apiKey}&${queryString}`;

  try {
    // Make the actual call to TMDb from the server
    const tmdbResponse = await fetch(tmdbUrl);

    // Check if the request to TMDb was successful
    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      // Forward TMDb's error status and message to our frontend
      return res.status(tmdbResponse.status).json(errorData);
    }
    
    // Send the successful data back to our frontend
    const data = await tmdbResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from TMDB' });
  }
}