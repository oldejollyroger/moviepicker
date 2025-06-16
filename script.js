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
    { id: 'theme-purple', color: '#8b5cf6' },
    { id: 'theme-ocean', color: '#22d3ee' },
    { id: 'theme-forest', color: '#22c55e' },
    { id: 'theme-volcano', color: '#dc2626' },
    { id: 'theme-sunset', color: '#f97316' },
    { id: 'theme-cyberpunk', color: '#d946ef' },
];

// HIGHLIGHT: Added new translation keys for the toggle button
const translations = {
    es: {
        title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros',
        showFilters: 'Mostrar Filtros', hideFilters: 'Ocultar Filtros',
        sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ],
        region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:',
        decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:',
        surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...',
        searchPlaceholder: 'O busca una película específica...',
        welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!",
        noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:',
        cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):',
        cardAvailableToRent: 'Disponible para Alquilar/Comprar:',
        cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.',
        cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Tráiler', cardTrailerNotFound: 'Tráiler no disponible.',
        cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de',
    },
    en: {
        title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters',
        showFilters: 'Show Filters', hideFilters: 'Hide Filters',
        sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ],
        region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:',
        decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:',
        surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...',
        searchPlaceholder: 'Or search for a specific movie...',
        welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!",
        noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:',
        cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):',
        cardAvailableToRent: 'Available for Rent or Buy:',
        cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.',
        cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Trailer', cardTrailerNotFound: 'Trailer not available.',
        cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of',
    }
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
  
  const initialFilters = { 
      genre: [], excludeGenres: [],
      decade: 'todos', platform: [], 
      sortBy: 'popularity.desc', minRating: 0
  };
  const [filters, setFilters] = useState(initialFilters);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  
  const [hasSearched, setHasSearched] = useState(false);
  
  // HIGHLIGHT: New state for controlling filter visibility
  const [isFiltersVisible, setIsFiltersVisible] = useState(window.innerWidth > 768);

  const WATCHED_MOVIES_KEY = 'watchedUserMoviesRandomizer_TMDb_v8';
  const [watchedMovies, setWatchedMovies] = useState({});
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());

  // --- Effects ---
  
  useEffect(() => {
    const initializeApp = async () => {
        if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            setError("API Key not found or is placeholder. Please check config.js and your deployment secrets.");
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

            const curatedRegions = regionsData
                .filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1))
                .sort((a, b) => a.english_name.localeCompare(b.english_name));
            setAvailableRegions(curatedRegions);
            setGenresMap(genresData.genres.reduce((acc, genre) => ({ ...acc, [genre.id]: genre.name }), {}));
            
        } catch (err) {
            console.error("Error during app initialization:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    if (language) {
      initializeApp();
    }
  }, [language]);

  useEffect(() => {
    if (!userRegion || typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') return;
    
    setFilters(f => ({ ...f, platform: [] }));

    const fetchRegionPlatforms = async () => {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=${userRegion}`);
            if (!response.ok) throw new Error('Failed to fetch providers for the selected region.');
            const data = await response.json();
            
            const flatrateProviders = data.results.filter(p => p.display_priorities?.[userRegion] !== undefined);
            const regionalProviders = flatrateProviders
                .sort((a, b) => (a.display_priorities[userRegion]) - (b.display_priorities[userRegion]))
                .map(provider => ({ id: provider.provider_id.toString(), name: provider.provider_name }));
            
            setPlatformOptions(regionalProviders);
        } catch (err) { console.error(err); setPlatformOptions([]); }
    };
    fetchRegionPlatforms();
  }, [userRegion]);


  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('movieRandomizerTheme', theme);
  }, [theme]);
  
  const discoverAndSetMovies = useCallback(async () => {
    if (!userRegion || !genresMap || Object.keys(genresMap).length === 0) return;

    setIsLoading(true);
    setError(null);
    setSelectedMovie(null);
    setHasSearched(true);

    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    
    const fetchPage = async (voteCount) => {
        let providersToQuery = [...filters.platform];
        if (providersToQuery.includes('384') && !providersToQuery.includes('1899')) {
            providersToQuery.push('1899');
        }
        
        let baseDiscoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam}&vote_count.gte=${voteCount}&watch_region=${userRegion}`;
        
        if (providersToQuery.length > 0) {
            baseDiscoverUrl += `&with_watch_providers=${providersToQuery.join('|')}&with_watch_monetization_types=flatrate`;
        }

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

        const responses = await Promise.all(fetchPromises);
        let allResults = [];
        for (const response of responses) {
            if (response.ok) {
                const data = await response.json();
                allResults = allResults.concat(data.results);
            } else { console.warn(`A variety search failed: ${response.statusText}`); }
        }
        return allResults;
    };

    try {
        let initialResults = await fetchPage(100);
        if (initialResults.length === 0) {
            initialResults = await fetchPage(0); 
        }

        const uniqueResults = Array.from(new Set(initialResults.map(m => m.id))).map(id => initialResults.find(m => m.id === id));
        const transformedMovies = uniqueResults
            .filter(movie => movie && movie.overview && movie.poster_path && movie.release_date)
            .map(movie => ({
                id: movie.id.toString(),
                title: movie.title,
                synopsis: movie.overview,
                year: parseInt(movie.release_date.split('-')[0]),
                imdbRating: movie.vote_average.toFixed(1),
                genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"],
                poster: movie.poster_path,
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
        setIsLoading(false);
    }
  }, [filters, language, userRegion, genresMap, watchedMovies]);


  useEffect(() => {
    if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
    }

    setIsSearching(true);
    const searchTimer = setTimeout(async () => {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=${language === 'es' ? 'es-ES' : 'en-US'}`);
            if (!response.ok) throw new Error("Search failed");
            const data = await response.json();
            setSearchResults(data.results.slice(0, 5));
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, language]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setSearchResults([]);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
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
        const uniquePayProviders = combinedPayProviders.filter(p => {
            if (uniquePayProviderIds.has(p.provider_id)) return false;
            uniquePayProviderIds.add(p.provider_id);
            return true;
        });

        let similarMovies = [];
        const similarIds = new Set([parseInt(movieId)]);
        const MAX_SIMILAR = 10;

        const fetchAndAdd = async (url) => {
            if (similarMovies.length >= MAX_SIMILAR) return;
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    const results = data.parts || data.results;
                    if (results) {
                        for (const movie of results) {
                            if (!similarIds.has(movie.id) && movie.poster_path && movie.vote_average > 5) {
                                similarMovies.push(movie);
                                similarIds.add(movie.id);
                                if (similarMovies.length >= MAX_SIMILAR) break;
                            }
                        }
                    }
                }
            } catch (e) { console.warn("Similar movies fetch failed for url:", url, e); }
        };

        const keywords = data.keywords?.keywords || [];
        const companies = data.production_companies || [];
        
        if (data.belongs_to_collection) await fetchAndAdd(`${TMDB_BASE_URL}/collection/${data.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=${lang}`);
        if (keywords.length > 0) await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&with_keywords=${keywords[0].id}&sort_by=popularity.desc`);
        if (companies.length > 0) await fetchAndAdd(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&with_companies=${companies[0].id}&sort_by=popularity.desc`);
        if (similarMovies.length < MAX_SIMILAR) await fetchAndAdd(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=${lang}`);

        return {
            ...data, 
            duration: data.runtime || null,
            providers: regionProviders?.flatrate || [],
            rentalProviders: uniquePayProviders,
            cast: data.credits?.cast?.slice(0, 5) || [],
            director: data.credits?.crew?.find(p => p.job === 'Director') || null,
            trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null,
            similar: similarMovies.slice(0, MAX_SIMILAR)
        };
    } catch (err) {
        console.error("Error fetching all details for movie", movieId, err);
        return null;
    }
  }, [userRegion]);

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

  useEffect(() => {
    const storedWatched = localStorage.getItem(WATCHED_MOVIES_KEY);
    if (storedWatched) {
      try {
        const parsed = JSON.parse(storedWatched);
        const now = Date.now();
        const validWatched = Object.fromEntries(
          Object.entries(parsed).filter(([_, expiryTimestamp]) => expiryTimestamp > now)
        );
        setWatchedMovies(validWatched);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(watchedMovies));
  }, [watchedMovies]);
  
  // --- Handlers ---
  const resetSession = () => { setSessionShownMovies(new Set()); setMovieHistory([]); };
  const handleFilterChange = (type, value) => {
    setFilters(f => ({ ...f, [type]: value }));
    resetSession(); 
  };
  const handleGenreChange = (genreId, type) => {
    setFilters(f => {
        const list = [...f[type]];
        const i = list.indexOf(genreId);
        const otherType = type === 'genre' ? 'excludeGenres' : 'genre';
        if (i > -1) { list.splice(i, 1); } 
        else { 
            list.push(genreId);
            const otherList = [...f[otherType]];
            const otherIndex = otherList.indexOf(genreId);
            if(otherIndex > -1) otherList.splice(otherIndex, 1);
            return { ...f, [type]: list, [otherType]: otherList };
        }
        return { ...f, [type]: list };
    });
    resetSession();
  };
  const handlePlatformChange = (id) => {
      setFilters(f => {
          const p = [...f.platform]; const i = p.indexOf(id);
          i > -1 ? p.splice(i, 1) : p.push(id);
          return { ...f, platform: p };
      });
      resetSession();
  };
  const handleClearFilters = () => { setFilters(initialFilters); resetSession(); };
  const handleRegionChange = (newRegion) => { setUserRegion(newRegion); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); };
  
  const handleSearchResultClick = (movie) => {
    const formattedMovie = {
        id: movie.id.toString(),
        title: movie.title,
        synopsis: movie.overview,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
        imdbRating: movie.vote_average.toFixed(1),
        genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"],
        poster: movie.poster_path,
    };
    if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]);
    setSelectedMovie(formattedMovie);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleGoBack = () => {
      if (movieHistory.length === 0) return;
      const newHistory = [...movieHistory];
      const previousMovie = newHistory.pop();
      setMovieHistory(newHistory);
      setSelectedMovie(previousMovie);
      if(selectedMovie) setSessionShownMovies(prev => new Set(prev).add(selectedMovie.id));
  };

  const handleMarkAsWatched = (movieId) => {
    if(!movieId) return;
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    setWatchedMovies(prev => ({...prev, [movieId]: Date.now() + threeMonths}));
    discoverAndSetMovies();
  };
  
  const handleSimilarMovieClick = async (movie) => {
    setIsFetchingModalDetails(true);
    setModalMovie(null);
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    const details = await fetchFullMovieDetails(movie.id, langParam);
    setModalMovie(details);
    setIsFetchingModalDetails(false);
  };
  
  const handlePlatformSearchChange = (e) => { setPlatformSearchQuery(e.target.value); };

  const filteredPlatforms = useMemo(() => {
    return platformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase()));
  }, [platformOptions, platformSearchQuery]);

  const closeModal = () => setModalMovie(null);

  const formatDuration = (totalMinutes) => {
      if (!totalMinutes || totalMinutes <= 0) return null;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}min`;
  };
  
  // --- Render Logic ---
  if (isLoading && availableRegions.length === 0) {
    return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="loader"></div></div> );
  }
  if (error) {
    return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1><p className="text-xl">{error}</p></div></div> );
  }

  if (!userRegion) {
    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center">
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>
                <select 
                    id="initial-region-filter" 
                    onChange={e => handleRegionChange(e.target.value)}
                    defaultValue=""
                    className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                >
                    <option value="" disabled>-- {t.region} --</option>
                    {availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}
                </select>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1 bg-[var(--color-card-bg)] p-1 rounded-full">{THEMES.map(themeOption => (<button key={themeOption.id} onClick={() => setTheme(themeOption.id)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${theme === themeOption.id ? 'scale-125 ring-2 ring-white' : ''}`} style={{backgroundColor: themeOption.color}}></button>))}</div>
      </div>

      <header className="text-center mb-4 pt-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
        <h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2>
        
        <div className="max-w-xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div ref={searchRef} className="relative w-full sm:flex-grow">
            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder={t.searchPlaceholder} className="w-full p-3 pl-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"/>
            <div className="absolute top-0 left-0 inline-flex items-center p-3">{isSearching ? <div className="small-loader !m-0 !w-5 !h-5"></div> : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}</div>
            {searchResults.length > 0 && (<ul className="absolute w-full mt-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">{searchResults.map(movie => (<li key={movie.id} onClick={() => handleSearchResultClick(movie)} className="p-3 hover:bg-[var(--color-bg)] cursor-pointer flex items-center gap-4"><img src={movie.poster_path ? `${TMDB_THUMBNAIL_BASE_URL}${movie.poster_path}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={movie.title} className="w-12 h-auto rounded-md" /><div className="text-left"><p className="font-semibold text-[var(--color-text-primary)]">{movie.title}</p><p className="text-sm text-[var(--color-text-secondary)]">{movie.release_date?.split('-')[0]}</p></div></li>))}</ul>)}
          </div>
          {/* HIGHLIGHT: New Toggle Filters Button */}
          <button onClick={() => setIsFiltersVisible(!isFiltersVisible)} className="w-full sm:w-auto px-4 py-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full text-sm font-semibold hover:bg-[var(--color-accent)] transition-colors whitespace-nowrap">
            {isFiltersVisible ? t.hideFilters : t.showFilters}
          </button>
        </div>
      </header>

      {/* HIGHLIGHT: The entire filter section is now conditional */}
      {isFiltersVisible && (
        <div className="mb-8 p-6 bg-[var(--color-header-bg)] rounded-xl shadow-2xl">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2><button onClick={handleClearFilters} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg transition-colors">{t.clearFilters}</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            <div className="space-y-4">
              <div><label htmlFor="region-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.region}</label><select id="region-filter" value={userRegion} onChange={e => handleRegionChange(e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">{availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}</select></div>
              <div><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={e => handleFilterChange('decade', e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
              <div><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={e => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" /></div>
            </div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.includeGenre}</label><div className="filter-checkbox-list space-y-1">{Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`inc-${id}`} className="flex items-center"><input id={`inc-genre-${id}`} type="checkbox" checked={filters.genre.includes(id)} onChange={() => handleGenreChange(id, 'include')} disabled={filters.excludeGenres.includes(id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50"/><label htmlFor={`inc-genre-${id}`} className={`ml-2 text-sm text-[var(--color-text-secondary)] ${filters.excludeGenres.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-1">{Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`ex-${id}`} className="flex items-center"><input id={`ex-genre-${id}`} type="checkbox" checked={filters.excludeGenres.includes(id)} onChange={() => handleGenreChange(id, 'exclude')} disabled={filters.genre.includes(id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50"/><label htmlFor={`ex-genre-${id}`} className={`ml-2 text-sm text-[var(--color-text-secondary)] ${filters.genre.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.platform}</label><input type="text" value={platformSearchQuery} onChange={handlePlatformSearchChange} placeholder={t.platformSearchPlaceholder} className="w-full p-2 mb-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm" /><div className="grid grid-cols-2 gap-x-4 gap-y-2 filter-checkbox-list" style={{maxHeight: '160px'}}>{filteredPlatforms.length > 0 ? filteredPlatforms.map(p => (<div key={p.id} className="flex items-center"><input id={`platform-${p.id}`} type="checkbox" checked={filters.platform.includes(p.id)} onChange={() => handlePlatformChange(p.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`platform-${p.id}`} className="ml-2 text-sm text-[var(--color-text-secondary)]">{p.name}</label></div>)) : <p className="text-sm text-gray-400 col-span-2">No matching platforms.</p>}</div></div>
          </div>
        </div>
      )}

      <div className="text-center mb-10 flex justify-center items-center gap-4"><button onClick={handleGoBack} disabled={movieHistory.length === 0} className="p-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button><button onClick={discoverAndSetMovies} disabled={isLoading} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isLoading ? t.searching : t.surpriseMe}</button></div>
      
      {/* ... (The rest of the JSX for movie cards, modals, etc. remains unchanged) ... */}
      
       <footer className="text-center mt-12 py-6 text-sm text-[var(--color-text-subtle)]"><p>{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p></footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));