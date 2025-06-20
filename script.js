// --- React and Hooks ---
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// --- This script assumes a file named 'config.js' exists and contains:
// const TMDB_API_KEY = "YOUR_REAL_API_KEY";

// --- Constants ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const CURATED_COUNTRY_LIST = new Set([
  'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK',
  'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL',
  'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US'
]);

const THEMES = [
    { id: 'theme-purple', color: '#8b5cf6' }, { id: 'theme-ocean', color: '#22d3ee' },
    { id: 'theme-forest', color: '#22c55e' }, { id: 'theme-volcano', color: '#dc2626' },
    { id: 'theme-sunset', color: '#f97316' }, { id: 'theme-cyberpunk', color: '#d946ef' },
];

const translations = {
    es: { /* ... Your Spanish translations ... */ },
    en: { /* ... Your English translations ... */ }
};
// NOTE: I've collapsed the translation objects for brevity. Assume they are the same as in your original code.
Object.assign(translations.es, { title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Mostrar Filtros', hideFilters: 'Ocultar Filtros', sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ], region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película específica...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!", noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:', cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de', });
Object.assign(translations.en, { title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'Show Filters', hideFilters: 'Hide Filters', sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ], region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a specific movie...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!", noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of', });

const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};

// --- Reusable UI Component for Movie Details (from Suggestion 2a) ---
const MovieCardContent = ({ movie, details, isFetching, t, userRegion }) => {
    return (
        <div className="p-6 sm:p-8 sm:w-2/3">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{movie.title}</h2>
            <p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{movie.synopsis}</p>
            <div className="mt-6 space-y-4 text-sm">
                <p><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {movie.year}</p>
                {isFetching ? <div className="inline-flex items-center"><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong><div className="small-loader"></div></div> : details.duration && <p><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(details.duration)}</p>}
                <p><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {movie.imdbRating}/10 ⭐</p>
                {isFetching ? null : details.director?.name && <p><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {details.director.name}</p>}
                <p><strong className="text-[var(--color-accent-text)]">{t.cardGenres}</strong> {movie.genres.join(', ')}</p>
                <div><strong className="text-[var(--color-accent-text)]">{`${t.cardAvailableOn} ${userRegion}`} </strong>{isFetching ? <div className="small-loader"></div> : details.providers?.length > 0 ? details.providers.map(p => ( <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} title={p.provider_name} className="platform-logo inline-block"/> )) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}</div>
                {isFetching ? null : details.rentalProviders?.length > 0 && (<div><strong className="text-[var(--color-accent-text)]">{t.cardAvailableToRent}</strong><div className="mt-1">{details.rentalProviders.map(p => ( <img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} title={p.provider_name} className="platform-logo inline-block"/> ))}</div></div>)}
                <div className="mt-4"><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong>{isFetching ? <div className="small-loader"></div> : details.cast?.length > 0 ? ( <div className="flex flex-wrap gap-x-4 gap-y-2">{details.cast.map(actor => ( <div key={actor.id} className="flex flex-col items-center text-center w-20"><img src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/><span className="text-xs text-[var(--color-text-secondary)] leading-tight">{actor.name}</span></div> ))}</div> ) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}</div>
            </div>
        </div>
    );
};

const App = () => {
  // --- State Management ---
  const [language, setLanguage] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('movieRandomizerTheme') || 'theme-purple');
  const t = translations[language] || translations['en']; 
  
  const [userRegion, setUserRegion] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');

  const [allMovies, setAllMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieHistory, setMovieHistory] = useState([]);
  
  const [movieDetails, setMovieDetails] = useState({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const [modalMovie, setModalMovie] = useState(null);
  const [isFetchingModalDetails, setIsFetchingModalDetails] = useState(false);
  
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
  const [filters, setFilters] = useState(initialFilters);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(window.innerWidth > 768);

  const WATCHED_MOVIES_KEY = 'watchedUserMoviesRandomizer_TMDb_v8';
  const [watchedMovies, setWatchedMovies] = useState({});
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());

  // --- Effects ---
  
  // FIX 1b: Make filter visibility responsive to window resizing
  useEffect(() => {
    const handleResize = () => setIsFiltersVisible(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!language) return;
    const initializeApp = async () => { /* ... no changes here ... */ };
    initializeApp();
  }, [language]);
  
  useEffect(() => {
    if (!userRegion || typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) return;
    setFilters(f => ({ ...f, platform: [] }));
    setAllMovies([]);
    setSelectedMovie(null);
    setHasSearched(false);
    const fetchRegionPlatforms = async () => { /* ... no changes here ... */ };
    fetchRegionPlatforms();
  }, [userRegion]);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('movieRandomizerTheme', theme);
  }, [theme]);
  
  // FIX 1a (Part 1): Renamed discoverAndSetMovies to fetchNewMovieBatch for clarity
  const fetchNewMovieBatch = useCallback(async () => {
    if (!userRegion || !genresMap || Object.keys(genresMap).length === 0) return;

    setIsDiscovering(true);
    setError(null);
    if(selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]);
    setSelectedMovie(null);
    setHasSearched(true);

    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    
    const fetchPage = async (voteCount) => {
        let providersToQuery = [...filters.platform];
        // FIX 2c: Add comment explaining the logic
        // If HBO Max (384) is selected, also query for Max (1899) due to the service rebranding.
        if (providersToQuery.includes('384') && !providersToQuery.includes('1899')) {
            providersToQuery.push('1899');
        }
        
        let baseDiscoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam}&vote_count.gte=${voteCount}&watch_region=${userRegion}`;
        if (providersToQuery.length > 0) baseDiscoverUrl += `&with_watch_providers=${providersToQuery.join('|')}&with_watch_monetization_types=flatrate`;
        if (filters.genre.length > 0) baseDiscoverUrl += `&with_genres=${filters.genre.join(',')}`;
        if (filters.excludeGenres.length > 0) baseDiscoverUrl += `&without_genres=${filters.excludeGenres.join(',')}`;
        if (filters.minRating > 0) baseDiscoverUrl += `&vote_average.gte=${filters.minRating}`;
        if (filters.decade !== 'todos') {
            const year = parseInt(filters.decade);
            baseDiscoverUrl += `&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year + 9}-12-31`;
        }
        
        const sortOptionsForVariety = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
        const fetchPromises = sortOptionsForVariety.map(sortBy => {
            const randomPage = Math.floor(Math.random() * 20) + 1;
            return fetch(`${baseDiscoverUrl}&sort_by=${sortBy}&page=${randomPage}`);
        });
        
        // FIX 1c: Use Promise.allSettled for resilience
        const responses = await Promise.allSettled(fetchPromises);
        let allResults = [];
        for (const result of responses) {
            if (result.status === 'fulfilled' && result.value.ok) {
                const data = await result.value.json();
                allResults = allResults.concat(data.results);
            } else { 
                console.warn(`A variety search failed:`, result.reason || result.value?.statusText); 
            }
        }
        return allResults;
    };

    try {
        let initialResults = await fetchPage(100);
        if (initialResults.length === 0) initialResults = await fetchPage(0); 

        const uniqueResults = Array.from(new Set(initialResults.map(m => m.id))).map(id => initialResults.find(m => m.id === id));
        const transformedMovies = uniqueResults
            .filter(movie => movie && movie.overview && movie.poster_path && movie.release_date)
            .map(movie => ({
                id: movie.id.toString(), title: movie.title, synopsis: movie.overview,
                year: parseInt(movie.release_date.split('-')[0]), imdbRating: movie.vote_average.toFixed(1),
                genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"], poster: movie.poster_path,
            }));

        const now = Date.now();
        const unwatchedMovies = transformedMovies.filter(m => !(watchedMovies[m.id] && watchedMovies[m.id] > now));
        
        setAllMovies(unwatchedMovies);
        
        if (unwatchedMovies.length > 0) {
            const newMovie = unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)];
            setSelectedMovie(newMovie);
            setSessionShownMovies(prev => new Set(prev).add(newMovie.id));
        } else {
            setSelectedMovie(null);
        }
    } catch (err) {
        console.error("Error discovering movies:", err);
        setError(String(err).includes("401") ? "Authorization error (401). Check your TMDb API Key." : `Could not discover movies. ${err.message}`);
        setAllMovies([]);
    } finally {
        setIsDiscovering(false);
    }
  }, [filters, language, userRegion, genresMap, watchedMovies, selectedMovie]);

  useEffect(() => { /* ... Search useEffect, no changes needed ... */ }, [searchQuery, language]);
  useEffect(() => { /* ... Click outside search, no changes needed ... */ }, []);

  const fetchFullMovieDetails = useCallback(async (movieId, lang) => { /* ... no changes here ... */ }, [userRegion]);

  useEffect(() => {
    if (!selectedMovie) return;
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    setIsFetchingDetails(true);
    setMovieDetails({});
    fetchFullMovieDetails(selectedMovie.id, langParam).then(details => {
        if (details) setMovieDetails(details);
        setIsFetchingDetails(false);
    });
  }, [selectedMovie, language, fetchFullMovieDetails]);

  useEffect(() => { /* ... Watched movies from localStorage, no changes needed ... */ }, []);
  useEffect(() => { localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(watchedMovies)); }, [watchedMovies]);
  
  // --- Handlers ---
  const resetSession = () => { setSessionShownMovies(new Set()); setMovieHistory([]); };
  const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); resetSession(); };
  const handleGenreChange = (genreId, type) => { /* ... no changes here ... */ resetSession(); };
  const handlePlatformChange = (id) => { /* ... no changes here ... */ resetSession(); };
  const handleLanguageSelect = (lang) => { setLanguage(lang); };
  const handleClearFilters = () => { setFilters(initialFilters); resetSession(); };
  const handleRegionChange = (newRegion) => { setUserRegion(newRegion); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); };
  
  const handleSearchResultClick = (movie) => {
    // ... no changes here ...
  };

  const handleGoBack = () => {
      // ... no changes here ...
  };
  
  // FIX 1a (Part 2): New "Surprise Me!" handler logic
  const handleSurpriseMe = useCallback(() => {
    const availableMovies = allMovies.filter(m => !sessionShownMovies.has(m.id));

    if (availableMovies.length > 0) {
      // If we have unused movies in our current batch, just pick one
      const newMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
      if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]);
      setSelectedMovie(newMovie);
      setSessionShownMovies(prev => new Set(prev).add(newMovie.id));
    } else {
      // If we've run out, fetch a new batch
      fetchNewMovieBatch();
    }
  }, [allMovies, sessionShownMovies, selectedMovie, fetchNewMovieBatch]);

  const handleMarkAsWatched = (movieId) => {
    if(!movieId) return;
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    setWatchedMovies(prev => ({...prev, [movieId]: Date.now() + threeMonths}));
    // Remove the movie from the current session and get a new one
    setAllMovies(prev => prev.filter(m => m.id !== movieId));
    handleSurpriseMe();
  };
  
  const handleSimilarMovieClick = async (movie) => { /* ... no changes here ... */ };
  const handlePlatformSearchChange = (e) => { setPlatformSearchQuery(e.target.value); };
  const filteredPlatforms = useMemo(() => { /* ... no changes here ... */ }, [platformOptions, platformSearchQuery]);
  const closeModal = () => setModalMovie(null);
  
  // --- Render Logic ---
  // The entire render block below is mostly the same, but with key changes:
  // - The "Surprise Me!" button now calls `handleSurpriseMe`.
  // - A new state `isDiscovering` is used for the button's disabled/text state.
  // - The main movie card uses the new `<MovieCardContent>` component.
  // - The modal also uses `<MovieCardContent>` for its details.

  if (!language) { /* ... no changes here ... */ }
  if (isLoading && availableRegions.length === 0) { /* ... no changes here ... */ }
  if (error) { /* ... no changes here ... */ }
  if (!userRegion) { /* ... no changes here ... */ }
  
  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
      <header> {/* ... No changes to header content ... */} </header>
      
      {isFiltersVisible && ( <div className="mb-8 p-6 bg-[var(--color-header-bg)] rounded-xl shadow-2xl">{/*... No changes to filter panel content ...*/}</div> )}

      <div className="text-center mb-10 flex justify-center items-center gap-4">
        <button onClick={handleGoBack} disabled={movieHistory.length === 0} className="...">{/* ... */}</button>
        {/* UPDATED BUTTON: Calls handleSurpriseMe and uses isDiscovering state */}
        <button onClick={handleSurpriseMe} disabled={isDiscovering} className={`...`}>{isDiscovering ? t.searching : t.surpriseMe}</button>
      </div>
      
      {selectedMovie ? (
        <div className="max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 flex-shrink-0">
              <img className="h-auto w-3/5 sm:w-full mx-auto sm:mx-0 object-cover" src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.poster}`} alt={`Poster for ${selectedMovie.title}`}/>
            </div>
            {/* FIX 2a: Using the reusable component */}
            <MovieCardContent movie={selectedMovie} details={movieDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} />
          </div>
          <div className="p-6 sm:p-8 sm:w-2/3 ml-auto">
             <button onClick={() => handleMarkAsWatched(selectedMovie.id)} className="w-full py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors">{t.cardMarkAsWatched}</button>
          </div>
          {/* ... Similar movies and trailer sections ... */}
        </div>
      ) : ( <div className="text-center text-gray-400 mt-10 text-lg">{hasSearched && allMovies.length === 0 && !isDiscovering ? t.noMoviesFound : !hasSearched && t.welcomeMessage}</div> )}
      
      {modalMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={closeModal}>
              <div className="bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={closeModal} className="absolute top-3 right-3 ...">{/* ... */}</button>
                  {isFetchingModalDetails ? <div className="h-96 flex items-center justify-center"><div className="loader"></div></div> : (
                      <div className="max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 flex-shrink-0">
                                  <img className="h-auto w-3/5 sm:w-full mx-auto sm:mx-0 object-cover" src={`${TMDB_IMAGE_BASE_URL}${modalMovie.poster_path}`} alt={`Poster for ${modalMovie.title}`}/>
                              </div>
                              {/* FIX 2a: Reusing the component in the modal too. Note that the modal fetches all details at once, so we can pass modalMovie for both movie and details props */}
                              <MovieCardContent movie={{...modalMovie, year: modalMovie.release_date?.split('-')[0], imdbRating: modalMovie.vote_average?.toFixed(1), synopsis: modalMovie.overview, genres: modalMovie.genres?.map(g => g.name)}} details={modalMovie} isFetching={false} t={t} userRegion={userRegion} />
                          </div>
                          {modalMovie.trailerKey && (<div className="p-6 bg-[var(--color-card-bg)]/50">{/* ... Trailer ... */}</div>)}
                      </div>
                  )}
              </div>
          </div>
      )}

      <footer>{/* ... No changes to footer ... */}</footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));