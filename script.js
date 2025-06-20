// --- React and Hooks ---
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// --- This script assumes a file named 'config.js' exists and provides TMDB_API_KEY ---

// --- Constants ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';
const USER_REGION_KEY = 'moviePickerUserRegion';

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

const translations = {
    es: {
        title: 'Movie Picker', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros',
        showFilters: 'Mostrar Filtros', hideFilters: 'Ocultar Filtros',
        sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ],
        region: 'País:', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:',
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
        title: 'Movie Picker', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters',
        showFilters: 'Show Filters', hideFilters: 'Hide Filters',
        sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ],
        region: 'Country:', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:',
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
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState(() => localStorage.getItem('moviePickerTheme') || 'theme-purple');
  const t = translations[language] || translations['en']; 
  const [userRegion, setUserRegion] = useState(() => localStorage.getItem(USER_REGION_KEY) || 'US');
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(window.innerWidth > 768);
  const WATCHED_MOVIES_KEY = 'watchedMoviePickerMovies_v1';
  const [watchedMovies, setWatchedMovies] = useState({});
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());

  useEffect(() => {
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    const fetchInitialData = async () => {
      try {
        const [regionsResponse, genresResponse] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/configuration/countries?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${langParam}`)
        ]);
        if (!regionsResponse.ok || !genresResponse.ok) throw new Error("Failed to fetch initial data.");
        const regionsData = await regionsResponse.json();
        const genresData = await genresResponse.json();
        setAvailableRegions(regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a,b) => a.english_name.localeCompare(b.english_name)));
        setGenresMap(genresData.genres.reduce((acc, genre) => ({...acc, [genre.id]: genre.name}), {}));
      } catch (err) {
        setError(err.message);
      }
    };
    fetchInitialData();
  }, [language]);

  useEffect(() => {
    if (!userRegion) return;
    localStorage.setItem(USER_REGION_KEY, userRegion);
    const fetchRegionPlatforms = async () => {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=${userRegion}`);
            if (!response.ok) throw new Error('Failed to fetch providers.');
            const data = await response.json();
            const regionalProviders = data.results.filter(p => p.display_priorities?.[userRegion] !== undefined).sort((a,b) => a.display_priorities[userRegion] - b.display_priorities[userRegion]).map(p => ({ id: p.provider_id.toString(), name: p.provider_name }));
            setPlatformOptions(regionalProviders);
        } catch (err) { console.error(err); setPlatformOptions([]); }
    };
    fetchRegionPlatforms();
  }, [userRegion]);


  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('moviePickerTheme', theme);
  }, [theme]);
  
  const discoverAndSetMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]);
    setHasSearched(true);
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    
    const fetchPage = async (voteCount) => {
        let providersToQuery = [...filters.platform];
        if (providersToQuery.includes('384') && !providersToQuery.includes('1899')) providersToQuery.push('1899');
        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam}&sort_by=${filters.sortBy}&vote_count.gte=${voteCount}&watch_region=${userRegion}`;
        if (providersToQuery.length > 0) url += `&with_watch_providers=${providersToQuery.join('|')}&with_watch_monetization_types=flatrate`;
        if (filters.genre.length > 0) url += `&with_genres=${filters.genre.join(',')}`;
        if (filters.excludeGenres.length > 0) url += `&without_genres=${filters.excludeGenres.join(',')}`;
        if (filters.minRating > 0) url += `&vote_average.gte=${filters.minRating}`;
        if (filters.decade !== 'todos') {
            const year = parseInt(filters.decade);
            url += `&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year + 9}-12-31`;
        }
        url += `&page=${Math.floor(Math.random() * 10) + 1}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API request failed.");
        return res.json();
    };

    try {
        let results = [];
        const data = await fetchPage(100);
        results.push(...data.results);
        
        if(results.length < 20) {
            const data2 = await fetchPage(0);
            results.push(...data2.results);
        }
        
        const now = Date.now();
        const validMovies = Array.from(new Set(results.map(m => m.id)))
            .map(id => results.find(m => m.id === id))
            .filter(m => m && m.poster_path && m.overview && !(watchedMovies[m.id] && watchedMovies[m.id] > now) && !sessionShownMovies.has(m.id));

        if (validMovies.length > 0) {
            const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
            setSelectedMovie(randomMovie);
            setSessionShownMovies(prev => new Set(prev).add(randomMovie.id));
        } else {
            setSessionShownMovies(new Set()); // Reset session if we run out of movies
            setError(t.noMoviesFound);
            setSelectedMovie(null);
        }
    } catch(err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, [filters, language, userRegion, sessionShownMovies, watchedMovies, t]);

  const fetchFullMovieDetails = useCallback(async (movieId) => {
    setIsFetchingDetails(true);
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${langParam}&append_to_response=credits,videos,watch/providers`);
        if (!res.ok) throw new Error("Failed to fetch movie details.");
        const data = await res.json();
        const regionProviders = data['watch/providers']?.results?.[userRegion];
        const rent = regionProviders?.rent || [];
        const buy = regionProviders?.buy || [];
        const combined = [...rent, ...buy];
        const uniquePay = Array.from(new Set(combined.map(p => p.provider_id))).map(id => combined.find(p => p.provider_id === id));
        setMovieDetails({
            duration: data.runtime,
            director: data.credits?.crew.find(p => p.job === 'Director'),
            cast: data.credits?.cast.slice(0, 5),
            providers: regionProviders?.flatrate || [],
            rentalProviders: uniquePay,
            trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key,
        });
    } catch (err) {
        console.error(err);
    } finally {
        setIsFetchingDetails(false);
    }
  }, [userRegion, language]);

  useEffect(() => {
    if (selectedMovie) {
        fetchFullMovieDetails(selectedMovie.id, language);
    }
  }, [selectedMovie, fetchFullMovieDetails, language]);

  const handleFilterChange = (type, value) => setFilters(prev => ({...prev, [type]: value}));
  const handleGenreChange = (id, type) => {
      setFilters(prev => {
          const list = prev[type === 'include' ? 'genre' : 'excludeGenres'];
          const otherList = prev[type === 'include' ? 'excludeGenres' : 'genre'];
          const newOtherList = otherList.filter(item => item !== id);
          if (list.includes(id)) {
              return {...prev, [type === 'include' ? 'genre' : 'excludeGenres']: list.filter(item => item !== id)};
          } else {
              return {...prev, [type === 'include' ? 'genre' : 'excludeGenres']: [...list, id], [type === 'include' ? 'excludeGenres' : 'genre']: newOtherList};
          }
      });
  };
  const handlePlatformChange = (id) => {
    setFilters(prev => {
      const platforms = [...prev.platform];
      const index = platforms.indexOf(id);
      if (index > -1) {
        platforms.splice(index, 1);
      } else {
        platforms.push(id);
      }
      return {...prev, platform: platforms};
    });
  };

  const handleGoBack = () => {
    if(movieHistory.length > 0) {
        const prevMovie = movieHistory.pop();
        setMovieHistory([...movieHistory]);
        setSelectedMovie(prevMovie);
    }
  };

  const handleMarkAsWatched = (movieId) => {
    setWatchedMovies(prev => ({...prev, [movieId]: Date.now() + (90 * 24 * 60 * 60 * 1000)}));
    discoverAndSetMovies();
  };
  
  const filteredPlatforms = useMemo(() => {
    return platformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase()));
  }, [platformOptions, platformSearchQuery]);
  
  const formatDuration = (mins) => {
      if (!mins) return '';
      return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  if (!userRegion) {
    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className="relative text-center max-w-md w-full glass-card p-8 rounded-2xl">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>
                <select id="initial-region-filter" onChange={e => setUserRegion(e.target.value)} defaultValue="" className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">
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
        <div className="flex items-center bg-[var(--color-card-bg)] p-1 rounded-full"><button onClick={() => setLanguage('es')} className={`lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button><button onClick={() => setLanguage('en')} className={`lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button></div>
      </div>

      <header className="text-center mb-4 pt-16">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
        <p className="max-w-xl mx-auto mt-4 text-lg text-[var(--color-text-secondary)]">{t.subtitle}</p>
        {/* Search and Filter Toggle */}
      </header>

      <div className="mb-8 p-6 bg-[var(--color-header-bg)] rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2><button onClick={() => setFilters(initialFilters)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg transition-colors">{t.clearFilters}</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            <div className="space-y-4">
                <div><label htmlFor="region-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.region}</label><select id="region-filter" value={userRegion} onChange={e => setUserRegion(e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">{availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}</select></div>
                <div><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={e => handleFilterChange('decade', e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
                <div><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={e => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" /></div>
            </div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.includeGenre}</label><div className="filter-checkbox-list space-y-1">{genres.map(g => (<div key={`inc-${g.id}`} className="flex items-center"><input id={`inc-${g.id}`} type="checkbox" checked={filters.genre.includes(g.id)} onChange={() => handleGenreChange(g.id, 'include')} disabled={filters.excludeGenres.includes(g.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50"/><label htmlFor={`inc-${g.id}`} className={`ml-2 text-sm text-[var(--color-text-secondary)] ${filters.excludeGenres.includes(g.id) ? 'opacity-50' : ''}`}>{g.name}</label></div>))}</div></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-1">{genres.map(g => (<div key={`ex-${g.id}`} className="flex items-center"><input id={`ex-${g.id}`} type="checkbox" checked={filters.excludeGenres.includes(g.id)} onChange={() => handleGenreChange(g.id, 'exclude')} disabled={filters.genre.includes(g.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50"/><label htmlFor={`ex-${g.id}`} className={`ml-2 text-sm text-[var(--color-text-secondary)] ${filters.genre.includes(g.id) ? 'opacity-50' : ''}`}>{g.name}</label></div>))}</div></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.platform}</label><input type="text" value={platformSearchQuery} onChange={e => setPlatformSearchQuery(e.target.value)} placeholder={t.platformSearchPlaceholder} className="w-full p-2 mb-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm" /><div className="grid grid-cols-2 gap-x-4 gap-y-2 filter-checkbox-list" style={{maxHeight: '160px'}}>{filteredPlatforms.length > 0 ? filteredPlatforms.map(p => (<div key={p.id} className="flex items-center"><input id={`platform-${p.id}`} type="checkbox" checked={filters.platform.includes(p.id)} onChange={() => handlePlatformChange(p.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`platform-${p.id}`} className="ml-2 text-sm text-[var(--color-text-secondary)]">{p.name}</label></div>)) : <p className="text-sm text-gray-400 col-span-2">No matching platforms.</p>}</div></div>
        </div>
      </div>

      <div className="text-center mb-10 flex justify-center items-center gap-4">
        <button onClick={handleGoBack} disabled={movieHistory.length === 0} className="p-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
        <button onClick={discoverAndSetMovies} disabled={isLoading} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isLoading ? t.searching : t.surpriseMe}</button>
      </div>
      
      {/* Movie Card and Modal Logic ... */}

    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));