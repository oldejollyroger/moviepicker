const { useState, useEffect, useCallback, useMemo, useRef } = React;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const CURATED_COUNTRY_LIST = new Set([ 'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US' ]);
const THEMES = [ { id: 'theme-purple', color: '#8b5cf6' }, { id: 'theme-ocean', color: '#22d3ee' }, { id: 'theme-forest', color: '#22c55e' }, { id: 'theme-volcano', color: '#dc2626' }, { id: 'theme-sunset', color: '#f97316' }, { id: 'theme-cyberpunk', color: '#d946ef' }, ];

const translations = {
    es: { title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Mostrar Filtros', hideFilters: 'Ocultar Filtros', sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ], region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película específica...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!", noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:', cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', },
    en: { title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'Show Filters', hideFilters: 'Hide Filters', sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ], region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a specific movie...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!", noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', }
};

const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};

const MovieCardContent = ({ movie, details, isFetching, t, userRegion }) => {
    const displayDetails = isFetching ? {} : details;
    return (
        React.createElement(React.Fragment, null,
            React.createElement("h2", { className: "text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words" }, movie.title),
            React.createElement("p", { className: "mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words" }, movie.synopsis),
            React.createElement("div", { className: "mt-6 space-y-4 text-sm" },
                React.createElement("p", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardYear), ` ${movie.year}`),
                isFetching ? React.createElement("div", { className: "inline-flex items-center" }, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardDuration), React.createElement("div", { className: "small-loader" })) : displayDetails.duration && React.createElement("p", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardDuration), ` ${formatDuration(displayDetails.duration)}`),
                React.createElement("p", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardRating), ` ${movie.imdbRating}/10 ⭐`),
                isFetching ? null : displayDetails.director?.name && React.createElement("p", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardDirector), ` ${displayDetails.director.name}`),
                React.createElement("p", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardGenres), ` ${movie.genres.join(', ')}`),
                React.createElement("div", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, `${t.cardAvailableOn} ${userRegion}`), isFetching ? React.createElement("div", { className: "small-loader" }) : displayDetails.providers?.length > 0 ? displayDetails.providers.map(p => (React.createElement("img", { key: p.provider_id, loading: "lazy", src: `${TMDB_IMAGE_BASE_URL}${p.logo_path}`, title: p.provider_name, className: "platform-logo inline-block" }))) : React.createElement("span", { className: "text-[var(--color-text-secondary)]" }, t.cardStreamingNotFound)),
                isFetching ? null : displayDetails.rentalProviders?.length > 0 && (React.createElement("div", null, React.createElement("strong", { className: "text-[var(--color-accent-text)]" }, t.cardAvailableToRent), React.createElement("div", { className: "mt-1" }, displayDetails.rentalProviders.map(p => (React.createElement("img", { key: p.provider_id, loading: "lazy", src: `${TMDB_IMAGE_BASE_URL}${p.logo_path}`, title: p.provider_name, className: "platform-logo inline-block" })))))),
                React.createElement("div", { className: "mt-4" }, React.createElement("strong", { className: "text-[var(--color-accent-text)] block mb-1" }, t.cardCast), isFetching ? React.createElement("div", { className: "small-loader" }) : displayDetails.cast?.length > 0 ? (React.createElement("div", { className: "flex flex-wrap gap-x-4 gap-y-2" }, displayDetails.cast.map(actor => (React.createElement("div", { key: actor.id, className: "flex flex-col items-center text-center w-20" }, React.createElement("img", { loading: "lazy", src: actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}` : 'https://placehold.co/185x278/777/FFF?text=?', alt: actor.name, className: "actor-thumbnail mb-1" }), React.createElement("span", { className: "text-xs text-[var(--color-text-secondary)] leading-tight" }, actor.name)))))) : React.createElement("span", { className: "text-xs text-[var(--color-text-secondary)]" }, t.cardCastNotFound))
            )
        )
    );
};

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem('movieRandomizerLang') || null);
  const [userRegion, setUserRegion] = useState(() => localStorage.getItem('movieRandomizerRegion') || null);
  const [theme, setTheme] = useState(() => localStorage.getItem('movieRandomizerTheme') || 'theme-purple');
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
    }
    return initialFilters;
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
    if (language) {
      localStorage.setItem('movieRandomizerLang', language);
      document.documentElement.lang = language;
    }
  }, [language]);
  useEffect(() => {
    if (userRegion) { localStorage.setItem('movieRandomizerRegion', userRegion); }
  }, [userRegion]);
  useEffect(() => {
    localStorage.setItem('movieRandomizerFilters', JSON.stringify(filters));
  }, [filters]);
    
  useEffect(() => {
    if (!language) {
        setIsLoading(false);
        return;
    }
    const initializeApp = async () => {
        setIsLoading(true);
        setError(null);
        if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY || TMDB_API_KEY === 'YOUR_REAL_API_KEY') {
            setError("API Key not found or is a placeholder. Please check config.js.");
            setIsLoading(false);
            return;
        }
        try {
            const langParam = language === 'es' ? 'es-ES' : 'en-US';
            const [regionsResponse, genresResponse] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/configuration/countries?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${langParam}`)
            ]);
            if (!regionsResponse.ok) throw new Error("Could not fetch TMDb regions");
            if (!genresResponse.ok) throw new Error(`Could not fetch genres (Lang: ${langParam})`);
            const regionsData = await regionsResponse.json();
            const genresData = await genresResponse.json();
            const curatedRegions = regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a, b) => a.english_name.localeCompare(b.english_name));
            setAvailableRegions(curatedRegions);
            setGenresMap(genresData.genres.reduce((acc, genre) => ({ ...acc, [genre.id]: genre.name }), {}));
        } catch (err) {
            console.error("Error during app initialization:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    initializeApp();
  }, [language]);
  
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
    document.documentElement.className = theme;
    localStorage.setItem('movieRandomizerTheme', theme);
  }, [theme]);
  
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

  const fetchFullMovieDetails = useCallback(async (movieId, lang) => {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits,videos,watch/providers,keywords,similar`);
        if (!res.ok) throw new Error(`Details: ${res.statusText}`);
        const data = await res.json();
        const regionProviders = data['watch/providers']?.results?.[userRegion];
        const rentProviders = regionProviders?.rent || [];
        const buyProviders = regionProviders?.buy || [];
        const combinedPayProviders = [...rentProviders, ...buyProviders];
        const uniquePayProviderIds = new Set();
        const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; });
        let similarMovies = data.similar?.results?.filter(m => m.poster_path && m.vote_average > 5 && m.id !== parseInt(movieId)).slice(0, 10) || [];
        return { ...data, duration: data.runtime || null, providers: regionProviders?.flatrate || [], rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 5) || [], director: data.credits?.crew?.find(p => p.job === 'Director') || null, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMovies };
    } catch (err) { console.error("Error fetching all details for movie", movieId, err); return null; }
  }, [userRegion]);

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
  const handleLanguageSelect = (lang) => { setLanguage(lang); };
  const handleRegionChange = (newRegion) => { setUserRegion(newRegion); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); };
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

  if (isLoading && !language) {
    return ( React.createElement("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center" }, React.createElement("div", { className: "loader" })) );
  }

  if (!language) {
    return (
        React.createElement("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center" },
            React.createElement("div", { className: "text-center max-w-md" },
                React.createElement("h1", { className: "text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-6" }, "Select Your Language"),
                React.createElement("div", { className: "flex justify-center gap-4" },
                    React.createElement("button", { onClick: () => handleLanguageSelect('es'), className: "px-8 py-3 bg-[var(--color-card-bg)] hover:bg-[var(--color-accent)] rounded-lg font-bold text-lg transition-colors" }, "Español"),
                    React.createElement("button", { onClick: () => handleLanguageSelect('en'), className: "px-8 py-3 bg-[var(--color-card-bg)] hover:bg-[var(--color-accent)] rounded-lg font-bold text-lg transition-colors" }, "English")
                )
            )
        )
    );
  }

  if (isLoading) {
    return ( React.createElement("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center" }, React.createElement("div", { className: "loader" })) );
  }
  if (error) {
    return ( React.createElement("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center" }, React.createElement("div", { className: "text-center" }, React.createElement("h1", { className: "text-3xl font-bold text-red-500 mb-4" }, "Error"), React.createElement("p", { className: "text-xl" }, error))) );
  }

  if (!userRegion) {
    return (
        React.createElement("div", { className: "min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center" },
            React.createElement("div", { className: "text-center max-w-md" },
                React.createElement("h1", { className: "text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4" }, t.selectRegionPrompt),
                React.createElement("select", { id: "initial-region-filter", onChange: e => handleRegionChange(e.target.value), defaultValue: "", className: "w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]" },
                    React.createElement("option", { value: "", disabled: true }, "-- ", t.region, " --"),
                    availableRegions.map(region => (React.createElement("option", { key: region.iso_3166_1, value: region.iso_3166_1 }, region.english_name)))
                )
            )
        )
    );
  }
  
  return (
    React.createElement("div", { className: "min-h-screen p-4 sm:p-8 font-sans app-container relative" },
      React.createElement("div", { className: "absolute top-4 right-4 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 z-10" },
        React.createElement("div", { className: "flex items-center gap-1 bg-[var(--color-card-bg)] p-1 rounded-full" }, THEMES.map(themeOption => (React.createElement("button", { key: themeOption.id, onClick: () => setTheme(themeOption.id), className: `w-6 h-6 rounded-full transition-transform duration-150 ${theme === themeOption.id ? 'scale-125 ring-2 ring-white' : ''}`, style: { backgroundColor: themeOption.color } })))),
        React.createElement("div", { className: "flex items-center bg-[var(--color-card-bg)] p-1 rounded-full" }, React.createElement("button", { onClick: () => setLanguage('es'), className: `lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}` }, "Español"), React.createElement("button", { onClick: () => setLanguage('en'), className: `lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}` }, "English"))
      ),
      React.createElement("header", { className: "text-center mb-4 pt-24 sm:pt-16" }, React.createElement("h1", { className: "text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]" }, t.title), React.createElement("h2", { className: "text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2" }, t.subtitle), React.createElement("div", { className: "max-w-xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-4" }, React.createElement("div", { ref: searchRef, className: "relative w-full sm:flex-grow" }, React.createElement("input", { type: "text", value: searchQuery, onChange: handleSearchChange, placeholder: t.searchPlaceholder, className: "w-full p-3 pl-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]" }), React.createElement("div", { className: "absolute top-0 left-0 inline-flex items-center p-3" }, isSearching ? React.createElement("div", { className: "small-loader !m-0 !w-5 !h-5" }) : React.createElement("svg", { className: "w-5 h-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }))), searchResults.length > 0 && (React.createElement("ul", { className: "absolute w-full mt-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto" }, searchResults.map(movie => (React.createElement("li", { key: movie.id, onClick: () => handleSearchResultClick(movie), className: "p-3 hover:bg-[var(--color-bg)] cursor-pointer flex items-center gap-4" }, React.createElement("img", { loading: "lazy", src: movie.poster_path ? `${TMDB_THUMBNAIL_BASE_URL}${movie.poster_path}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?', alt: movie.title, className: "w-12 h-auto rounded-md" }), React.createElement("div", { className: "text-left" }, React.createElement("p", { className: "font-semibold text-[var(--color-text-primary)]" }, movie.title), React.createElement("p", { className: "text-sm text-[var(--color-text-secondary)]" }, movie.release_date?.split('-')[0])))))))), React.createElement("button", { onClick: () => setIsFiltersVisible(!isFiltersVisible), className: "w-full sm:w-auto px-4 py-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full text-sm font-semibold hover:bg-[var(--color-accent)] transition-colors whitespace-nowrap" }, isFiltersVisible ? t.hideFilters : t.showFilters))),
      isFiltersVisible && (
        React.createElement("div", { className: "mb-8 p-6 bg-[var(--color-header-bg)] rounded-xl shadow-2xl" },
          React.createElement("div", { className: "flex justify-between items-center mb-6" }, React.createElement("h2", { className: "text-2xl font-semibold text-[var(--color-accent-text)]" }, t.advancedFilters), React.createElement("button", { onClick: handleClearFilters, className: "text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg transition-colors" }, t.clearFilters)),
          React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8" },
            React.createElement("div", { className: "space-y-4" }, React.createElement("div", null, React.createElement("label", { htmlFor: "region-filter", className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-1" }, t.region), React.createElement("select", { id: "region-filter", value: userRegion, onChange: e => handleRegionChange(e.target.value), className: "w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]" }, availableRegions.map(region => (React.createElement("option", { key: region.iso_3166_1, value: region.iso_3166_1 }, region.english_name))))), React.createElement("div", null, React.createElement("label", { htmlFor: "decade-filter", className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-1" }, t.decade), React.createElement("select", { id: "decade-filter", value: filters.decade, onChange: e => handleFilterChange('decade', e.target.value), className: "w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]" }, React.createElement("option", { value: "todos" }, t.allDecades), [2020, 2010, 2000, 1990, 1980, 1970].map(d=>(React.createElement("option", { key: d, value: d }, `${d}s`))))), React.createElement("div", null, React.createElement("label", { htmlFor: "rating-filter", className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-1" }, t.minRating, " ", Number(filters.minRating).toFixed(1)), React.createElement("input", { type: "range", id: "rating-filter", min: "0", max: "9.5", step: "0.5", value: filters.minRating, onChange: e => handleFilterChange('minRating', e.target.value), className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" }))),
            React.createElement("div", null, React.createElement("label", { className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-2" }, t.includeGenre), React.createElement("div", { className: "filter-checkbox-list space-y-1" }, Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (React.createElement("div", { key: `inc-${id}`, className: "flex items-center" }, React.createElement("input", { id: `inc-genre-${id}`, type: "checkbox", checked: filters.genre.includes(id), onChange: () => handleGenreChange(id, 'genre'), disabled: filters.excludeGenres.includes(id), className: "h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50" }), React.createElement("label", { htmlFor: `inc-genre-${id}`, className: `ml-2 text-sm text-[var(--color-text-secondary)] ${filters.excludeGenres.includes(id) ? 'opacity-50' : ''}` }, name)))))),
            React.createElement("div", null, React.createElement("label", { className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-2" }, t.excludeGenre), React.createElement("div", { className: "filter-checkbox-list space-y-1" }, Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (React.createElement("div", { key: `ex-${id}`, className: "flex items-center" }, React.createElement("input", { id: `ex-genre-${id}`, type: "checkbox", checked: filters.excludeGenres.includes(id), onChange: () => handleGenreChange(id, 'excludeGenres'), disabled: filters.genre.includes(id), className: "h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50" }), React.createElement("label", { htmlFor: `ex-genre-${id}`, className: `ml-2 text-sm text-[var(--color-text-secondary)] ${filters.genre.includes(id) ? 'opacity-50' : ''}` }, name)))))),
            React.createElement("div", null, React.createElement("label", { className: "block text-sm font-medium text-[var(--color-text-secondary)] mb-2" }, t.platform), React.createElement("input", { type: "text", value: platformSearchQuery, onChange: handlePlatformSearchChange, placeholder: t.platformSearchPlaceholder, className: "w-full p-2 mb-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm" }), React.createElement("div", { className: "platform-list-container grid grid-cols-2 gap-x-4 gap-y-2" }, filteredPlatforms.length > 0 ? filteredPlatforms.map(p => (React.createElement("div", { key: p.id, className: "flex items-center" }, React.createElement("input", { id: `platform-${p.id}`, type: "checkbox", checked: filters.platform.includes(p.id), onChange: () => handlePlatformChange(p.id), className: "h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]" }), React.createElement("label", { htmlFor: `platform-${p.id}`, className: "ml-2 text-sm text-[var(--color-text-secondary)]" }, p.name)))) : React.createElement("p", { className: "text-sm text-gray-400 col-span-2" }, "No matching platforms.")))
          )
        )
      ),
      React.createElement("div", { className: "text-center mb-10 flex justify-center items-center gap-4" },
        React.createElement("button", { onClick: handleGoBack, disabled: movieHistory.length === 0, className: "p-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }))),
        React.createElement("button", { onClick: handleSurpriseMe, disabled: isDiscovering, className: `px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed` }, isDiscovering ? t.searching : t.surpriseMe)
      ),
      selectedMovie ? ( 
          React.createElement("div", { ref: cardRef, className: "max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10" },
              React.createElement("div", { className: "flex flex-col sm:flex-row" },
                  React.createElement("div", { className: "sm:w-1/3 flex-shrink-0" },
                      React.createElement("div", { className: "relative poster-container" },
                          React.createElement("img", { loading: "lazy", className: "h-auto w-3/5 sm:w-full mx-auto sm:mx-0 object-cover", src: `${TMDB_IMAGE_BASE_URL}${selectedMovie.poster}`, alt: `Poster for ${selectedMovie.title}` })
                      ),
                      !isFetchingDetails && movieDetails.trailerKey && (
                          React.createElement("div", { className: "p-4 flex justify-center" },
                              React.createElement("button", { onClick: openTrailerModal, className: "w-full max-w-[300px] rounded-lg overflow-hidden relative group shadow-lg hover:shadow-2xl transition-shadow" },
                                  React.createElement("img", { loading: "lazy", src: `https://img.youtube.com/vi/${movieDetails.trailerKey}/mqdefault.jpg`, alt: "Trailer thumbnail", className: "w-full" }),
                                  React.createElement("div", { className: "absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center" },
                                      React.createElement("div", { className: "bg-black/50 backdrop-blur-sm rounded-full p-3" },
                                          React.createElement("svg", { className: "w-8 h-8 text-white", fill: "currentColor", viewBox: "0 0 20 20" }, React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }))
                                      )
                                  )
                              )
                          )
                      )
                  ),
                  React.createElement("div", { className: "p-6 sm:p-8 sm:w-2/3" },
                      React.createElement(MovieCardContent, { movie: selectedMovie, details: movieDetails, isFetching: isFetchingDetails, t: t, userRegion: userRegion }),
                      React.createElement("div", { className: "mt-8 flex flex-col sm:flex-row gap-4" },
                         React.createElement("button", { onClick: () => handleMarkAsWatched(selectedMovie.id), className: "w-full py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors" }, t.cardMarkAsWatched),
                         React.createElement("button", { onClick: handleShare, className: "w-full py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors" },
                           shareStatus === 'success' ? t.shareSuccess : t.shareButton
                         )
                      )
                  )
              ),
              React.createElement("div", { className: "p-6 bg-[var(--color-bg)] border-t border-[var(--color-border)]" },
                  React.createElement("h3", { className: "text-xl font-semibold text-[var(--color-accent-text)] mb-3" }, t.cardSimilarMovies),
                  isFetchingDetails ? React.createElement("div", { className: "flex justify-center" }, React.createElement("div", { className: "small-loader" })) :  movieDetails.similar?.length > 0 ? ( 
                      React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 place-items-center" },
                          movieDetails.similar.map(movie => ( 
                              React.createElement("button", { key: movie.id, onClick: () => handleSimilarMovieClick(movie), className: "w-full text-center hover:scale-105 transition-transform duration-150 group" },
                                  React.createElement("img", { loading: "lazy", src: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=No+Poster', alt: movie.title, className: "rounded-lg mb-1 w-full h-auto object-cover" }),
                                  React.createElement("span", { className: "text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors" }, movie.title)
                              ) 
                          ))
                      ) 
                  ) : React.createElement("p", { className: "text-sm text-gray-400 col-span-full" }, t.noMoviesFound)
              )
          ) ) : ( React.createElement("div", { className: "text-center text-gray-400 mt-10 text-lg" }, hasSearched && allMovies.length === 0 && !isDiscovering ? t.noMoviesFound : !hasSearched && t.welcomeMessage) ),
      modalMovie && (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4", onClick: closeModal }, React.createElement("div", { className: "bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative", onClick: (e) => e.stopPropagation() }, React.createElement("button", { onClick: closeModal, className: "absolute top-3 right-3 text-white bg-gray-900 rounded-full p-1 hover:bg-gray-700 z-10" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }))), isFetchingModalDetails ? React.createElement("div", { className: "h-96 flex items-center justify-center" }, React.createElement("div", { className: "loader" })) : (
        React.createElement("div", { className: "max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden" },
            React.createElement("div", { className: "flex flex-col sm:flex-row" },
                React.createElement("div", { className: "sm:w-1/3 flex-shrink-0" },
                    React.createElement("img", { loading: "lazy", className: "h-auto w-3/5 sm:w-full mx-auto sm:mx-0 object-cover", src: `${TMDB_IMAGE_BASE_URL}${modalMovie.poster_path}`, alt: `Poster for ${modalMovie.title}` })
                ),
                React.createElement("div", { className: "p-6 sm:p-8 sm:w-2/3" },
                    React.createElement(MovieCardContent, {
                        movie: {
                            title: modalMovie.title,
                            synopsis: modalMovie.overview,
                            year: modalMovie.release_date?.split('-')[0],
                            imdbRating: modalMovie.vote_average?.toFixed(1),
                            genres: modalMovie.genres?.map(g => g.name) || [],
                        },
                        details: modalMovie,
                        isFetching: false,
                        t: t,
                        userRegion: userRegion
                    })
                )
            ),
            modalMovie.trailerKey && (React.createElement("div", { className: "p-6 bg-[var(--color-card-bg)]/50" }, React.createElement("h3", { className: "text-xl font-semibold text-[var(--color-accent-text)] mb-2" }, t.cardTrailer), React.createElement("div", { className: "trailer-responsive rounded-lg overflow-hidden" }, React.createElement("iframe", { src: `https://www.youtube.com/embed/${modalMovie.trailerKey}`, title: "Trailer", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true }))))
        )
      )))),
      React.createElement("footer", { className: "text-center mt-12 py-6 text-sm text-[var(--color-text-subtle)]" }, React.createElement("p", null, t.footer, " ", React.createElement("a", { href: "https://www.themoviedb.org/", target: "_blank", rel: "noopener noreferrer", className: "text-[var(--color-accent-text)] hover:underline" }, "TMDb"), ".")),
      isTrailerModalOpen && movieDetails.trailerKey && (
        React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4", onClick: closeTrailerModal },
            React.createElement("div", { className: "bg-black rounded-xl w-full max-w-4xl aspect-video relative", onClick: (e) => e.stopPropagation() },
                React.createElement("button", { onClick: closeTrailerModal, className: "absolute -top-3 -right-3 text-white bg-gray-900 rounded-full p-1 hover:bg-gray-700 z-10" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }))
                ),
                React.createElement("div", { className: "trailer-responsive rounded-lg overflow-hidden" },
                    React.createElement("iframe", { src: `https://www.youtube.com/embed/${movieDetails.trailerKey}?autoplay=1`, title: "Trailer", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true })
                )
            )
        )
      )
    )
  );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));