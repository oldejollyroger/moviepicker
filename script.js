// --- React and Hooks ---
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// --- This script assumes a file named 'config.js' is loaded and provides TMDB_API_KEY ---

// --- Constants ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

const THEMES = [
    { id: 'theme-purple', color: '#8b5cf6' },
    { id: 'theme-ocean', color: '#22d3ee' },
    { id: 'theme-forest', color: '#22c55e' },
    { id: 'theme-volcano', color: '#dc2626' },
];

const translations = {
    es: {
        title: 'Movie Picker', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros',
        sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ],
        platform: 'Plataformas (Opcional):', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:',
        decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:',
        surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...',
        welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!",
        noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:',
        cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):',
        cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.',
        cardMarkAsWatched: 'No mostrar por 3 meses', cardTrailer: 'Tráiler', cardTrailerNotFound: 'Tráiler no disponible.',
        cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de',
    },
    en: {
        title: 'Movie Picker', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters',
        sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ],
        platform: 'Platforms (Optional):', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:',
        decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:',
        surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...',
        welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!",
        noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:',
        cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):',
        cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.',
        cardMarkAsWatched: "Don't show for 3 months", cardTrailer: 'Trailer', cardTrailerNotFound: 'Trailer not available.',
        cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of',
    }
};

const PLATFORM_OPTIONS = [
    { name: 'Netflix', id: '8' }, { name: 'Prime Video', id: '9' }, { name: 'Disney+', id: '337' },
    { name: 'Max', id: '1899' }, { name: 'Apple TV+', id: '350' }, { name: 'Hulu', id: '15' },
    { name: 'Paramount+', id: '531' }, { name: 'Peacock', id: '387' }, { name: 'SkyShowtime', id: '1771' }
];

const App = () => {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState(() => localStorage.getItem('moviePickerTheme') || 'theme-purple');
  const t = translations[language] || translations['en'];
  
  const [movie, setMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [error, setError] = useState(null);
  
  const [genres, setGenres] = useState([]);
  const [allMovies, setAllMovies] = useState([]);

  const initialFilters = {
      genre: [], excludeGenres: [], decade: 'todos', platform: [],
      sortBy: 'popularity.desc', minRating: 0
  };
  const [filters, setFilters] = useState(initialFilters);
  
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());
  const WATCHED_MOVIES_KEY = 'watchedMoviePickerMovies_v1';
  const [watchedMovies, setWatchedMovies] = useState({});

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('moviePickerTheme', theme);
  }, [theme]);
  
  useEffect(() => {
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    const fetchGenres = async () => {
      try {
        if (typeof TMDB_API_KEY === 'undefined' || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            throw new Error("API Key is missing. Check your config.js file.");
        }
        const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${langParam}`);
        if (!response.ok) throw new Error('Failed to fetch genres.');
        const data = await response.json();
        setGenres(data.genres);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchGenres();
  }, [language]);

  useEffect(() => {
    const stored = localStorage.getItem(WATCHED_MOVIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const valid = Object.fromEntries(Object.entries(parsed).filter(([_, expiry]) => expiry > now));
        setWatchedMovies(valid);
      } catch (e) {
        console.error("Failed to parse watched movies from localStorage", e);
        localStorage.removeItem(WATCHED_MOVIES_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  const fetchAndSetRandomMovie = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMovie(null);
    setMovieDetails({});

    try {
        const langParam = language === 'es' ? 'es-ES' : 'en-US';
        const fetchPage = async (page) => {
            let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam}&sort_by=${filters.sortBy}&page=${page}&vote_count.gte=100`;
            if (filters.platform.length > 0) url += `&with_watch_providers=${filters.platform.join('|')}&watch_region=US&with_watch_monetization_types=flatrate`;
            if (filters.genre.length > 0) url += `&with_genres=${filters.genre.join(',')}`;
            if (filters.excludeGenres.length > 0) url += `&without_genres=${filters.excludeGenres.join(',')}`;
            if (filters.minRating > 0) url += `&vote_average.gte=${filters.minRating}`;
            if (filters.decade !== 'todos') {
                const year = parseInt(filters.decade);
                url += `&primary_release_date.gte=${year}-01-01&primary_release_date.lte=${year + 9}-12-31`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
            return await response.json();
        };

        let potentialMovies = [];
        const now = Date.now();
        const pageLimit = 10; // To prevent infinite loops

        for (let i = 1; i <= pageLimit; i++) {
            const randomPage = Math.floor(Math.random() * 50) + 1; // Fetch from top 50 pages
            const data = await fetchPage(randomPage);
            const validMovies = data.results.filter(m => 
                m.poster_path && 
                m.overview && 
                !sessionShownMovies.has(m.id) &&
                !(watchedMovies[m.id] && watchedMovies[m.id] > now)
            );
            potentialMovies.push(...validMovies);
            if (potentialMovies.length >= 5) break;
        }

        if (potentialMovies.length > 0) {
            const randomMovie = potentialMovies[Math.floor(Math.random() * potentialMovies.length)];
            setMovie(randomMovie);
            setSessionShownMovies(prev => new Set(prev).add(randomMovie.id));
        } else {
            setError(t.noMoviesFound);
        }

    } catch (err) {
        console.error("Error fetching movie:", err);
        setError(String(err).includes("401") ? "Authorization Error. Check your API Key." : err.message);
    } finally {
        setIsLoading(false);
    }
  }, [filters, language, sessionShownMovies, watchedMovies, t]);

  useEffect(() => {
    if (!movie) return;
    const fetchDetails = async () => {
        setIsFetchingDetails(true);
        try {
            const langParam = language === 'es' ? 'es-ES' : 'en-US';
            const response = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=${langParam}&append_to_response=credits,videos,watch/providers`);
            if (!response.ok) throw new Error("Failed to fetch movie details.");
            const data = await response.json();
            const usProviders = data['watch/providers']?.results?.US;
            setMovieDetails({
                duration: data.runtime || null,
                director: data.credits?.crew.find(p => p.job === 'Director'),
                cast: data.credits?.cast.slice(0, 5) || [],
                providers: usProviders?.flatrate || [],
                trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetchingDetails(false);
        }
    };
    fetchDetails();
  }, [movie, language]);

  const handleFilterChange = (type, value) => { setFilters(prev => ({ ...prev, [type]: value })); };
  const handleGenreChange = (genreId, type) => {
    setFilters(prev => {
        const listKey = type === 'include' ? 'genre' : 'excludeGenres';
        const otherListKey = type === 'include' ? 'excludeGenres' : 'genre';
        const list = [...prev[listKey]];
        const otherList = [...prev[otherListKey]];
        const index = list.indexOf(genreId);
        const otherIndex = otherList.indexOf(genreId);
        if (index > -1) {
            list.splice(index, 1);
        } else {
            list.push(genreId);
            if (otherIndex > -1) otherList.splice(otherIndex, 1);
        }
        return { ...prev, [listKey]: list, [otherListKey]: otherList };
    });
  };
  const handlePlatformChange = (id) => {
    setFilters(prev => {
        const platform = [...prev.platform];
        const index = platform.indexOf(id);
        if (index > -1) {
            platform.splice(index, 1);
        } else {
            platform.push(id);
        }
        return { ...prev, platform };
    });
  };

  const handleMarkAsWatched = (movieId) => {
    const expiry = Date.now() + (3 * 30 * 24 * 60 * 60 * 1000);
    setWatchedMovies(prev => ({ ...prev, [movieId]: expiry }));
    fetchAndSetRandomMovie();
  };

  const formatDuration = (mins) => {
      if (!mins) return '';
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      return `${hours}h ${minutes}min`;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans app-container relative">
        <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
            <div className="flex items-center gap-1 bg-[var(--color-card-bg)] p-1 rounded-full">{THEMES.map(themeOption => (<button key={themeOption.id} onClick={() => setTheme(themeOption.id)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${theme === themeOption.id ? 'scale-125 ring-2 ring-white' : ''}`} style={{backgroundColor: themeOption.color}}></button>))}</div>
            <div className="flex items-center bg-[var(--color-card-bg)] p-1 rounded-full"><button onClick={() => setLanguage('es')} className={`lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button><button onClick={() => setLanguage('en')} className={`lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button></div>
        </div>

        <header className="text-center mb-8 pt-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
            <p className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</p>
        </header>

        <div className="mb-8 p-6 bg-[var(--color-header-bg)] rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2><button onClick={() => setFilters(initialFilters)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg transition-colors">{t.clearFilters}</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                <div className="space-y-4"><div><label htmlFor="sort-by" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.sortBy}</label><select id="sort-by" value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">{t.sortOptions.map(o=>(<option key={o.id} value={o.id}>{o.name}</option>))}</select></div><div><label htmlFor="decade" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade" value={filters.decade} onChange={e => handleFilterChange('decade', e.target.value)} className="w-full p-3 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div><div><label htmlFor="rating" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={e => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div></div>
                <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.includeGenre}</label><div className="filter-checkbox-list space-y-1">{genres.map(g => (<div key={`inc-${g.id}`} className="flex items-center"><input id={`inc-${g.id}`} type="checkbox" checked={filters.genre.includes(g.id)} onChange={()=>handleGenreChange(g.id, 'include')} disabled={filters.excludeGenres.includes(g.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50"/><label htmlFor={`inc-${g.id}`} className={`ml-2 text-sm ${filters.excludeGenres.includes(g.id) ? 'opacity-50' : 'text-[var(--color-text-secondary)]'}`}>{g.name}</label></div>))}</div></div>
                <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-1">{genres.map(g => (<div key={`ex-${g.id}`} className="flex items-center"><input id={`ex-${g.id}`} type="checkbox" checked={filters.excludeGenres.includes(g.id)} onChange={()=>handleGenreChange(g.id, 'exclude')} disabled={filters.genre.includes(g.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50"/><label htmlFor={`ex-${g.id}`} className={`ml-2 text-sm ${filters.genre.includes(g.id) ? 'opacity-50' : 'text-[var(--color-text-secondary)]'}`}>{g.name}</label></div>))}</div></div>
                <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.platform}</label><div className="grid grid-cols-2 gap-x-4 gap-y-2">{PLATFORM_OPTIONS.map(p => (<div key={p.id} className="flex items-center"><input id={`platform-${p.id}`} type="checkbox" checked={filters.platform.includes(p.id)} onChange={()=>handlePlatformChange(p.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`platform-${p.id}`} className="ml-2 text-sm text-[var(--color-text-secondary)]">{p.name}</label></div>))}</div></div>
            </div>
        </div>

        <div className="text-center mb-10 flex justify-center items-center gap-4">
            <button onClick={fetchAndSetRandomMovie} disabled={isLoading} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isLoading ? t.searching : t.surpriseMe}</button>
        </div>

        {error && <div className="text-center text-red-400 mt-4 text-lg">{error}</div>}
        {!isLoading && !movie && <div className="text-center text-gray-400 mt-10 text-lg">{t.welcomeMessage}</div>}

        {movie && (
            <div className="max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10">
                <div className="md:flex">
                    <div className="md:w-1/3 flex-shrink-0"><img className="h-auto w-full object-cover" src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`} alt={`Poster for ${movie.title}`}/></div>
                    <div className="p-6 sm:p-8 md:w-2/3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{movie.title}</h2>
                        <p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{movie.overview}</p>
                        <div className="mt-6 space-y-4 text-sm">
                            <p><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {new Date(movie.release_date).getFullYear()}</p>
                            {isFetchingDetails ? <div className="inline-flex items-center"><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong><div className="small-loader"></div></div> : movieDetails.duration && <p><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(movieDetails.duration)}</p>}
                            <p><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {movie.vote_average.toFixed(1)}/10 ⭐</p>
                            {isFetchingDetails ? null : movieDetails.director && <p><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {movieDetails.director.name}</p>}
                            <div>
                                <strong className="text-[var(--color-accent-text)]">{t.cardAvailableOn} </strong>
                                {isFetchingDetails ? <div className="small-loader"></div> : movieDetails.providers?.length > 0 ? movieDetails.providers.map(p => (<img key={p.provider_id} src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} title={p.provider_name} className="platform-logo inline-block"/>)) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}
                            </div>
                            <div className="mt-4">
                                <strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong>
                                {isFetchingDetails ? <div className="small-loader"></div> : movieDetails.cast?.length > 0 ? (<div className="flex flex-wrap gap-x-4 gap-y-2">{movieDetails.cast.map(actor => (<div key={actor.id} className="flex flex-col items-center text-center w-20"><img src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}` : 'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/><span className="text-xs text-[var(--color-text-secondary)] leading-tight">{actor.name}</span></div>))}</div>) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}
                            </div>
                        </div>
                        <button onClick={() => handleMarkAsWatched(movie.id)} className="mt-8 w-full py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors">{t.cardMarkAsWatched}</button>
                    </div>
                </div>
                {movieDetails.trailerKey && (
                    <div className="p-6 bg-[var(--color-card-bg)]/50">
                        <h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-2">{t.cardTrailer}</h3>
                        <div className="trailer-responsive rounded-lg overflow-hidden"><iframe src={`https://www.youtube.com/embed/${movieDetails.trailerKey}`} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>
                    </div>
                )}
            </div>
        )}
        <footer className="text-center mt-12 py-6 text-sm text-[var(--color-text-subtle)]"><p>{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p></footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));