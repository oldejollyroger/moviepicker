// --- React and Hooks ---
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// --- This script assumes a 'config.js' file has loaded the TMDB_API_KEY globally

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

const ACCENT_COLORS = [
    { name: 'Cyberpunk', color: '#d946ef', text: '#f0abfc', from: '#22d3ee', to: '#d946ef' },
    { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' },
    { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' },
    { name: 'Volcano', color: '#dc2626', text: '#f87171', from: '#f97316', to: '#ef4444' },
    { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' },
];

const translations = {
    es: { /* ... Your Spanish translations ... */ },
    en: { /* ... Your English translations ... */ }
};
// (Translations object collapsed for brevity.)
Object.assign(translations.es, { title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Más Filtros', hideFilters: 'Ocultar Filtros', applyFilters: 'Aplicar Filtros', sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ], region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película específica...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!", noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:', cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Ver Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', });
Object.assign(translations.en, { title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'More Filters', hideFilters: 'Hide Filters', applyFilters: 'Apply Filters', sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ], region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a specific movie...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!", noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Watch Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', });

const formatDuration = (totalMinutes) => { /* ... No Changes ... */ };
const MovieCardContent = ({ movie, details, isFetching, t, userRegion }) => { /* ... No Changes ... */ };


// --- Main App Component ---
const App = () => {
  // --- State Management ---
  const [mode, setMode] = useState(() => localStorage.getItem('movieRandomizerMode') || 'dark');
  const [accent, setAccent] = useState(() => {
      const savedAccent = localStorage.getItem('movieRandomizerAccent');
      return savedAccent ? JSON.parse(savedAccent) : ACCENT_COLORS[0];
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('movieRandomizerLang') || 'en');
  const [userRegion, setUserRegion] = useState(() => localStorage.getItem('movieRandomizerRegion') || null);
  const t = translations[language]; 
  const [shareStatus, setShareStatus] = useState('idle'); 
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
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
  const [filters, setFilters] = useState(() => { /* ... No Changes ... */ });
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);
  const WATCHED_MOVIES_KEY = 'watchedUserMoviesRandomizer_TMDb_v8';
  const [watchedMovies, setWatchedMovies] = useState({});
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());
  const cardRef = useRef(null);
  
  // --- Effects ---
  useEffect(() => { /* ... (Theme effects) No Changes ... */ }, [mode]);
  useEffect(() => { /* ... (Theme effects) No Changes ... */ }, [accent]);
  useEffect(() => { /* ... (Language storage) No Changes ... */ }, [language]);
  useEffect(() => { /* ... (Region storage) No Changes ... */ }, [userRegion]);
  useEffect(() => { /* ... (Filter storage) No Changes ... */ }, [filters]);
  useEffect(() => { /* ... (initializeApp) No Changes ... */ }, [language]);
  const fetchNewMovieBatch = useCallback(async () => { /* ... No Changes ... */ }, [/* ... */]);
  const handleSurpriseMe = useCallback(() => { /* ... No Changes ... */ }, [/* ... */]);
  useEffect(() => { /* ... (Fetch platforms) No Changes ... */ }, [userRegion]);
  useEffect(() => { /* ... (Search) No Changes ... */ }, [/* ... */]);
  useEffect(() => { /* ... (Click outside search) No Changes ... */ }, []);

  // HIGHLIGHT: The entire similar movies logic is now in this one function.
  const fetchFullMovieDetails = useCallback(async (movieId, lang) => {
    const MAX_SIMILAR = 10;
    
    // --- Step 1: Fetch all base data for the main movie in one call ---
    const initialRes = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits,videos,watch/providers,similar`);
    if (!initialRes.ok) throw new Error(`Details fetch failed: ${initialRes.statusText}`);
    const data = await initialRes.json();

    // --- Step 2: Set up variables for our new, smarter similar movies search ---
    const similarMovies = [];
    const similarIds = new Set([parseInt(movieId)]); // Don't suggest the movie to itself

    // Helper function to fetch from a URL and add unique, valid movies to our list
    const fetchAndAdd = async (url) => {
        if (similarMovies.length >= MAX_SIMILAR) return; // Stop if we have enough
        try {
            const res = await fetch(url);
            if (res.ok) {
                const discoverData = await res.json();
                const results = discoverData.results || discoverData.parts; // `parts` is for collections
                if (results) {
                    for (const movie of results) {
                        if (similarMovies.length >= MAX_SIMILAR) break;
                        // Add if it's not a duplicate, has a poster, and has a decent rating
                        if (!similarIds.has(movie.id) && movie.poster_path && movie.vote_average > 4) {
                            similarMovies.push(movie);
                            similarIds.add(movie.id);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("A similar movies sub-fetch failed for url:", url, e);
        }
    };

    // --- Step 3: Execute the waterfall of fetches, from most to least relevant ---
    const director = data.credits?.crew?.find(p => p.job === 'Director');
    const leadActor = data.credits?.cast?.[0];
    const primaryGenre = data.genres?.[0];
    const firstCompany = data.production_companies?.[0];

    // Priority 1: Same Collection/Saga
    if (data.belongs_to_collection) {
        await fetchAndAdd(`${TMDB_BASE_URL}/collection/${data.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=${lang}`);
    }
    // Priority 2: Same Director and Lead Actor
    if (director && leadActor) {
        await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&sort_by=popularity.desc&with_crew=${director.id}&with_cast=${leadActor.id}`);
    }
    // Priority 3: Same Director and Genre
    if (director && primaryGenre) {
        await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&sort_by=popularity.desc&with_crew=${director.id}&with_genres=${primaryGenre.id}`);
    }
    // Priority 4: Same Lead Actor and Genre
    if (leadActor && primaryGenre) {
        await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&sort_by=popularity.desc&with_cast=${leadActor.id}&with_genres=${primaryGenre.id}`);
    }
    // Priority 5: Same Production Company
    if (firstCompany) {
        await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&sort_by=popularity.desc&with_companies=${firstCompany.id}`);
    }
    // Priority 6: TMDb's default "similar" endpoint as a fallback
    if (similarMovies.length < MAX_SIMILAR && data.similar?.results) {
        for (const movie of data.similar.results) {
            if (similarMovies.length >= MAX_SIMILAR) break;
            if (!similarIds.has(movie.id) && movie.poster_path) {
                similarMovies.push(movie);
                similarIds.add(movie.id);
            }
        }
    }
    
    // --- Step 4: Format and return all the processed data ---
    const regionProviders = data['watch/providers']?.results?.[userRegion];
    const rentProviders = regionProviders?.rent || [];
    const buyProviders = regionProviders?.buy || [];
    const combinedPayProviders = [...rentProviders, ...buyProviders];
    const uniquePayProviderIds = new Set();
    const uniquePayProviders = combinedPayProviders.filter(p => {
        if (uniquePayProviderIds.has(p.provider_id)) return false;
        uniquePayProviderIds.add(p.provider_id);
        return true;
    });

    return {
        ...data, 
        duration: data.runtime || null,
        providers: regionProviders?.flatrate || [],
        rentalProviders: uniquePayProviders,
        cast: data.credits?.cast?.slice(0, 5) || [],
        director: director || null,
        trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null,
        similar: similarMovies.slice(0, MAX_SIMILAR) // Ensure we don't exceed the max
    };
  }, [userRegion]);

  useEffect(() => { /* ... (Card animation) No Changes ... */ }, [selectedMovie]);
  useEffect(() => { /* ... (Fetch details) No Changes ... */ }, [selectedMovie, language, fetchFullMovieDetails]);
  useEffect(() => { /* ... (Load watched) No Changes ... */ }, []);
  useEffect(() => { /* ... (Save watched) No Changes ... */ }, [watchedMovies]);
  
  // --- Handlers ---
  const resetSearchState = () => { /* ... No Changes ... */ };
  const removeFilter = (type, value = null) => { /* ... No Changes ... */ };
  const handleFilterChange = (type, value) => { /* ... No Changes ... */ };
  const handleGenreChange = (genreId, type) => { /* ... No Changes ... */ };
  const handlePlatformChange = (id) => { /* ... No Changes ... */ };
  const handleClearFilters = () => { /* ... No Changes ... */ };
  const handleLanguageSelect = (lang) => { /* ... No Changes ... */ };
  const handleRegionChange = (newRegion) => { /* ... No Changes ... */ };
  const handleSearchChange = (e) => { /* ... No Changes ... */ };
  const handleSearchResultClick = (movie) => { /* ... No Changes ... */ };
  const handleGoBack = () => { /* ... No Changes ... */ };
  const handleMarkAsWatched = (movieId) => { /* ... No Changes ... */ };
  const handleShare = useCallback(() => { /* ... No Changes ... */ }, [selectedMovie]);
  const handleSimilarMovieClick = async (movie) => { /* ... No Changes ... */ };
  const handlePlatformSearchChange = (e) => { /* ... No Changes ... */ };
  const filteredPlatforms = useMemo(() => { /* ... No Changes ... */ }, [platformOptions, platformSearchQuery]);
  const closeModal = () => setModalMovie(null);
  const openTrailerModal = () => setIsTrailerModalOpen(true);
  const closeTrailerModal = () => setIsTrailerModalOpen(false);
  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  // --- Render Logic ---
  if (isLoading) { /* ... No Changes ... */ }
  if (error) { /* ... No Changes ... */ }
  
  return (
    // The entire JSX render block remains the same as the previous version.
    // The only change was in the `fetchFullMovieDetails` function logic.
    <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
        {/* ... All JSX from the previous step remains identical ... */}
        {/* The new `movieDetails.similar` array will automatically populate the UI. */}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));