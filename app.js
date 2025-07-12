// app.js

const App = () => {
    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    const [mode, setMode] = useLocalStorageState('movieRandomizerMode', 'dark');
    const [accent, setAccent] = useLocalStorageState('movieRandomizerAccent', ACCENT_COLORS[0]);
    const [language, setLanguage] = useLocalStorageState('movieRandomizerLang', 'en');
    const [tmdbLanguage, setTmdbLanguage] = useLocalStorageState('tmdbContentLang', 'en-US');
    const [userRegion, setUserRegion] = useLocalStorageState('movieRandomizerRegion', null);
    const [mediaType, setMediaType] = useLocalStorageState('mediaPickerType_v1', 'movie');
    const [showRegionSelector, setShowRegionSelector] = useState(false);
    
    const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0, actor: null, creator: null, duration: 0, ageRating: 0 };
    const [filters, setFilters] = useLocalStorageState('mediaPickerFilters_v4', initialFilters);
    const WATCHED_KEY = 'mediaPickerWatched_v2';
    const WATCHLIST_KEY = 'mediaPickerWatchlist_v2';
    const [watchedMedia, setWatchedMedia] = useLocalStorageState(WATCHED_KEY, {});
    const [watchList, setWatchList] = useLocalStorageState(WATCHLIST_KEY, {});
    
    const [allMedia, setAllMedia] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaHistory, setMediaHistory] = useState([]);
    const [mediaDetails, setMediaDetails] = useState({});
    const [shareStatus, setShareStatus] = useState('idle'); 
    const [availableRegions, setAvailableRegions] = useState([]);
    const [quickPlatformOptions, setQuickPlatformOptions] = useState([]);
    const [allPlatformOptions, setAllPlatformOptions] = useState([]);
    const [platformSearchQuery, setPlatformSearchQuery] = useState('');
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [modalMedia, setModalMedia] = useState(null);
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
    const [personSearch, setPersonSearch] = useState({ query: '', type: null });
    const [personSearchResults, setPersonSearchResults] = useState([]);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const debouncedPersonSearchQuery = useDebounce(personSearch.query, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const t = translations[language];
    const cardRef = useRef(null);
    const searchRef = useRef(null);
    
    const durationOptions = useMemo(() => [
        { label: t.any, gte: 0, lte: 999 },
        { label: "< 90 min", gte: 0, lte: 90 },
        { label: "90-120 min", gte: 90, lte: 120 },
        { label: "> 120 min", gte: 120, lte: 999 }
    ], [t]);

    const ageRatingOptions = useMemo(() => {
        const ratings = userRegion === 'US' ? ['G', 'PG', 'PG-13', 'R', 'NC-17'] : ['U', 'PG', '12', '15', '18'];
        return [t.any, ...ratings];
    }, [userRegion, t]);

    const fetchTMDbApi = useCallback(async (path, query) => { if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { throw new Error("API Key is missing."); } const params = new URLSearchParams(query); const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`; const response = await fetch(url); if (!response.ok) { const err = await response.json(); throw new Error(err.status_message || `API error: ${response.status}`); } return response.json(); }, []);
    
    const fetchIgdbApi = useCallback(async (endpoint, queryBody) => {
        const response = await fetch('/api/igdb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, queryBody })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'IGDB proxy error');
        }
        return response.json();
    }, []);
    
    const normalizeGameData = (game) => {
        if (!game || !game.id) return null;
        const posterUrl = game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null;
        return {
            id: game.id.toString(),
            title: game.name,
            synopsis: game.summary || "No summary available.",
            year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
            imdbRating: game.total_rating ? Math.round(game.total_rating) : 'N/A',
            genres: game.genres?.map(g => g.name) || [],
            poster: posterUrl,
            mediaType: 'game'
        };
    };

    const resetAllState = useCallback(() => { setAllMedia([]); setSelectedMedia(null); setHasSearched(false); setMediaHistory([]); }, []);
    const resetAndClearFilters = () => { resetAllState(); setFilters(initialFilters); };
    
    useEffect(() => { document.documentElement.classList.toggle('light-mode', mode === 'light'); }, [mode]);
    useEffect(() => { const r = document.documentElement; r.style.setProperty('--color-accent', accent.color); r.style.setProperty('--color-accent-text', accent.text); r.style.setProperty('--color-accent-gradient-from', accent.from); r.style.setProperty('--color-accent-gradient-to', accent.to); }, [accent]);
    
    // --- UPDATED: This now only runs when the site language changes to avoid re-fetching on tmdbLanguage change ---
    useEffect(() => { resetAllState(); }, [language]); 
    
    useEffect(() => { if (userRegion) localStorage.setItem('movieRandomizerRegion', userRegion); }, [userRegion]);
    useEffect(() => { localStorage.setItem('mediaPickerFilters_v4', JSON.stringify(filters)); }, [filters]);
    useEffect(() => { const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream; setIsIos(i); if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true); const p = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener('beforeinstallprompt', p); return () => window.removeEventListener('beforeinstallprompt', p);}, []);

    const closeModal = () => { setIsTrailerModalOpen(false); setIsActorModalOpen(false); setModalMedia(null); setIsWatchedModalOpen(false); setIsWatchlistModalOpen(false); setIsFilterModalOpen(false); };
    useEffect(() => { const handleKeyDown = (event) => { if (event.key === 'Escape') closeModal(); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);

    useEffect(() => { const bootstrapApp = async () => { setIsLoading(true); setError(null); try { const regionsData = await fetchTMDbApi('configuration/countries', {}); setAvailableRegions(regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a,b)=>a.english_name.localeCompare(b.english_name))); } catch (err) { console.error("Error bootstrapping:", err); setError(err.message); } finally { setIsLoading(false); } }; bootstrapApp(); }, [fetchTMDbApi]);
    
    // --- UPDATED: Genre fetching logic now depends on mediaType and tmdbLanguage (for TMDB only) ---
    useEffect(() => {
        const fetchGenres = async () => {
            setGenresMap({}); // Clear previous genres
            try {
                if (mediaType === 'game') {
                    const data = await fetchIgdbApi('genres', 'fields name; limit 50;');
                    setGenresMap(data.reduce((a, g) => ({ ...a, [g.id]: g.name }), {}));
                } else {
                    if (!tmdbLanguage) return;
                    const data = await fetchTMDbApi(`genre/${mediaType}/list`, { language: tmdbLanguage });
                    setGenresMap(data.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {}));
                }
            } catch (e) {
                console.error("Error fetching genres:", e);
                setError(`Could not fetch genres for ${mediaType}.`);
            }
        };
        fetchGenres();
    }, [mediaType, tmdbLanguage, fetchTMDbApi, fetchIgdbApi]);
    
    useEffect(() => {
        if (mediaType === 'game') {
            setQuickPlatformOptions([]);
            return;
        }
        if (!userRegion) return; 
        const fetchPlatforms = async () => { try { const data = await fetchTMDbApi(`watch/providers/${mediaType}`, { watch_region: userRegion }); const sorted = data.results.sort((a, b) => (a.display_priorities?.[userRegion] ?? 100) - (b.display_priorities?.[userRegion] ?? 100)); setQuickPlatformOptions(sorted.slice(0, 6).map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); setAllPlatformOptions(sorted.map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); } catch (err) { console.error("Error fetching providers", err); }};
        fetchPlatforms();
    }, [userRegion, mediaType, fetchTMDbApi]);

    useEffect(() => {
        if (debouncedSearchQuery.trim() === '') { setSearchResults([]); return; }
        setIsSearching(true);
        const search = async () => {
            try {
                let results = [];
                if (mediaType === 'game') {
                    const queryBody = `search "${debouncedSearchQuery}"; fields name, cover.image_id, first_release_date, genres.name, total_rating, summary; limit 5;`;
                    const data = await fetchIgdbApi('games', queryBody);
                    results = data.map(normalizeGameData);
                } else {
                    const data = await fetchTMDbApi(`search/${mediaType}`, { query: debouncedSearchQuery, language: tmdbLanguage });
                    results = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean).slice(0, 5);
                }
                setSearchResults(results);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        };
        search();
    }, [debouncedSearchQuery, tmdbLanguage, mediaType, genresMap, fetchTMDbApi, fetchIgdbApi]);

    useEffect(() => { if (debouncedPersonSearchQuery.trim().length < 2) { setPersonSearchResults([]); return; } const searchPeople = async () => { try { const data = await fetchTMDbApi('search/person', { query: debouncedPersonSearchQuery }); setPersonSearchResults(data.results.filter(p => p.profile_path).slice(0, 5)); } catch (err) { console.error("Error searching for people:", err); }}; searchPeople(); }, [debouncedPersonSearchQuery, fetchTMDbApi]);  

    const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
        if (!mediaId || !type) return null;
        if (type === 'game') {
            try {
                const queryBody = `fields name, summary, cover.image_id, first_release_date, genres.name, total_rating, involved_companies.company.name, involved_companies.developer, platforms.name, similar_games.*, similar_games.cover.*, similar_games.genres.*, videos.*, websites.*; where id = ${mediaId};`;
                const [gameData] = await fetchIgdbApi('games', queryBody);
                if (!gameData) return null;
                return { ...gameData, developer: gameData.involved_companies?.find(c => c.developer)?.company.name, platforms: gameData.platforms?.map(p => p.name) || [], similar: gameData.similar_games?.map(normalizeGameData).filter(Boolean).slice(0, 10) || [], trailerKey: gameData.videos?.find(v => v.name === "Trailer")?.video_id };
            } catch (err) { console.error(`Error fetching details for game ${mediaId}`, err); return null; }
        } else {
             try { const data = await fetchTMDbApi(`${type}/${mediaId}`, { language: tmdbLanguage, append_to_response: 'credits,videos,watch/providers,similar,recommendations'}); const director = data.credits?.crew?.find(p => p.job === 'Director'); const similarMedia = [...(data.recommendations?.results || []), ...(data.similar?.results || [])].filter((v,i,a) => v.poster_path && a.findIndex(t=>(t.id === v.id))===i).map(r => normalizeMediaData(r, type, genresMap)).filter(Boolean).slice(0, 10); const regionData = data['watch/providers']?.results?.[userRegion]; const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`; const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink })); const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink })); const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink })); const combinedPayProviders = [...rentProviders, ...buyProviders]; const uniquePayProviderIds = new Set(); const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; }); return { ...data, duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null), providers, rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 10) || [], director, seasons: data.number_of_seasons, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMedia, }; } catch (err) { console.error(`Error fetching details for ${type} ${mediaId}`, err); return null; }
        }
    }, [userRegion, tmdbLanguage, genresMap, fetchTMDbApi, fetchIgdbApi]);

    useEffect(() => { if (!selectedMedia) return; setIsFetchingDetails(true); setMediaDetails({}); fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => { if (details) setMediaDetails(details); setIsFetchingDetails(false); }); }, [selectedMedia, fetchFullMediaDetails]);
    
    useEffect(() => { const wm = localStorage.getItem(WATCHED_KEY); const wl = localStorage.getItem(WATCHLIST_KEY); if (wm) { try { setWatchedMedia(JSON.parse(wm)); } catch(e){} } if (wl) { try { setWatchList(JSON.parse(wl)); } catch(e){} } }, []);
    useEffect(() => { localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMedia)); }, [watchedMedia]);
    useEffect(() => { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchList)); }, [watchList]);
    
    const handleSurpriseMe = useCallback(async () => {
        if (mediaType !== 'game' && (!userRegion || !Object.keys(genresMap).length)) return;
        setIsDiscovering(true);
        setError(null);
        if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
        setSelectedMedia(null);
        setHasSearched(true);

        try {
            let fetchedMedia = [];
            if (mediaType === 'game') {
                const whereClauses = [ 'total_rating_count > 20', 'first_release_date != null', 'cover != null' ];
                if (filters.minRating > 0) whereClauses.push(`total_rating >= ${filters.minRating}`);
                if (filters.decade !== 'todos') { const start = Math.floor(new Date(`${filters.decade}-01-01`).getTime() / 1000); const end = Math.floor(new Date(`${parseInt(filters.decade) + 9}-12-31`).getTime() / 1000); whereClauses.push(`first_release_date >= ${start} & first_release_date <= ${end}`); }
                if (filters.genre.length > 0) whereClauses.push(`genres = (${filters.genre.join(',')})`);
                const queryBody = `fields name, cover.image_id, first_release_date, genres.name, total_rating, summary; where ${whereClauses.join(' & ')}; sort popularity desc; limit 100;`;
                const data = await fetchIgdbApi('games', queryBody);
                fetchedMedia = data.map(normalizeGameData);
            } else {
                const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
                const runtimeParam = mediaType === 'movie' ? 'with_runtime' : 'with_episode_runtime';
                const selectedDuration = durationOptions[filters.duration];
                const ageRatingParams = {};
                if (filters.ageRating > 0) { const allowedRatings = ageRatingOptions.slice(1, filters.ageRating + 1).join('|'); ageRatingParams.certification_country = userRegion; ageRatingParams.certification = allowedRatings; }
                const queryParams = { language: tmdbLanguage, 'vote_count.gte': mediaType === 'movie' ? 200 : 100, watch_region: userRegion, ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') }, ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') }, ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }, ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating }, ...filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` }, ...(filters.actor && { with_cast: filters.actor.id }), ...(filters.creator && { with_crew: filters.creator.id }), ...(filters.duration > 0 && { [`${runtimeParam}.gte`]: selectedDuration.gte, [`${runtimeParam}.lte`]: selectedDuration.lte }), ...ageRatingParams, sort_by: 'popularity.desc' };
                const initialData = await fetchTMDbApi(`discover/${mediaType}`, { ...queryParams, page: 1 });
                const totalPages = Math.min(initialData.total_pages, 200);
                if (totalPages === 0) { setAllMedia([]); setSelectedMedia(null); setIsDiscovering(false); return; }
                const randomPage = Math.floor(Math.pow(Math.random(), 2) * (totalPages - 1)) + 1;
                const data = randomPage === 1 ? initialData : await fetchTMDbApi(`discover/${mediaType}`, { ...queryParams, page: randomPage });
                fetchedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
            }
            
            const unwatchedMedia = fetchedMedia.filter(m => !watchedMedia[m.id]);
            setAllMedia(unwatchedMedia);
            if (unwatchedMedia.length > 0) { const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]; setSelectedMedia(newMedia); } 
            else { setSelectedMedia(null); }

        } catch (err) { console.error("Error discovering media:", err); setError(err.message); } 
        finally { setIsDiscovering(false); }
    }, [filters, language, tmdbLanguage, mediaType, userRegion, genresMap, watchedMedia, selectedMedia, fetchTMDbApi, fetchIgdbApi, durationOptions, ageRatingOptions]);
    
    const handleRegionChange = (newRegion) => { setUserRegion(newRegion); resetAllState(); setFilters(initialFilters); setShowRegionSelector(false); };
    const handleMediaTypeChange = (type) => { if (type === mediaType) return; resetAllState(); setFilters(initialFilters); setMediaType(type); };
    const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); resetAllState(); };
    const handleGenreChangeInModal = (genreId, type) => { setFilters(f => { const list = [...(f[type] || [])]; const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; const otherList = [...(f[otherType] || [])]; const index = list.indexOf(genreId); if (index > -1) list.splice(index, 1); else { list.push(genreId); const otherIndex = otherList.indexOf(genreId); if(otherIndex > -1) otherList.splice(otherIndex, 1); } return {...f, [type]: list, [otherType]: otherList }; }); };
    const handleQuickFilterToggle = (list, id) => { setFilters(f => { const current = [...(f[list] || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, [list]: current }; }); resetAllState(); };
    const handlePlatformChange = (id) => { setFilters(f => { const current = [...(f.platform || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, platform: current }; }); };
    const handleSelectPerson = (person, type) => { setFilters(f => ({ ...f, [type]: person })); setPersonSearch({ query: '', type: null }); setPersonSearchResults([]); resetAllState();};
    const handleMarkAsWatched = (media) => { const newWatched = {...watchedMedia}; if (newWatched[media.id]) delete newWatched[media.id]; else newWatched[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchedMedia(newWatched); };
    const handleUnwatchMedia = (mediaId) => { const newWatched = {...watchedMedia}; delete newWatched[mediaId]; setWatchedMedia(newWatched); };
    const handleToggleWatchlist = (media) => { const newWatchlist = { ...watchList }; if (newWatchlist[media.id]) delete newWatchlist[media.id]; else newWatchlist[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchList(newWatchlist); };
    const handleGoBack = () => { if(mediaHistory.length === 0) return; const newHistory = [...mediaHistory]; const prev = newHistory.pop(); setMediaHistory(newHistory); setSelectedMedia(prev); };
    const handleShare = useCallback(() => { if (!selectedMedia) return; const url = selectedMedia.mediaType === 'game' ? `https://www.igdb.com/games/${selectedMedia.title.toLowerCase().replace(/ /g, '-')}` : `https://www.themoviedb.org/${selectedMedia.mediaType}/${selectedMedia.id}`; if (navigator.share) { navigator.share({ title: selectedMedia.title, url }).catch(err => console.error(err)); } else { navigator.clipboard.writeText(url).then(() => { setShareStatus('success'); setTimeout(() => setShareStatus('idle'), 2000); }); } }, [selectedMedia]);
    const handleInstallClick = async () => { if (!installPrompt) return; await installPrompt.prompt(); setInstallPrompt(null); };
    const handleActorClick = async (actorId) => { closeModal(); setTimeout(() => {setIsActorModalOpen(true); setIsFetchingActorDetails(true); fetchTMDbApi(`person/${actorId}`, { append_to_response: 'movie_credits,tv_credits' }).then(setActorDetails).catch(console.error).finally(()=>setIsFetchingActorDetails(false)); }, 100);};
    const handleSimilarMediaClick = (media) => { setModalMedia(media); };
    const handleActorCreditClick = (media) => { closeModal(); setTimeout(() => { setModalMedia(normalizeMediaData(media, media.media_type, genresMap)); }, 300);};
    const handleSearchResultClick = (media) => { if(selectedMedia) setMediaHistory(prev=>[...prev,selectedMedia]); setSelectedMedia(media); setSearchQuery(''); setSearchResults([]); }

    const quickFilterGenres = useMemo(() => {
        if (mediaType === 'game') return [{ id: 12, name: 'RPG' }, { id: 32, name: 'Indie' }, { id: 31, name: 'Adventure' }, { id: 4, name: 'Fighting' }];
        if (mediaType === 'movie') return [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' }];
        return [{ id: 10759, name: 'Action & Adventure' }, { id: 35, name: 'Comedy' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 80, name: 'Crime' }];
    }, [mediaType]);
    
    const tmdbLanguages = [{code:'en-US',name:'English'},{code:'es-ES',name:'Español'},{code:'fr-FR',name:'Français'},{code:'de-DE',name:'Deutsch'},{code:'it-IT',name:'Italiano'},{code:'pt-PT',name:'Português'},{code:'ru-RU',name:'Русский'},{code:'ja-JP',name:'日本語'},{code:'ko-KR',name:'한국어/조선말'},{code:'zh-CN',name:'中文'}];
    const showInstallButton = installPrompt && !isIos && !isStandalone;
    const showIosInstallInstructions = isIos && !isStandalone;
    const isCurrentMediaWatched = selectedMedia && watchedMedia[selectedMedia.id];
    
    if (isLoading) { return ( <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center"><div className="loader"></div></div> ); }
    if (error) { return ( <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-red-500">{error}</div> ); }
    
    return (
        <div className="min-h-screen p-4 font-sans app-container relative">
            <div className="absolute top-4 right-4 z-20"><SettingsDropdown mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} language={language} setLanguage={setLanguage} tmdbLanguage={tmdbLanguage} setTmdbLanguage={setTmdbLanguage} tmdbLanguages={tmdbLanguages} t={t} openWatchedModal={()=>setIsWatchedModalOpen(true)} openWatchlistModal={()=>setIsWatchlistModalOpen(true)} openRegionSelector={() => setShowRegionSelector(true)} /></div>
            <header className="text-center mb-4 pt-16 sm:pt-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1>
                <h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2>
                <div className="mt-6 inline-flex p-1 rounded-full media-type-switcher">
                    <button onClick={() => handleMediaTypeChange('movie')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 flex items-center justify-center gap-2 media-type-btn ${mediaType === 'movie' ? 'media-type-btn-active' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>{t.movies}</button>
                    <button onClick={() => handleMediaTypeChange('tv')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 flex items-center justify-center gap-2 media-type-btn ${mediaType === 'tv' ? 'media-type-btn-active' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.5 13a3.5 3.5 0 01-2.475-5.928.5.5 0 01.95.334A2.5 2.5 0 003.5 12.5a.5.5 0 010 1zM16.5 13a3.5 3.5 0 002.475-5.928.5.5 0 00-.95.334A2.5 2.5 0 0116.5 12.5a.5.5 0 000 1z" clipRule="evenodd" /><path d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zM7 3a1 1 0 011-1h4a1 1 0 011 1v1h-6V3zM3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/></svg>{t.tvShows}</button>
                    <button onClick={() => handleMediaTypeChange('game')} className={`px-4 py-2 rounded-full text-sm font-semibold w-28 flex items-center justify-center gap-2 media-type-btn ${mediaType === 'game' ? 'media-type-btn-active' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>{t.games}</button>
                </div>
                <div className="max-w-xl mx-auto mt-6 flex flex-col items-center gap-4">
                  <div ref={searchRef} className="relative w-full">
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full p-3 pl-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"/>
                      <div className="absolute top-0 left-0 inline-flex items-center p-3">{isSearching ? <div className="small-loader !m-0 !w-5 !h-5"></div> : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}</div>
                      {searchResults.length > 0 && (<ul className="absolute w-full mt-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">{searchResults.map(media => (<li key={media.id} onClick={() => handleSearchResultClick(media)} className="p-3 hover:bg-[var(--color-bg)] cursor-pointer flex items-center gap-4"><img loading="lazy" src={media.poster ? media.poster : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={media.title} className="w-12 h-auto rounded-md" /><div className="text-left"><p className="font-semibold text-[var(--color-text-primary)]">{media.title}</p><p className="text-sm text-[var(--color-text-secondary)]">{media.year}</p></div></li>))}</ul>)}
                  </div>
                </div>
            </header>
            <div className="max-w-3xl mx-auto mb-4 p-4 space-y-4 text-center">
              <div><div className="flex flex-wrap justify-center gap-2"> {quickFilterGenres.map(genre => (<button key={genre.id} onClick={() => handleQuickFilterToggle('genre', String(genre.id))} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.genre.includes(String(genre.id)) ? 'quick-filter-btn-active' : ''}`}>{genre.name}</button>))} </div></div>
              {userRegion && mediaType !== 'game' && quickPlatformOptions.length > 0 && (<div><div className="flex flex-wrap justify-center gap-2"> {quickPlatformOptions.map(p => (<button key={p.id} onClick={() => handleQuickFilterToggle('platform', p.id)} className={`px-3 py-1 rounded-full text-sm font-medium quick-filter-btn ${filters.platform.includes(p.id) ? 'quick-filter-btn-active' : ''}`}>{p.name}</button>))} </div></div>)}
            </div>
            <div className="max-w-3xl mx-auto mb-8 p-4 bg-[var(--color-card-bg)] rounded-xl shadow-lg border border-[var(--color-border)]">
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${mediaType === 'game' ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-x-6 gap-y-4 items-center`}>
                    <div className="md:col-span-1"><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={(e) => handleFilterChange('decade', e.target.value)} className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
                    <div className="md:col-span-1"><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {mediaType === 'game' ? Number(filters.minRating) : Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max={mediaType === 'game' ? 100 : 9.5} step={mediaType === 'game' ? 5 : 0.5} value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                    { mediaType === 'movie' && <>
                        <div className="md:col-span-1"><label htmlFor="duration-filter" className="filter-label"><span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.duration}</span><span className="text-sm font-semibold text-[var(--color-accent-text)]">{durationOptions[filters.duration].label}</span></label><input type="range" id="duration-filter" min="0" max={durationOptions.length - 1} step="1" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                        <div className="md:col-span-1"><label htmlFor="age-rating-filter" className="filter-label"><span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.ageRating}</span><span className="text-sm font-semibold text-[var(--color-accent-text)]">{ageRatingOptions[filters.ageRating]}</span></label><input type="range" id="age-rating-filter" min="0" max={ageRatingOptions.length - 1} step="1" value={filters.ageRating} onChange={(e) => handleFilterChange('ageRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"/></div>
                    </>}
                    <button onClick={() => setIsFilterModalOpen(true)} className="w-full sm:col-span-2 md:col-span-2 lg:col-span-1 p-2 bg-[var(--color-bg)] hover:bg-[var(--color-border)] border border-[var(--color-border)] hover:border-[var(--color-accent-text)] text-[var(--color-text-primary)] font-semibold rounded-full transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>{t.showFilters}</button>
                </div>
            </div>
            <div className="text-center mb-10 flex justify-center items-center gap-4"><button onClick={handleGoBack} disabled={mediaHistory.length===0} className="p-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg></button><button onClick={handleSurpriseMe} disabled={isDiscovering || (mediaType !== 'game' && !userRegion)} title={!userRegion && mediaType !== 'game' ? t.selectRegionPrompt : ''} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isDiscovering ? t.searching : t.surpriseMe}</button></div>
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
                {filters.platform.map(id => (allPlatformOptions.find(p=>p.id===id)?.name) && <div key={`pill-p-${id}`} className="filter-pill"><span>{allPlatformOptions.find(p=>p.id===id).name}</span><button onClick={() => handleQuickFilterToggle('platform', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>)}
                {filters.genre.map(id => genresMap[id] && <div key={`pill-g-${id}`} className="filter-pill"><span>{genresMap[id]}</span><button onClick={() => handleQuickFilterToggle('genre', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>)}
            </div>
            {isDiscovering ? <SkeletonMediaCard /> : selectedMedia ? (
                 <div ref={cardRef} className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] movie-card-enter">
                    <div className="sm:grid sm:grid-cols-3 sm:gap-x-8">
                        <div className="sm:col-span-1 p-4 sm:p-6"><img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={selectedMedia.poster ? selectedMedia.poster.startsWith('https') ? selectedMedia.poster : `${TMDB_IMAGE_BASE_URL}${selectedMedia.poster}` : 'https://placehold.co/500x750/1f2937/FFFFFF?text=No+Image'} alt={`Poster for ${selectedMedia.title}`}/>{!isFetchingDetails && mediaDetails.trailerKey && (<div className="mt-4 flex justify-center"><button onClick={()=>setIsTrailerModalOpen(true)} className="w-full max-w-[300px] flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent)]/20 text-[var(--color-accent-text)] font-bold rounded-lg shadow-md transition-colors hover:bg-[var(--color-accent)]/30"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>{t.cardTrailer}</button></div>)}</div>
                        <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0">
                            <div className="text-center sm:text-left"><h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{selectedMedia.title}</h2><p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{selectedMedia.synopsis}</p></div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => handleMarkAsWatched(selectedMedia)} className={`w-full py-3 px-4 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 ${isCurrentMediaWatched ? 'bg-green-600/80 hover:bg-green-600' : 'bg-red-600/80 hover:bg-red-600' }`}>{isCurrentMediaWatched ? t.cardIsWatched : t.cardMarkAsWatched}</button>
                                <button onClick={() => handleToggleWatchlist(selectedMedia)} className="w-full py-3 px-4 bg-sky-600/80 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">{watchList[selectedMedia.id] ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>}{t.saveForLater}</button>
                                <button onClick={handleShare} className="w-full py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>{shareStatus === 'success' ? t.shareSuccess : t.shareButton}</button>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--color-border)]"><h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3><MemoizedMediaCardContent media={selectedMedia} details={mediaDetails} isFetching={isFetchingDetails} t={t} userRegion={userRegion} handleActorClick={handleActorClick}/></div>
                        </div>
                    </div>
                    {mediaType !== 'game' && <div className="p-4 sm:p-6 bg-[var(--color-bg)]/50 border-t border-[var(--color-border)]"><h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">{t.cardSimilarMovies}</h3>{isFetchingDetails ? <div className="flex justify-center"><div className="small-loader"></div></div> : mediaDetails.similar?.length > 0 ? (<div className="horizontal-scroll-container">{mediaDetails.similar.map(media => (<button key={media.id} onClick={()=>handleSimilarMediaClick(media)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150"><div className="w-full aspect-[2/3] bg-[var(--color-border)] rounded-lg overflow-hidden"><img loading="lazy" src={media.poster ? `${TMDB_IMAGE_BASE_URL}${media.poster}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=N/A'} alt={media.title} className="w-full h-full object-cover"/></div><span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">{media.title}</span></button>))}</div>) : <p className="text-sm text-[var(--color-text-secondary)] text-sm">{t.noMoviesFound}</p>}</div>}
                </div>
            ) : ( <div className="text-center text-gray-400 mt-10 text-lg">{ hasSearched && allMedia.length === 0 && !isDiscovering ? (<div><p>{t.noMoviesFound}</p><button onClick={resetAndClearFilters} className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg">{t.clearAllFilters}</button></div>) : !hasSearched && t.welcomeMessage}</div> )}
            
            <TrailerModal isOpen={isTrailerModalOpen} close={() => setIsTrailerModalOpen(false)} trailerKey={mediaDetails.trailerKey} mediaType={selectedMedia?.mediaType} />
            <FilterModal isOpen={isFilterModalOpen} close={()=>setIsFilterModalOpen(false)} handleClearFilters={resetAndClearFilters} filters={filters} handleGenreChangeInModal={handleGenreChangeInModal} handlePlatformChange={handlePlatformChange} genresMap={genresMap} allPlatformOptions={allPlatformOptions} platformSearchQuery={platformSearchQuery} setPlatformSearchQuery={setPlatformSearchQuery} t={t} handleSelectPerson={handleSelectPerson} personSearch={personSearch} setPersonSearch={setPersonSearch} personSearchResults={personSearchResults} mediaType={mediaType} handleFilterChange={handleFilterChange} />
            <WatchedMediaModal isOpen={isWatchedModalOpen} close={()=>setIsWatchedModalOpen(false)} watchedMedia={watchedMedia} handleUnwatchMedia={handleUnwatchMedia} mediaType={mediaType} t={t}/>
            <WatchlistModal isOpen={isWatchlistModalOpen} close={()=>setIsWatchlistModalOpen(false)} watchlist={watchList} handleToggleWatchlist={handleToggleWatchlist} mediaType={mediaType} t={t} />
            <ActorDetailsModal isOpen={isActorModalOpen} close={()=>setIsActorModalOpen(false)} actorDetails={actorDetails} isFetching={isFetchingActorDetails} handleActorCreditClick={handleActorCreditClick} t={t}/>
            <SimilarMediaModal media={modalMedia} close={()=>setModalMedia(null)} fetchFullMediaDetails={fetchFullMediaDetails} handleActorClick={handleActorClick} handleSimilarMediaClick={handleSimilarMediaClick} t={t} userRegion={userRegion} />

            {(showRegionSelector || (!userRegion && mediaType !== 'game')) && ( <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 flex items-center justify-center p-4"><div className="text-center max-w-md bg-[var(--color-card-bg)] p-8 rounded-xl shadow-2xl"><h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>{availableRegions.length > 0 ? (<select id="initial-region-filter" onChange={(e) => handleRegionChange(e.target.value)} defaultValue="" className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="" disabled>-- {t.region} --</option>{availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}</select>) : (<div className="loader"></div>)}</div></div>)}
            <footer className="text-center mt-auto py-4 text-sm text-[var(--color-text-subtle)]">{showInstallButton && <InstallPwaButton t={t} handleInstallClick={handleInstallClick}/>}{showIosInstallInstructions && <InstallPwaInstructions t={t}/>}<p className="pt-4">{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a> & <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">IGDB</a>.</p></footer>
        </div>
    );
};