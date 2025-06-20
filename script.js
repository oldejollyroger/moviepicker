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

// HIGHLIGHT: New constants for the theme system
const ACCENT_COLORS = [
    { name: 'Cyberpunk', color: '#d946ef', text: '#f0abfc', from: '#22d3ee', to: '#d946ef' },
    { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' },
    { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' },
    { name: 'Volcano', color: '#dc2626', text: '#f87171', from: '#f97316', to: '#ef4444' },
    { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' },
];

const translations = {
    es: { /* ... (same as before) ... */ },
    en: { /* ... (same as before) ... */ }
};
// (Translations object collapsed for brevity)
Object.assign(translations.es, { title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Mostrar Filtros', hideFilters: 'Ocultar Filtros', sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ], region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película específica...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!", noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:', cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', });
Object.assign(translations.en, { title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'Show Filters', hideFilters: 'Hide Filters', sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ], region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a specific movie...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!", noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', });

const formatDuration = (totalMinutes) => { /* ... (same as before) ... */ };
const MovieCardContent = ({ movie, details, isFetching, t, userRegion }) => { /* ... (same as before) ... */ };


// --- Main App Component ---
const App = () => {
  // --- State Management ---
  // HIGHLIGHT: The old `theme` state is replaced by `mode` and `accent`.
  const [mode, setMode] = useState(() => localStorage.getItem('movieRandomizerMode') || 'dark');
  const [accent, setAccent] = useState(() => {
    const savedAccent = localStorage.getItem('movieRandomizerAccent');
    try {
      return savedAccent ? JSON.parse(savedAccent) : ACCENT_COLORS[0]; // Cyberpunk default
    } catch {
      return ACCENT_COLORS[0];
    }
  });

  const [language, setLanguage] = useState(() => localStorage.getItem('movieRandomizerLang') || null);
  const [userRegion, setUserRegion] = useState(() => localStorage.getItem('movieRandomizerRegion') || null);
  const t = translations[language] || translations['en']; 
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
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
  const [filters, setFilters] = useState(() => { /* ... (same as before) ... */ });
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
  const cardRef = useRef(null);
  
  // --- Effects ---
  
  // HIGHLIGHT: New effects to control the theme system
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', mode === 'light');
    localStorage.setItem('movieRandomizerMode', mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', accent.color);
    root.style.setProperty('--color-accent-text', accent.text);
    root.style.setProperty('--color-accent-gradient-from', accent.from);
    root.style.setProperty('--color-accent-gradient-to', accent.to);
    localStorage.setItem('movieRandomizerAccent', JSON.stringify(accent));
  }, [accent]);

  useEffect(() => { /* ... (all other effects and handlers remain the same) ... */ }, []);
  // ... (All other functions and effects from the previous version are unchanged)
  // ... (This includes initializeApp, fetchNewMovieBatch, handleSurpriseMe, etc.)

  // --- Render Logic ---
  // (The initial loading/error/region selection screens are unchanged)
  
  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
      {/* HIGHLIGHT: The header UI is updated for the new theme system */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-2 bg-[var(--color-card-bg)] p-1 rounded-full shadow border border-[var(--color-border)]">
            <button onClick={() => setMode('light')} className={`p-1.5 rounded-full ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Light Mode">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </button>
            <button onClick={() => setMode('dark')} className={`p-1.5 rounded-full ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Dark Mode">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </button>
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-card-bg)] p-1 rounded-full shadow border border-[var(--color-border)]">{ACCENT_COLORS.map(colorOption => (<button key={colorOption.name} onClick={() => setAccent(colorOption)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${accent.name === colorOption.name ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-accent)]' : ''}`} style={{backgroundColor: colorOption.color}} title={colorOption.name}></button>))}</div>
        <div className="flex items-center bg-[var(--color-card-bg)] p-1 rounded-full shadow border border-[var(--color-border)]"><button onClick={() => setLanguage('es')} className={`lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button><button onClick={() => setLanguage('en')} className={`lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button></div>
      </div>
      
      {/* ... (The rest of the JSX remains the same as the previous version, including the trailer modal and main card structure) ... */}
    </div>
  );
};

// Paste the entire previous script from here down, as only the state and header UI changed.
// I'm collapsing it here for brevity, but you should have the full script from the previous step.
const restOfAppCode = () => {
    const { useState, useEffect, useCallback, useMemo, useRef } = React;
    const [language, setLanguage] = useState(() => localStorage.getItem('movieRandomizerLang') || null);
    const [userRegion, setUserRegion] = useState(() => localStorage.getItem('movieRandomizerRegion') || null);
    const t = translations[language] || translations['en']; 
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
    const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('movieRandomizerFilters');
        if (savedFilters) {
            try { return { ...initialFilters, ...JSON.parse(savedFilters) }; } catch (e) { console.error("Failed to parse filters from localStorage", e); return initialFilters; }
        } return initialFilters;
    });
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
    const cardRef = useRef(null);
    useEffect(() => {
        const handleResize = () => setIsFiltersVisible(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        if (language) { localStorage.setItem('movieRandomizerLang', language); document.documentElement.lang = language; }
    }, [language]);
    useEffect(() => {
        if (userRegion) { localStorage.setItem('movieRandomizerRegion', userRegion); }
    }, [userRegion]);
    useEffect(() => {
        localStorage.setItem('movieRandomizerFilters', JSON.stringify(filters));
    }, [filters]);
    useEffect(() => {
        if (!language) { setIsLoading(false); return; }
        const initializeApp = async () => {
            setIsLoading(true); setError(null);
            if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY || TMDB_API_KEY === 'YOUR_REAL_API_KEY') { setError("API Key not found or is a placeholder. Please check config.js."); setIsLoading(false); return; }
            try {
                const langParam = language === 'es' ? 'es-ES' : 'en-US';
                const [regionsResponse, genresResponse] = await Promise.all([ fetch(`${TMDB_BASE_URL}/configuration/countries?api_key=${TMDB_API_KEY}`), fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${langParam}`) ]);
                if (!regionsResponse.ok) throw new Error("Could not fetch TMDb regions");
                if (!genresResponse.ok) throw new Error(`Could not fetch genres (Lang: ${langParam})`);
                const regionsData = await regionsResponse.json(); const genresData = await genresResponse.json();
                const curatedRegions = regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a, b) => a.english_name.localeCompare(b.english_name));
                setAvailableRegions(curatedRegions); setGenresMap(genresData.genres.reduce((acc, genre) => ({ ...acc, [genre.id]: genre.name }), {}));
            } catch (err) { console.error("Error during app initialization:", err); setError(err.message); } finally { setIsLoading(false); }
        };
        initializeApp();
    }, [language]);
    const fetchNewMovieBatch = useCallback(async () => {
        if (!userRegion || !genresMap || Object.keys(genresMap).length === 0) return;
        setIsDiscovering(true); setError(null);
        if(selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]);
        setSelectedMovie(null); setHasSearched(true);
        const langParam = language === 'es' ? 'es-ES' : 'en-US';
        const fetchPage = async (voteCount) => {
            let providersToQuery = [...filters.platform];
            if (providersToQuery.includes('384') && !providersToQuery.includes('1899')) { providersToQuery.push('1899'); }
            let baseDiscoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam}&vote_count.gte=${voteCount}&watch_region=${userRegion}`;
            if (providersToQuery.length > 0) baseDiscoverUrl += `&with_watch_providers=${providersToQuery.join('|')}&with_watch_monetization_types=flatrate`;
            if (filters.genre.length > 0) baseDiscoverUrl += `&with_genres=${filters.genre.join(',')}`;
            if (filters.excludeGenres.length > 0) baseDiscoverUrl += `&without_genres=${filters.excludeGenres.join(',')}`;
            if (filters.minRating > 0) baseDiscoverUrl += `&vote_average.gte=${filters.minRating}`;
            if (filters.decade !== 'todos') { const year = parseInt(filters.decade); baseDiscoverUrl += `&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year + 9}-12-31`; }
            const sortOptionsForVariety = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
            const fetchPromises = sortOptionsForVariety.map(sortBy => { const randomPage = Math.floor(Math.random() * 20) + 1; return fetch(`${baseDiscoverUrl}&sort_by=${sortBy}&page=${randomPage}`); });
            const results = await Promise.allSettled(fetchPromises);
            let allResults = [];
            for (const result of results) { if (result.status === 'fulfilled' && result.value.ok) { const data = await result.value.json(); allResults = allResults.concat(data.results); } else { const reason = result.reason || result.value?.statusText; console.warn(`A variety search failed:`, reason); } }
            return allResults;
        };
        try {
            let initialResults = await fetchPage(100);
            if (initialResults.length === 0) initialResults = await fetchPage(0); 
            const uniqueResults = Array.from(new Set(initialResults.map(m => m.id))).map(id => initialResults.find(m => m.id === id));
            const transformedMovies = uniqueResults.filter(movie => movie && movie.overview && movie.poster_path && movie.release_date).map(movie => ({ id: movie.id.toString(), title: movie.title, synopsis: movie.overview, year: parseInt(movie.release_date.split('-')[0]), imdbRating: movie.vote_average.toFixed(1), genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"], poster: movie.poster_path, }));
            const now = Date.now();
            const unwatchedMovies = transformedMovies.filter(m => !(watchedMovies[m.id] && watchedMovies[m.id] > now));
            setAllMovies(unwatchedMovies);
            if (unwatchedMovies.length > 0) { const newMovie = unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)]; setSelectedMovie(newMovie); setSessionShownMovies(prev => new Set(prev).add(newMovie.id)); } else { setSelectedMovie(null); }
        } catch (err) { console.error("Error discovering movies:", err); setError(String(err).includes("401") ? "Authorization error (401). Check your TMDb API Key." : `Could not discover movies. ${err.message}`); setAllMovies([]); } finally { setIsDiscovering(false); }
    }, [filters, language, userRegion, genresMap, watchedMovies, selectedMovie]);
    const handleSurpriseMe = useCallback(() => {
        const availableMovies = allMovies.filter(m => !sessionShownMovies.has(m.id));
        if (availableMovies.length > 0) { const newMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)]; if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]); setSelectedMovie(newMovie); setSessionShownMovies(prev => new Set(prev).add(newMovie.id)); } else { fetchNewMovieBatch(); }
    }, [allMovies, sessionShownMovies, selectedMovie, fetchNewMovieBatch]);
    useEffect(() => {
        if (!userRegion || typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) return;
        const fetchRegionPlatforms = async () => { try { const response = await fetch(`${TMDB_BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=${userRegion}`); if (!response.ok) throw new Error('Failed to fetch providers for the selected region.'); const data = await response.json(); const flatrateProviders = data.results.filter(p => p.display_priorities?.[userRegion] !== undefined); const regionalProviders = flatrateProviders.sort((a, b) => (a.display_priorities[userRegion]) - (b.display_priorities[userRegion])).map(provider => ({ id: provider.provider_id.toString(), name: provider.provider_name })); setPlatformOptions(regionalProviders); } catch (err) { console.error(err); setPlatformOptions([]); } };
        fetchRegionPlatforms();
    }, [userRegion]);
    useEffect(() => {
        if (searchQuery.trim() === '') { setSearchResults([]); return; }
        setIsSearching(true);
        const searchTimer = setTimeout(async () => { try { const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=${language === 'es' ? 'es-ES' : 'en-US'}`); if (!response.ok) throw new Error("Search failed"); const data = await response.json(); setSearchResults(data.results.slice(0, 5)); } catch (err) { console.error("Search error:", err); setSearchResults([]); } finally { setIsSearching(false); } }, 300);
        return () => clearTimeout(searchTimer);
    }, [searchQuery, language]);
    useEffect(() => {
        const handleClickOutside = (event) => { if (searchRef.current && !searchRef.current.contains(event.target)) { setSearchResults([]); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);
    const fetchFullMovieDetails = useCallback(async (movieId, lang) => { /* ... (This function is unchanged from the previous trailer-only update) ... */ }, [userRegion]);
    useEffect(() => {
        if (selectedMovie && cardRef.current) { cardRef.current.classList.remove('movie-card-enter'); setTimeout(() => cardRef.current.classList.add('movie-card-enter'), 10); }
        setShareStatus('idle');
    }, [selectedMovie]);
    useEffect(() => {
        if (!selectedMovie) return;
        const langParam = language === 'es' ? 'es-ES' : 'en-US';
        setIsFetchingDetails(true); setMovieDetails({});
        fetchFullMovieDetails(selectedMovie.id, langParam).then(details => { if (details) setMovieDetails(details); setIsFetchingDetails(false); });
    }, [selectedMovie, language, fetchFullMovieDetails]);
    useEffect(() => {
        const storedWatched = localStorage.getItem(WATCHED_MOVIES_KEY);
        if (storedWatched) { try { const parsed = JSON.parse(storedWatched); const now = Date.now(); const validWatched = Object.fromEntries(Object.entries(parsed).filter(([_, expiryTimestamp]) => expiryTimestamp > now)); setWatchedMovies(validWatched); } catch (e) { console.error("Could not parse watched movies from localStorage", e); } }
    }, []);
    useEffect(() => {
        localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(watchedMovies));
    }, [watchedMovies]);
    const resetSearchState = () => { setAllMovies([]); setSelectedMovie(null); setHasSearched(false); setMovieHistory([]); setSessionShownMovies(new Set()); };
    const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); resetSearchState(); };
    const handleGenreChange = (genreId, type) => { setFilters(f => { const currentType = f[type] || []; const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; const currentOtherType = f[otherType] || []; const newCurrentList = [...currentType]; const index = newCurrentList.indexOf(genreId); const newOtherList = [...currentOtherType]; const otherIndex = newOtherList.indexOf(genreId); if (index > -1) { newCurrentList.splice(index, 1); } else { newCurrentList.push(genreId); if (otherIndex > -1) { newOtherList.splice(otherIndex, 1); } } return { ...f, [type]: newCurrentList, [otherType]: newOtherList }; }); resetSearchState(); };
    const handlePlatformChange = (id) => { setFilters(f => { const p = [...(f.platform || [])]; const i = p.indexOf(id); i > -1 ? p.splice(i, 1) : p.push(id); return { ...f, platform: p }; }); resetSearchState(); };
    const handleClearFilters = () => { setFilters(initialFilters); resetSearchState(); };
    const handleLanguageSelect = (lang) => setLanguage(lang);
    const handleRegionChange = (newRegion) => setUserRegion(newRegion);
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSearchResultClick = (movie) => { const formattedMovie = { id: movie.id.toString(), title: movie.title, synopsis: movie.overview, year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null, imdbRating: movie.vote_average.toFixed(1), genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"], poster: movie.poster_path, }; if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]); setSelectedMovie(formattedMovie); setSearchQuery(''); setSearchResults([]); };
    const handleGoBack = () => { if (movieHistory.length === 0) return; const newHistory = [...movieHistory]; const previousMovie = newHistory.pop(); setMovieHistory(newHistory); setSelectedMovie(previousMovie); if(selectedMovie) setSessionShownMovies(prev => new Set(prev).add(selectedMovie.id)); };
    const handleMarkAsWatched = (movieId) => { if(!movieId) return; const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000; setWatchedMovies(prev => ({...prev, [movieId]: Date.now() + threeMonths})); setAllMovies(prev => prev.filter(m => m.id !== movieId)); handleSurpriseMe(); };
    const handleShare = useCallback(() => { if (!selectedMovie) return; const movieUrl = `https://www.themoviedb.org/movie/${selectedMovie.id}`; const shareData = { title: selectedMovie.title, text: `Check out this movie I found: ${selectedMovie.title}`, url: movieUrl }; if (navigator.share) { navigator.share(shareData).catch(err => console.error("Couldn't share", err)); } else { navigator.clipboard.writeText(movieUrl).then(() => { setShareStatus('success'); setTimeout(() => setShareStatus('idle'), 2000); }); } }, [selectedMovie]);
    const handleSimilarMovieClick = async (movie) => { setIsFetchingModalDetails(true); setModalMovie(null); const langParam = language === 'es' ? 'es-ES' : 'en-US'; const details = await fetchFullMovieDetails(movie.id, langParam); setModalMovie(details); setIsFetchingModalDetails(false); };
    const handlePlatformSearchChange = (e) => { setPlatformSearchQuery(e.target.value); };
    const filteredPlatforms = useMemo(() => { return platformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())); }, [platformOptions, platformSearchQuery]);
    const closeModal = () => setModalMovie(null);
    const openTrailerModal = () => setIsTrailerModalOpen(true);
    const closeTrailerModal = () => setIsTrailerModalOpen(false);

    // This is a placeholder for the full JSX return statement.
    return (
        <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
            <header>... unchanged ...</header>
            <div className="mb-8 p-6 ...">... unchanged ...</div>
            <div className="text-center mb-10 ...">... unchanged ...</div>
            {selectedMovie ? (
                <div>... unchanged ...</div>
            ) : (
                <div>... unchanged ...</div>
            )}
            {modalMovie && <div>... unchanged ...</div>}
            {isTrailerModalOpen && <div>... unchanged ...</div>}
            <footer/>
        </div>
    );
};
ReactDOM.render(<App />, document.getElementById('root'));