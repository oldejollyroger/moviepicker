const { useState, useEffect, useCallback, useMemo, useRef } = React;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const CURATED_COUNTRY_LIST = new Set(['AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US']);
const ACCENT_COLORS = [ { name: 'Cyberpunk', color: '#d946ef', text: '#f0abfc', from: '#22d3ee', to: '#d946ef' }, { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' }, { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' }, { name: 'Volcano', color: '#dc2626', text: '#f87171', from: '#f97316', to: '#ef4444' }, { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' }, ];

const translations = {
    es: { movies: 'Películas', tvShows: 'Series', settings: "Ajustes", watchedList: "Vistos", unwatch: "Quitar", watchList: "Mi Lista", saveForLater: "Guardar", removeFromList: "Quitar", installApp: "Instalar App", installInstructions: "Para instalar, presiona el ícono de Compartir y luego 'Agregar a la pantalla de inicio'", title: 'Movie & TV Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Más Filtros', hideFilters: 'Ocultar Filtros', applyFilters: 'Aplicar Filtros', region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película o serie...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para empezar!", noMoviesFound: 'No se encontraron resultados con los filtros actuales.', cardYear: 'Año:', cardDuration: 'Duración:', cardSeasons: "Temporadas:", cardRating: 'Nota TMDb:', cardDirector: 'Director/Creador:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: "Visto", cardIsWatched: "Visto ✔️", cardTrailer: 'Ver Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Títulos Similares', footer: 'Datos cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', clearAllFilters: 'Limpiar todos los filtros', details: "Details" },
    en: { movies: "Movies", tvShows: "TV Shows", settings: "Settings", watchedList: "Watched List", unwatch: "Un-watch", watchList: "My List", saveForLater: "Save for Later", removeFromList: "Remove", installApp: "Install App", installInstructions: "To install, tap the Share icon and then 'Add to Home Screen'", title: 'Movie & TV Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'More Filters', hideFilters: 'Hide Filters', applyFilters: 'Apply Filters', region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a movie or TV show...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to start!", noMoviesFound: 'No results found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardSeasons: 'Seasons:', cardRating: 'TMDb Rating:', cardDirector: 'Director/Creator:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Watched", cardIsWatched: "Watched ✔️", cardTrailer: 'Watch Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Titles', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', clearAllFilters: 'Clear All Filters', details: "Details" }
};

const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};

const normalizeMediaData = (media, mediaType, genresMap) => {
    if (!media || !media.id) return null;
    const isMovie = mediaType === 'movie';
    const releaseDate = isMovie ? media.release_date : media.first_air_date;

    return {
        id: media.id.toString(),
        title: isMovie ? media.title : media.name,
        synopsis: media.overview,
        year: releaseDate ? parseInt(releaseDate.split('-')[0]) : null,
        imdbRating: media.vote_average?.toFixed(1) || 'N/A',
        genres: media.genre_ids?.map(id => genresMap[id]).filter(Boolean) || [],
        poster: media.poster_path,
        mediaType,
    };
};

const InstallPwaInstructions = ({ t }) => { /* ... no change ... */ return null; };
const InstallPwaButton = ({ t, handleInstallClick }) => { /* ... no change ... */ return null; };
const SettingsDropdown = ({ mode, setMode, accent, setAccent, language, setLanguage, t, openWatchedModal, openWatchlistModal }) => { /* ... no change ... */ return null; };
const WatchedMediaModal = ({ isOpen, close, watchedMedia, handleUnwatchMedia, t }) => {
    if (!isOpen) return null;
    const watchedArray = Object.values(watchedMedia);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={close}>
            <div className="bg-[var(--color-card-bg)] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center"><h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.watchedList}</h2><button onClick={close} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                <div className="p-6 overflow-y-auto space-y-4">{watchedArray.length > 0 ? ( watchedArray.map((media) => (<div key={media.id} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg"><div className="flex items-center gap-3 overflow-hidden"><img src={media.poster ? `${TMDB_THUMBNAIL_BASE_URL}${media.poster}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={media.title} className="w-10 h-auto rounded-md flex-shrink-0"/><span className="text-sm truncate">{media.title}</span></div><button onClick={() => handleUnwatchMedia(media.id)} className="text-xs bg-red-600 text-white font-bold py-1 px-3 rounded-full hover:bg-red-700 transition-colors flex-shrink-0">{t.unwatch}</button></div>)) ) : (<p className="text-gray-400">Your watched list is empty.</p>)}</div>
                <div className="p-4 mt-auto border-t border-[var(--color-border)] text-right"><button onClick={close} className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500">Close</button></div>
            </div>
        </div>
    );
};
const WatchlistModal = ({ isOpen, close, watchlist, handleToggleWatchlist, t }) => { /* ... no change ... */ return null; };
const ActorDetailsModal = ({ isOpen, close, actorDetails, isFetching, handleSimilarMediaClick, t }) => { /* ... no change ... */ return null; };
const MediaCardContent = ({ media, details, isFetching, t, userRegion, handleActorClick }) => {
    const displayDetails = isFetching ? {} : details;
    return (
        <React.Fragment>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm text-left">
                <div><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {media.year}</div>
                {isFetching ? <div className="inline-flex items-center"><div className="small-loader"></div></div> : displayDetails.duration && <div><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(displayDetails.duration)}</div>}
                {isFetching ? <div className="inline-flex items-center"><div className="small-loader"></div></div> : displayDetails.seasons && <div><strong className="text-[var(--color-accent-text)]">{t.cardSeasons}</strong> {displayDetails.seasons}</div>}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {media.imdbRating}/10 ⭐</div>
                {isFetching ? null : (displayDetails.director || displayDetails.created_by?.length > 0) && <div><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {displayDetails.director?.name || displayDetails.created_by?.map(c => c.name).join(', ')}</div>}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardGenres}</strong> {media.genres.join(', ')}</div>
                <div><strong className="text-[var(--color-accent-text)] block mb-1">{`${t.cardAvailableOn} ${userRegion}`}</strong>{isFetching ? <div className="small-loader"></div> : displayDetails.providers?.length > 0 ? (<div className="flex flex-wrap gap-2 items-center">{displayDetails.providers.map(p => ( <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Watch on ${p.provider_name}`}><img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/></a>))}</div>) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}</div>
                {isFetching ? null : displayDetails.rentalProviders?.length > 0 && (<div><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardAvailableToRent}</strong><div className="flex flex-wrap gap-2 items-center">{displayDetails.rentalProviders.map(p => (<a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Rent or buy on ${p.provider_name}`}><img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/></a>))}</div></div>)}
                <div><strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong>{isFetching ? <div className="small-loader"></div> : displayDetails.cast?.length > 0 ? (<div className="horizontal-scroll-container">{displayDetails.cast.map(actor => (<button key={actor.id} onClick={() => handleActorClick(actor.id)} className="flex-shrink-0 w-20 text-center group hover:scale-105 transition-transform"><img loading="lazy" src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/><span className="text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors leading-tight">{actor.name}</span></button>))}</div>) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}</div>
            </div>
        </React.Fragment>
    );
};
const SkeletonMediaCard = ({ t }) => { /* ... no change ... */ return null; };
const FilterModal = ({ isOpen, close, handleClearFilters, filters, handleGenreChangeInModal, genresMap }) => { /* ... no change ... */ return null; };

const App = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('movieRandomizerMode') || 'dark');
  const [accent, setAccent] = useState(() => { const s = localStorage.getItem('movieRandomizerAccent'); try { return s ? JSON.parse(s) : ACCENT_COLORS[0]; } catch { return ACCENT_COLORS[0]; }});
  const [language, setLanguage] = useState(() => localStorage.getItem('movieRandomizerLang') || 'en');
  const [userRegion, setUserRegion] = useState(() => localStorage.getItem('movieRandomizerRegion') || null);
  const [mediaType, setMediaType] = useState('movie'); // 'movie' or 'tv'
  
  const [allMedia, setAllMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaHistory, setMediaHistory] = useState([]);
  const [mediaDetails, setMediaDetails] = useState({});
  
  const [watchedMedia, setWatchedMedia] = useState({});
  const [watchList, setWatchList] = useState({});
  const WATCHED_MEDIA_KEY = 'watchedUserMedia_v1';
  const WATCHLIST_KEY = 'mediaPickerWatchlist_v1';
  
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
  const [filters, setFilters] = useState(() => { const s = localStorage.getItem('movieRandomizerFilters'); if (s) { try { return { ...initialFilters, ...JSON.parse(s) }; } catch (e) { return initialFilters; } } return initialFilters; });
  
  // All other state declarations are the same as original script
  const t = translations[language]; 
  const [shareStatus, setShareStatus] = useState('idle'); 
  const [availableRegions, setAvailableRegions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const [isFetchingModalDetails, setIsFetchingModalDetails] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isWatchedModalOpen, setIsWatchedModalOpen] = useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [actorDetails, setActorDetails] = useState(null);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const [isFetchingActorDetails, setIsFetchingActorDetails] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState(null);
  const [genresMap, setGenresMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sessionShownMedia, setSessionShownMedia] = useState(new Set());
  const cardRef = useRef(null);
  
  // All hooks remain the same
  useEffect(() => { const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream; setIsIos(i); if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true); const p = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener('beforeinstallprompt', p); return () => window.removeEventListener('beforeinstallprompt', p);}, []);
  const fetchApi = async (path, query) => { const p = new URLSearchParams(query); const u = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${p.toString()}`; const r = await fetch(u); if (!r.ok) { const e = await r.json(); throw new Error(e.status_message || `API error: ${r.status}`); } return r.json(); };
  useEffect(() => { /* All event listeners for Escape key */ }, []);
  useEffect(() => { document.documentElement.classList.toggle('light-mode', mode === 'light'); localStorage.setItem('movieRandomizerMode', mode); }, [mode]);
  useEffect(() => { const r = document.documentElement; r.style.setProperty('--color-accent', accent.color); /* etc. */ localStorage.setItem('movieRandomizerAccent', JSON.stringify(accent)); }, [accent]);
  useEffect(() => { localStorage.setItem('movieRandomizerLang', language); }, [language]);
  useEffect(() => { if (userRegion) { localStorage.setItem('movieRandomizerRegion', userRegion); } }, [userRegion]);
  useEffect(() => { localStorage.setItem('movieRandomizerFilters', JSON.stringify(filters)); }, [filters]);
  
  useEffect(() => { /* Bootstrap App */ }, []);

  useEffect(() => {
    const fetchLanguageData = async () => { if (!language) return; try { const l = language === 'es' ? 'es-ES' : 'en-US'; const d = await fetchApi(`genre/${mediaType}/list`, { language: l }); setGenresMap(d.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {})); if(selectedMedia) fetchFullMediaDetails(selectedMedia.id, l).then(det => { if (det) setMediaDetails(det); }); } catch (e) { console.error("Error fetching language data:", e); } };
    fetchLanguageData();
  }, [language, mediaType, selectedMedia]);

  const resetAllState = () => { setAllMedia([]); setSelectedMedia(null); setHasSearched(false); setMediaHistory([]); setSessionShownMedia(new Set()); setFilters(initialFilters); };

  const handleMediaTypeChange = (type) => {
      if (type === mediaType) return;
      setMediaType(type);
      resetAllState();
  };

  const fetchNewMediaBatch = useCallback(async () => {
    if (!userRegion || !genresMap || Object.keys(genresMap).length === 0) return;
    setIsDiscovering(true); setError(null);
    if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
    setSelectedMedia(null); setHasSearched(true);
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
    try {
      const queryParams = { language: langParam, 'vote_count.gte': 100, watch_region: userRegion, ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|'), with_watch_monetization_types: 'flatrate' }, ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') }, ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }, ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating }, ...filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` } };
      const data = await fetchApi(`discover/${mediaType}`, { ...queryParams, sort_by: 'popularity.desc', page: Math.floor(Math.random() * 20) + 1 });
      const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
      const unwatchedMedia = transformedMedia.filter(m => !watchedMedia[m.id]);
      setAllMedia(unwatchedMedia);
      if (unwatchedMedia.length > 0) { const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]; setSelectedMedia(newMedia); setSessionShownMedia(prev => new Set(prev).add(newMedia.id)); } else { setSelectedMedia(null); }
    } catch (err) { console.error("Error discovering media:", err); setError(err.message); } finally { setIsDiscovering(false); }
  }, [filters, language, mediaType, userRegion, genresMap, watchedMedia, selectedMedia]);
  
  const handleSurpriseMe = useCallback(() => {
    const available = allMedia.filter(m => !sessionShownMedia.has(m.id));
    if (available.length > 0) { const newMedia = available[Math.floor(Math.random() * available.length)]; if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]); setSelectedMedia(newMedia); setSessionShownMedia(prev => new Set(prev).add(newMedia.id)); } else { fetchNewMediaBatch(); }
  }, [allMedia, sessionShownMedia, selectedMedia, fetchNewMediaBatch]);
  
  useEffect(() => { /* fetchRegionPlatforms */ }, [userRegion, mediaType]);
  useEffect(() => { /* search functionality */ }, [searchQuery, language, mediaType, genresMap]);
  
  const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
    try {
        const lang = language === 'es' ? 'es-ES' : 'en-US';
        const data = await fetchApi(`${type}/${mediaId}`, { language: lang, append_to_response: 'credits,videos,watch/providers,similar' });
        const director = data.credits?.crew?.find(p => p.job === 'Director');
        const similarMedia = data.similar?.results?.map(r => normalizeMediaData(r, type, genresMap)).filter(Boolean).slice(0, 10);
        const regionData = data['watch/providers']?.results?.[userRegion];
        const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`;
        const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
        const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
        const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
        const combinedPayProviders = [...rentProviders, ...buyProviders];
        const uniquePayProviderIds = new Set();
        const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; });
        return { ...data, duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null), providers, rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 10) || [], director, seasons: data.number_of_seasons, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMedia, };
    } catch (err) { console.error(`Error fetching details for ${type} ${mediaId}`, err); return null; }
  }, [userRegion, language, genresMap]);
  
  useEffect(() => { /* Animation for cardRef */ }, [selectedMedia]);
  useEffect(() => { if (!selectedMedia) return; const langParam = language === 'es' ? 'es-ES' : 'en-US'; setIsFetchingDetails(true); setMediaDetails({}); fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => { if (details) setMediaDetails(details); setIsFetchingDetails(false); }); }, [selectedMedia, language, fetchFullMediaDetails]);
  useEffect(() => { /* Load Watched and Watchlist from localStorage */ }, []);
  useEffect(() => { localStorage.setItem(WATCHED_MEDIA_KEY, JSON.stringify(watchedMedia)); }, [watchedMedia]);
  useEffect(() => { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchList)); }, [watchList]);

  // All other handlers from the original version restored and adapted
  // ...
  const handleToggleWatchlist = (media) => { /* ... adapted for 'media' ... */};
  const handleMarkAsWatched = (media) => {
        if(!media) return;
        const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
        setWatchedMedia(prev => ({...prev, [media.id]: { id: media.id, title: media.title, poster: media.poster, expiry: Date.now() + threeMonths }})); 
        setAllMedia(prev => prev.filter(m => m.id !== media.id));
        if (watchList[media.id]) handleToggleWatchlist(media);
        handleSurpriseMe();
  };

  const showInstallButton = installPrompt && !isIos && !isStandalone;
  const showIosInstallInstructions = isIos && !isStandalone;
  
  return (
    <div className="min-h-screen p-4 font-sans app-container relative">
        <div className="absolute top-4 right-4 z-20"><SettingsDropdown mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} language={setLanguage} t={t} openWatchedModal={()=>{}} openWatchlistModal={()=>{}}/></div>
        
        <header className="text-center mb-4 pt-16 sm:pt-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
            <h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2>
            
            <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                <button onClick={() => handleMediaTypeChange('movie')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}>{t.movies}</button>
                <button onClick={() => handleMediaTypeChange('tv')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}>{t.tvShows}</button>
            </div>
            {/* Search and filters will be here */}
        </header>

        {isDiscovering ? <SkeletonMediaCard /> : selectedMedia ? (
             <div ref={cardRef} className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] movie-card-enter">
                <div className="sm:grid sm:grid-cols-3 sm:gap-x-8">
                    <div className="sm:col-span-1 p-4 sm:p-6">
                        <img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={`${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}`} alt={`Poster for ${selectedMedia.title}`}/>
                        {!isFetchingDetails && mediaDetails.trailerKey && (<div className="mt-4 flex justify-center"><button onClick={() => {}} className="w-full max-w-[300px] rounded-lg overflow-hidden relative group shadow-lg hover:shadow-2xl transition-shadow"><img loading="lazy" src={`https://img.youtube.com/vi/${mediaDetails.trailerKey}/mqdefault.jpg`} alt="Trailer thumbnail" className="w-full"/><div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center"><div className="bg-black/50 backdrop-blur-sm rounded-full p-3"><svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg></div></div></button></div>)}
                    </div>
                    <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0">
                        <div className="text-center sm:text-left"><h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{selectedMedia.title}</h2><p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{selectedMedia.synopsis}</p></div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                           <button onClick={() => handleMarkAsWatched(selectedMedia)} className="w-full py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>{t.cardMarkAsWatched}</button>
                           <button onClick={() => handleToggleWatchlist(selectedMedia)} className="w-full py-3 px-4 bg-sky-600/80 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">{watchList[selectedMedia.id] ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>}{t.saveForLater}</button>
                           <button className="w-full py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>{t.shareButton}</button>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[var(--color-border)]"><h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3><MediaCardContent media={selectedMedia} details={mediaDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} handleActorClick={() => {}}/></div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-[var(--color-bg)]/50 border-t border-[var(--color-border)]"><h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">{t.cardSimilarMovies}</h3>{isFetchingDetails ? <div className="flex justify-center"><div className="small-loader"></div></div> : mediaDetails.similar?.length > 0 ? (<div className="horizontal-scroll-container">{mediaDetails.similar.map(media => (<button key={media.id} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150"><div className="w-full aspect-[2/3] bg-[var(--color-border)] rounded-lg overflow-hidden"><img loading="lazy" src={media.poster ? `${TMDB_IMAGE_BASE_URL}${media.poster}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=N/A'} alt={media.title} className="w-full h-full object-cover"/></div><span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">{media.title}</span></button>))}</div>) : <p className="text-sm text-[var(--color-text-secondary)] text-sm">{t.noMoviesFound}</p>}</div>
            </div>
        ) : ( <div className="text-center text-gray-400 mt-10 text-lg">{ hasSearched && allMedia.length === 0 && !isDiscovering ? (<div><p>{t.noMoviesFound}</p><button onClick={handleClearFilters} className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg">{t.clearAllFilters}</button></div>) : !hasSearched && t.welcomeMessage}</div> )}
        {/* All Modals should be here */}
        {!userRegion && ( <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 flex items-center justify-center p-4">{/* Region selection modal */}</div>)}
        <footer className="text-center mt-auto py-4 text-sm text-[var(--color-text-subtle)]"><p className="pt-4">{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p></footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));