const { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } = React;

// --- UTILS & CONSTANTS ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';
const CURATED_COUNTRY_LIST = new Set(['AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US']);
const ACCENT_COLORS = [ { name: 'Cyberpunk', color: '#d946ef', text: '#f0abfc', from: '#22d3ee', to: '#d946ef' }, { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' }, { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' }, { name: 'Volcano', color: '#dc2626', text: '#f87171', from: '#f97316', to: '#ef4444' }, { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' }, ];
const translations = {
    es: { settings: "Ajustes", watchedList: "Vistos", unwatch: "Quitar", watchList: "Mi Lista", saveForLater: "Guardar", removeFromList: "Quitar", installApp: "Instalar App", installInstructions: "Para instalar, presiona el ícono de Compartir y luego 'Agregar a la pantalla de inicio'", title: "Movie & TV Randomizer", subtitle: '¿Qué vemos esta noche?', movies: 'Películas', tvShows: 'Series', quickFilters: "Filtros Rápidos", platforms: 'Plataformas Populares', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Más Filtros', applyFilters: 'Aplicar Filtros', region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'Busca una película o serie...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para empezar!", noMoviesFound: 'No se encontraron resultados con los filtros actuales.', cardYear: 'Año:', cardDuration: 'Duración:', cardSeasons: 'Temporadas:', cardRating: 'Nota TMDb:', cardDirector: 'Director/Creador:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: "Marcar como Visto", cardIsWatched: "Visto", cardTrailer: 'Ver Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Títulos Similares', footer: 'Datos cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', clearAllFilters: 'Limpiar todos los filtros', details: "Details" },
    en: { settings: "Settings", watchedList: "Watched List", unwatch: "Un-watch", watchList: "My List", saveForLater: "Save for Later", removeFromList: "Remove", installApp: "Install App", installInstructions: "To install, tap the Share icon and then 'Add to Home Screen'", title: 'Movie & TV Randomizer', subtitle: "What should we watch tonight?", movies: "Movies", tvShows: "TV Shows", quickFilters: "Quick Filters", platforms: 'Popular Platforms', advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'More Filters', applyFilters: 'Apply Filters', region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Search for a movie or TV show...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to find something to watch!", noMoviesFound: 'No results found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardSeasons: 'Seasons:', cardRating: 'TMDb Rating:', cardDirector: 'Director/Creator:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Mark as Watched", cardIsWatched: "Watched", cardTrailer: 'Watch Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Titles', footer: 'Data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', clearAllFilters: 'Clear All Filters', details: "Details" }
};
const AppContext = createContext();

const formatDuration = (totalMinutes) => { if (!totalMinutes || totalMinutes <= 0) return null; const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; return `${hours}h ${minutes}min`; };
const useLocalStorageState = (key, defaultValue) => { const [state, setState] = useState(() => { const storedValue = localStorage.getItem(key); if (storedValue) { try { return JSON.parse(storedValue); } catch (e) { return defaultValue; } } return typeof defaultValue === 'function' ? defaultValue() : defaultValue; }); useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { console.error(`Error setting localStorage key "${key}":`, e); } }, [key, state]); return [state, setState]; };
const useDebounce = (value, delay) => { const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => { setDebouncedValue(value); }, delay); return () => { clearTimeout(handler); }; }, [value, delay]); return debouncedValue; };

const normalizeMediaData = (media, mediaType, genresMap) => {
    if (!media || !media.id) return null;
    const isMovie = mediaType === 'movie';
    const releaseDate = isMovie ? media.release_date : media.first_air_date;
    return { id: media.id.toString(), title: isMovie ? media.title : media.name, synopsis: media.overview, year: releaseDate ? parseInt(releaseDate.split('-')[0]) : null, imdbRating: media.vote_average?.toFixed(1) || 'N/A', genres: media.genre_ids?.map(id => genresMap[id]).filter(Boolean) || [], poster: media.poster_path, mediaType,
    };
};

const InstallPwaInstructions = () => { const { t } = useContext(AppContext); return ( <div className="install-button-wrapper"><div className="bg-gray-800 text-white text-center text-sm p-3 rounded-lg shadow-lg flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span>{t.installInstructions}</span></div></div> ); };
const InstallPwaButton = ({ handleInstallClick }) => { const { t } = useContext(AppContext); return ( <div className="install-button-wrapper"><button onClick={handleInstallClick} className="bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{t.installApp}</button></div> );};
const SettingsDropdown = ({ mode, setMode, accent, setAccent, language, setLanguage, openWatchedModal, openWatchlistModal }) => { const [isOpen, setIsOpen] = useState(false); const { t } = useContext(AppContext); const dropdownRef = useRef(null); useEffect(() => { const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setIsOpen(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => { document.removeEventListener("mousedown", handleClickOutside); }; }, [dropdownRef]); return ( <div className="relative" ref={dropdownRef}><button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full bg-[var(--color-card-bg)] shadow border border-[var(--color-border)] hover:bg-[var(--color-border)]" aria-label="Settings"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button>{isOpen && ( <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] z-30"><div className="p-4"><h3 className="font-semibold mb-3">{t.settings}</h3><div className="space-y-4"><div className="flex items-center justify-center gap-2 bg-[var(--color-bg)] p-2 rounded-full overflow-hidden">{ACCENT_COLORS.map(colorOption => (<button key={colorOption.name} onClick={() => setAccent(colorOption)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${accent.name === colorOption.name ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-accent)]' : ''}`} style={{backgroundColor: colorOption.color}} title={colorOption.name}></button>))}</div><div className="flex items-center gap-2 bg-[var(--color-bg)] p-1 rounded-full"><button onClick={() => setMode('light')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Light Mode"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light</button><button onClick={() => setMode('dark')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Dark Mode"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark</button></div><div className="flex items-center bg-[var(--color-bg)] p-1 rounded-full"><button onClick={() => setLanguage('es')} className={`w-full lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button><button onClick={() => setLanguage('en')} className={`w-full lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button></div></div></div></div>)}</div> );};
const FilterModal = ({ isOpen, close, handleClearFilters, filters, handleGenreChangeInModal, genresMap }) => { if (!isOpen) return null; const { t } = useContext(AppContext); return ( <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={close}><div className="bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2><button onClick={close} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto"><div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.includeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`inc-${id}`} className="flex items-center"><input id={`inc-genre-${id}`} type="checkbox" checked={filters.genre.includes(id)} onChange={() => handleGenreChangeInModal(id, 'genre')} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`inc-genre-${id}`} className="ml-3 text-base text-[var(--color-text-secondary)]">{name}</label></div>))}</div></div><div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([, a], [, b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`ex-${id}`} className="flex items-center"><input id={`ex-genre-${id}`} type="checkbox" checked={filters.excludeGenres.includes(id)} onChange={() => handleGenreChangeInModal(id, 'excludeGenres')} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600"/><label htmlFor={`ex-genre-${id}`} className="ml-3 text-base text-[var(--color-text-secondary)]">{name}</label></div>))}</div></div></div><div className="p-4 mt-auto border-t border-[var(--color-border)] flex justify-end items-center gap-4"><button onClick={()=>{handleClearFilters(); close();}} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500">{t.clearFilters}</button><button onClick={close} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg">{t.applyFilters}</button></div></div></div> ); };
const SkeletonMovieCard = () => ( <div className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] animate-pulse"><div className="sm:grid sm:grid-cols-3 sm:gap-x-8"><div className="sm:col-span-1 p-6"><div className="w-full h-auto mx-auto aspect-[2/3] bg-gray-700 rounded-lg"></div></div><div className="sm:col-span-2 p-6 space-y-4"><div className="h-8 bg-gray-700 rounded w-3/4"></div><div className="space-y-3 mt-4"><div className="h-4 bg-gray-700 rounded w-full"></div><div className="h-4 bg-gray-700 rounded w-full"></div><div className="h-4 bg-gray-700 rounded w-5/6"></div></div></div></div></div>);

// --- MAIN APP COMPONENT ---
const App = () => {
  const [mode, setMode] = useLocalStorageState('movieRandomizerMode', 'dark');
  const [accent, setAccent] = useLocalStorageState('movieRandomizerAccent', ACCENT_COLORS[0]);
  const [language, setLanguage] = useLocalStorageState('movieRandomizerLang', 'en');
  const [userRegion, setUserRegion] = useLocalStorageState('movieRandomizerRegion', null);
  const [mediaType, setMediaType] = useLocalStorageState('mediaPickerType_v1', 'movie');
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0 };
  const [filters, setFilters] = useLocalStorageState('mediaPickerFilters_v2', initialFilters);
  const [watchedMedia, setWatchedMedia] = useLocalStorageState('mediaPickerWatched_v2', {});
  const [watchList, setWatchList] = useLocalStorageState('mediaPickerWatchlist_v2', {});
  const [shareStatus, setShareStatus] = useState('idle');
  const [availableRegions, setAvailableRegions] = useState([]);
  const [quickPlatformOptions, setQuickPlatformOptions] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaHistory, setMediaHistory] = useState([]);
  const [mediaDetails, setMediaDetails] = useState({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sessionShownMedia, setSessionShownMedia] = useState(new Set());
  const cardRef = useRef(null);
  const searchRef = useRef(null);
  const t = translations[language];

  const fetchApi = useCallback(async (path, query) => { if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { throw new Error("API Key is missing. Please ensure it's defined in your config file."); } const params = new URLSearchParams(query); const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`; const response = await fetch(url); if (!response.ok) { const err = await response.json(); throw new Error(err.status_message || `API error: ${response.status}`); } return response.json(); }, []);

  useEffect(() => { document.documentElement.classList.toggle('light-mode', mode === 'light'); }, [mode]);
  useEffect(() => { const root = document.documentElement; root.style.setProperty('--color-accent', accent.color); root.style.setProperty('--color-accent-text', accent.text); root.style.setProperty('--color-accent-gradient-from', accent.from); root.style.setProperty('--color-accent-gradient-to', accent.to); }, [accent]);
  useEffect(() => { const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream; setIsIos(isIosDevice); if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) { setIsStandalone(true); } const handleInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener('beforeinstallprompt', handleInstallPrompt); return () => { window.removeEventListener('beforeinstallprompt', handleInstallPrompt); }; }, []);
  useEffect(() => { const handleKeyDown = (e) => { if (e.key === 'Escape') { setIsFilterModalOpen(false); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);

  useEffect(() => {
    const bootstrapApp = async () => { setIsLoading(true); setError(null); if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { setError("TMDb API Key not found. Please check your config file."); setIsLoading(false); return; } try { const regionsData = await fetchApi('configuration/countries', {}); const curatedRegions = regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a, b) => a.english_name.localeCompare(b.english_name)); setAvailableRegions(curatedRegions); } catch (err) { console.error("Error during app bootstrap:", err); setError(err.message); } finally { setIsLoading(false); } };
    bootstrapApp();
  }, [fetchApi]);

  useEffect(() => {
    const fetchLanguageData = async () => { if (!language) return; try { const langParam = language === 'es' ? 'es-ES' : 'en-US'; const genresData = await fetchApi(`genre/${mediaType}/list`, { language: langParam }); setGenresMap(genresData.genres.reduce((acc, genre) => ({ ...acc, [genre.id]: genre.name }), {})); } catch (err) { console.error("Error fetching language data:", err); } };
    fetchLanguageData();
  }, [language, mediaType, fetchApi]);
  
  useEffect(() => {
      if (!userRegion) return;
      const fetchQuickPlatforms = async () => { try { const providersData = await fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion }); const popularProviders = providersData.results .sort((a,b) => (a.display_priorities?.[userRegion] ?? 100) - (b.display_priorities?.[userRegion] ?? 100)) .map(p => ({ id: p.provider_id.toString(), name: p.provider_name })); setQuickPlatformOptions(popularProviders.slice(0, 6)); } catch(err) { console.error("Failed to fetch platform providers:", err); setQuickPlatformOptions([]); } };
      fetchQuickPlatforms();
  }, [userRegion, mediaType, fetchApi]);
    
  const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
    if (!mediaId || !type) return null;
    try {
        const lang = language === 'es' ? 'es-ES' : 'en-US';
        const data = await fetchApi(`${type}/${mediaId}`, { language: lang, append_to_response: 'credits,videos,watch/providers,similar'});
        const director = data.credits?.crew?.find(p => p.job === 'Director');
        const similarMedia = data.similar?.results.map(r => normalizeMediaData(r, type, genresMap)).filter(Boolean).slice(0, 10);
        const regionData = data['watch/providers']?.results?.[userRegion];
        const watchLink = regionData?.link || `https://www.themoviedb.org/movie/${mediaId}/watch`;
        const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
        const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
        const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
        const combinedPayProviders = [...rentProviders, ...buyProviders];
        const uniquePayProviderIds = new Set();
        const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; });
        return { ...data, duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null), providers, rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 10) || [], director: director, seasons: data.number_of_seasons, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMedia };
    } catch (err) { console.error(`Error fetching details for ${type} ${mediaId}`, err); return null; }
  }, [userRegion, language, genresMap, fetchApi]);
    
  useEffect(() => { if (!selectedMedia) return; setIsFetchingDetails(true); setMediaDetails({}); fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => { if (details) setMediaDetails(details); setIsFetchingDetails(false); }); }, [selectedMedia, fetchFullMediaDetails]);

  const resetSearchState = useCallback(() => { setAllMedia([]); setSelectedMedia(null); setMediaHistory([]); setSessionShownMedia(new Set()); setHasSearched(false); }, []);

  const fetchNewMediaBatch = useCallback(async () => {
    if (!userRegion || Object.keys(genresMap).length === 0) return;
    setIsDiscovering(true); setError(null);
    if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
    setSelectedMedia(null); setHasSearched(true);
    try {
        const discoverPath = `discover/${mediaType}`;
        const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
        const queryParams = { language: (language === 'es' ? 'es-ES' : 'en-US'), 'vote_count.gte': mediaType === 'movie' ? 100 : 50, watch_region: userRegion, ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') }, ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') }, ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }, ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating }, ...filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` }, };
        const data = await fetchApi(discoverPath, { ...queryParams, sort_by: 'popularity.desc', page: Math.floor(Math.random() * 20) + 1 });
        const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
        const unwatchedMedia = transformedMedia.filter(m => !watchedMedia[m.id]);
        setAllMedia(unwatchedMedia);
        if (unwatchedMedia.length > 0) { const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]; setSelectedMedia(newMedia); setSessionShownMedia(prev => new Set(prev).add(newMedia.id)); } else { setSelectedMedia(null); }
    } catch (err) { console.error("Error discovering media:", err); setError(err.message); } finally { setIsDiscovering(false); }
  }, [filters, language, mediaType, userRegion, genresMap, watchedMedia, selectedMedia, fetchApi]);
  
  const handleSurpriseMe = useCallback(() => { const availableMedia = allMedia.filter(m => !sessionShownMedia.has(m.id)); if (availableMedia.length > 0) { const newMedia = availableMedia[Math.floor(Math.random() * availableMedia.length)]; if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]); setSelectedMedia(newMedia); setSessionShownMedia(prev => new Set(prev).add(newMedia.id)); } else { fetchNewMediaBatch(); } }, [allMedia, sessionShownMedia, selectedMedia, fetchNewMediaBatch]);
  
  const handleRegionChange = (newRegion) => { setUserRegion(newRegion); resetSearchState(); setFilters(initialFilters); };
  const handleMediaTypeChange = (type) => { if (mediaType === type) return; resetSearchState(); setFilters(initialFilters); setMediaType(type); };
  const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); resetSearchState(); };
  const handleQuickFilterToggle = (list, id) => { setFilters(f => { const current = [...f[list]]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, [list]: current }; }); resetSearchState(); };
  const handleGenreChangeInModal = (genreId, type) => { const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; setFilters(f => { const currentList = f[type] ? [...f[type]] : []; const otherList = f[otherType] ? [...f[otherType]] : []; const index = currentList.indexOf(genreId); if (index > -1) { currentList.splice(index, 1); } else { currentList.push(genreId); const otherIndex = otherList.indexOf(genreId); if (otherIndex > -1) { otherList.splice(otherIndex, 1); } } return { ...f, [type]: currentList, [otherType]: otherList }; }); };
  const handleClearFilters = () => { setFilters(initialFilters); resetSearchState(); };
  const handleInstallClick = async () => { if (!installPrompt) return; await installPrompt.prompt(); setInstallPrompt(null); };
  const handleGoBack = () => { if (mediaHistory.length === 0) return; const newHistory = [...mediaHistory]; const previousMedia = newHistory.pop(); setMediaHistory(newHistory); setSelectedMedia(previousMedia); };

  const quickFilterGenres = useMemo(() => {
    if(mediaType === 'movie') return [{ id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '53', name: 'Thriller' }];
    return [{ id: '10759', name: 'Action & Adventure' }, { id: '35', name: 'Comedy' }, { id: '10765', name: 'Sci-Fi & Fantasy' }, { id: '80', name: 'Crime' }];
  }, [mediaType]);
  
  const showInstallButton = installPrompt && !isIos && !isStandalone;
  const showIosInstallInstructions = isIos && !isStandalone;
  const contextValue = { t, userRegion, mediaType };
  
  if (isLoading) { return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="loader"></div></div> ); }
  if (error) { return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1><p className="text-xl">{error}</p></div></div> ); }

  return (
    <AppContext.Provider value={contextValue}>
    <div className="min-h-screen p-4 font-sans app-container relative">
        <div className="absolute top-4 right-4 z-20"> <SettingsDropdown mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} language={setLanguage}/> </div>
        <header className="text-center mb-4 pt-16 sm:pt-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
            <h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2>
            <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                <button onClick={() => handleMediaTypeChange('movie')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                <button onClick={() => handleMediaTypeChange('tv')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
            </div>
            <div className="max-w-2xl mx-auto mt-4 flex flex-col items-center gap-4">
              <div ref={searchRef} className="relative w-full max-w-xl"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full p-3 pl-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"/><div className="absolute top-0 left-0 inline-flex items-center p-3">{isSearching ? <div className="small-loader !m-0 !w-5 !h-5"></div> : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}</div></div>
              <div className="w-full">
                  <h3 className="text-xs font-semibold uppercase text-[var(--color-text-secondary)] mb-2">{t.quickFilters}</h3>
                  <div className="flex flex-wrap justify-center gap-2"> {quickFilterGenres.map(genre => (<button key={genre.id} onClick={() => handleQuickFilterToggle('genre', genre.id)} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.genre.includes(genre.id) ? 'quick-filter-btn-active' : ''}`}>{genre.name}</button>))} </div>
              </div>
              {quickPlatformOptions.length > 0 && (<div className="w-full">
                  <h3 className="text-xs font-semibold uppercase text-[var(--color-text-secondary)] mb-2 mt-3">{t.platforms}</h3>
                  <div className="flex flex-wrap justify-center gap-2"> {quickPlatformOptions.map(p => (<button key={p.id} onClick={() => handleQuickFilterToggle('platform', p.id)} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.platform.includes(p.id) ? 'quick-filter-btn-active' : ''}`}>{p.name}</button>))} </div>
              </div>)}
            </div>
        </header>

        <div className="max-w-3xl mx-auto mb-8 p-4 bg-[var(--color-card-bg)] rounded-xl shadow-lg border border-[var(--color-border)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-1"><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={(e) => handleFilterChange('decade', e.target.value)} className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
                <div className="md:col-span-1"><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                <button onClick={() => setIsFilterModalOpen(true)} className="w-full sm:col-span-2 md:col-span-1 p-2 bg-[var(--color-bg)] hover:bg-[var(--color-border)] border border-[var(--color-border)] hover:border-[var(--color-accent-text)] text-[var(--color-text-primary)] font-semibold rounded-full transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>{t.showFilters}</button>
            </div>
        </div>
        <div className="text-center mb-10 flex justify-center items-center gap-4"><button onClick={handleGoBack} disabled={mediaHistory.length===0} className="p-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg></button><button onClick={handleSurpriseMe} disabled={isDiscovering || !userRegion} title={!userRegion ? t.selectRegionPrompt : ''} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isDiscovering ? t.searching : t.surpriseMe}</button></div>
        
        {isDiscovering ? <SkeletonMovieCard/> : selectedMedia ? (
             <div ref={cardRef} className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] movie-card-enter">
                <div className="sm:grid sm:grid-cols-3 sm:gap-x-8">
                    <div className="sm:col-span-1 p-4 sm:p-6"><img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={`${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}`} alt={`Poster for ${selectedMedia.title}`}/></div>
                    <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0">
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{selectedMedia.title}</h2>
                            <p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{selectedMedia.synopsis}</p>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">{/* Action buttons go here */}</div>
                        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                             <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3>
                             <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm text-left">
                                 <div><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {selectedMedia.year}</div>
                                 {isFetchingDetails ? <div className="small-loader"></div> : mediaDetails.seasons && <div><strong className="text-[var(--color-accent-text)]">{t.cardSeasons}</strong> {mediaDetails.seasons}</div>}
                                 {isFetchingDetails ? <div className="small-loader"></div> : mediaDetails.duration && <div><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(mediaDetails.duration)}</div>}
                                 <div><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {selectedMedia.imdbRating}/10 ⭐</div>
                                 {isFetchingDetails ? null : (mediaDetails.director?.name || mediaDetails.created_by?.length > 0) && <div><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {mediaDetails.director?.name || mediaDetails.created_by?.map(c=>c.name).join(', ')}</div>}
                                 <div><strong className="text-[var(--color-accent-text)]">{t.cardGenres}</strong> {selectedMedia.genres.join(', ')}</div>
                                 {isFetchingDetails ? <div className="small-loader"></div> : mediaDetails.cast?.length > 0 ? (<div><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong><div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2">{mediaDetails.cast.map(actor => (<div key={actor.id} className="flex flex-col items-center text-center w-16 sm:w-20"><img loading="lazy" src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/><span className="text-xs text-[var(--color-text-secondary)] leading-tight">{actor.name}</span></div>))}</div></div>) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (<div className="text-center text-gray-400 mt-10 text-lg">{hasSearched && allMedia.length === 0 ? t.noMoviesFound : !hasSearched && t.welcomeMessage}</div>)}

        <FilterModal isOpen={isFilterModalOpen} close={() => setIsFilterModalOpen(false)} handleClearFilters={handleClearFilters} filters={filters} handleGenreChangeInModal={handleGenreChangeInModal} genresMap={genresMap} />
        
        {!userRegion && (<div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 flex items-center justify-center p-4"><div className="text-center max-w-md bg-[var(--color-card-bg)] p-8 rounded-xl shadow-2xl"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>{availableRegions.length > 0 ? (<select id="initial-region-filter" onChange={(e) => handleRegionChange(e.target.value)} defaultValue="" className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="" disabled>-- {t.region} --</option>{availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}</select>) : (<div className="loader"></div>)}</div></div>)}

        <footer className="text-center mt-auto py-4 text-sm text-[var(--color-text-subtle)]">{showInstallButton && <InstallPwaButton handleInstallClick={handleInstallClick}/>}{showIosInstallInstructions && <InstallPwaInstructions/>}<p className="pt-4">{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p></footer>
    </div>
    </AppContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));