// --- React and Hooks ---
const { useState, useEffect, useCallback } = React;

// --- CRITICAL: Add your TMDb API Key Here ---
// This is the simplest, most reliable way to start.
const TMDB_API_KEY = "22f17214f2c35b01940cdfed47d738c2";

// --- Constants ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const App = () => {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // This is the core function to fetch a movie.
  const fetchRandomMovie = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMovie(null);

    try {
      // HIGHLIGHT: The problematic API key check has been REMOVED from here.
      // We will let the API call itself tell us if the key is bad.

      const randomPage = Math.floor(Math.random() * 50) + 1;
      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=${randomPage}&vote_count.gte=100&include_adult=false`;
      
      const response = await fetch(url);
      
      if (response.status === 401) {
        throw new Error("Authorization Error: Invalid API Key. Please check the key in your script.");
      }
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const validMovies = data.results.filter(m => m.poster_path && m.overview);
        if (validMovies.length > 0) {
          const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
          setMovie(randomMovie);
        } else {
          // If the page had no valid movies, try again by recalling the function.
          // This is a simple way to handle empty pages.
          console.log("Empty page found, re-fetching...");
          fetchRandomMovie();
        }
      } else {
        throw new Error("No movies found in the API response. Try adjusting filters if they are added.");
      }

    } catch (err) {
      console.error("Error fetching movie:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // The dependency array is empty because it's a self-contained action.

  // Automatically fetch a movie on the first load.
  useEffect(() => {
    fetchRandomMovie();
  }, [fetchRandomMovie]);

  return (
    <div className="app-container p-4 sm:p-8">
      <header className="text-center mb-12 pt-16">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">Movie Picker</h1>
        <p className="text-xl sm:text-2xl text-gray-400 mt-2">What should we watch tonight?</p>
      </header>

      <main className="flex-grow">
        <div className="text-center mb-12">
          <button 
            onClick={fetchRandomMovie} 
            disabled={isLoading}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Searching..." : "Surprise Me!"}
          </button>
        </div>

        {isLoading && <div className="loader"></div>}
        
        {error && <div className="text-center text-red-400 mt-4 text-lg max-w-2xl mx-auto">{error}</div>}
        
        {!isLoading && !movie && !error && (
            <div className="text-center text-gray-400 mt-10 text-lg">
                Click 'Surprise Me!' to get your first movie recommendation.
            </div>
        )}

        {movie && (
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden fade-in">
            <div className="md:flex">
              <div className="md:flex-shrink-0 md:w-1/3">
                <img className="h-auto w-full object-cover" src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`} alt={`Poster for ${movie.title}`} />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-400 font-semibold">{new Date(movie.release_date).getFullYear()} • ⭐ {movie.vote_average.toFixed(1)}</div>
                <h2 className="mt-2 text-3xl leading-tight font-extrabold text-white">{movie.title}</h2>
                <p className="mt-4 text-gray-300">{movie.overview}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Movie data courtesy of <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">TMDb</a>.</p>
      </footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));