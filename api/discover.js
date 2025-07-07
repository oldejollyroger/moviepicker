export default async function handler(request, response) {
  // Extract all the filter parameters from the incoming request URL
  const { 
    vote_count, 
    watch_region, 
    with_watch_providers,
    with_genres, 
    without_genres, 
    vote_average, 
    primary_release_date_gte,
    primary_release_date_lte,
    sort_by,
    page,
    language
  } = request.query;

  // IMPORTANT: Your secret API key is now securely stored as an environment variable
  const apiKey = process.env.TMDB_API_KEY;

  // Build the real TMDb API URL on the server
  let tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`;
  
  // Add each parameter to the URL only if it was provided
  if (vote_count) tmdbUrl += `&vote_count.gte=${vote_count}`;
  if (watch_region) tmdbUrl += `&watch_region=${watch_region}`;
  if (with_watch_providers) tmdbUrl += `&with_watch_providers=${with_watch_providers}&with_watch_monetization_types=flatrate`;
  if (with_genres) tmdbUrl += `&with_genres=${with_genres}`;
  if (without_genres) tmdbUrl += `&without_genres=${without_genres}`;
  if (vote_average) tmdbUrl += `&vote_average.gte=${vote_average}`;
  if (primary_release_date_gte) tmdbUrl += `&primary_release_date.gte=${primary_release_date_gte}`;
  if (primary_release_date_lte) tmdbUrl += `&primary_release_date.lte=${primary_release_date_lte}`;
  if (sort_by) tmdbUrl += `&sort_by=${sort_by}`;
  if (page) tmdbUrl += `&page=${page}`;
  if (language) tmdbUrl += `&language=${language}`;

  try {
    const tmdbResponse = await fetch(tmdbUrl);
    const data = await tmdbResponse.json();
    
    // Send the data from TMDb back to your frontend
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: 'Failed to fetch data from TMDb' });
  }
}