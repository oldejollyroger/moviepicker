// app.js (v0.0.9 - Director/Actor Filter Logic)

const App = () => {
    const { useState, useEffect, useCallback, useMemo, useRef } = React;

    const [mode, setMode] = useLocalStorageState('movieRandomizerMode', 'dark');
    const [accent, setAccent] = useLocalStorageState('movieRandomizerAccent', ACCENT_COLORS[0]);
    const [language, setLanguage] = useLocalStorageState('movieRandomizerLang', 'en');
    const [tmdbLanguage, setTmdbLanguage] = useLocalStorageState('tmdbContentLang', 'en-US');
    const [userRegion, setUserRegion] = useLocalStorageState('movieRandomizerRegion', null);
    const [mediaType, setMediaType] = useLocalStorageState('mediaPickerType_v1', 'movie');
    const [showRegionSelector, setShowRegionSelector] = useState(() => !JSON.parse(localStorage.getItem('movieRandomizerRegion')));
    
    const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], minRating: 0, actor: null, creator: null, duration: 0, ageRating: 0 };
    const [filters, setFilters] = useLocalStorageState('mediaPickerFilters_v4', initialFilters);
    const [cookieConsent, setCookieConsent] = useLocalStorageState('cookieConsent_v1', false);

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
    const [modalTrailerKey, setModalTrailerKey] = useState(null);
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
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const t = translations[language];
    const cardRef = useRef(null);
    const searchRef = useRef(null);
    
    const durationOptions = useMemo(() => [ { label: t.any, gte: 0, lte: 999 }, { label: "< 90 min", gte: 0, lte: 90 }, { label: "90-120 min", gte: 90, lte: 120 }, { label: "> 120 min", gte: 120, lte: 999 } ], [t]);
    const ageRatingOptions = useMemo(() => { const ratings = userRegion === 'US' ? ['G', 'PG', 'PG-13', 'R', 'NC-17'] : ['U', 'PG', '12', '15', '18']; return [t.any, ...ratings]; }, [userRegion, t]);

    const fetchApi = useCallback(async (path, query) => { if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { throw new Error("API Key is missing."); } const params = new URLSearchParams(query); const url = `${TMDB_BASE_URL}/${path}?api_key=${TMDB_API_KEY}&${params.toString()}`; const response = await fetch(url); if (!response.ok) { const err = await response.json(); throw new Error(err.status_message || `API error: ${response.status}`); } return response.json(); }, []);
    
    const resetAllState = useCallback(() => { setAllMedia([]); setSelectedMedia(null); setHasSearched(false); setMediaHistory([]); }, []);
    const resetAndClearFilters = () => { resetAllState(); setFilters(initialFilters); };
    
    useEffect(() => {
        document.documentElement.className = mode === 'light' ? 'light-mode' : 'dark-mode';
    }, [mode]);

    useEffect(() => { const r = document.documentElement; r.style.setProperty('--color-accent', accent.color); r.style.setProperty('--color-accent-text', accent.text); r.style.setProperty('--color-accent-gradient-from', accent.from); r.style.setProperty('--color-accent-gradient-to', accent.to); }, [accent]);
    useEffect(() => { resetAllState(); }, [language, tmdbLanguage]);
    useEffect(() => { if (userRegion) localStorage.setItem('movieRandomizerRegion', JSON.stringify(userRegion)); }, [userRegion]);
    useEffect(() => { localStorage.setItem('mediaPickerFilters_v4', JSON.stringify(filters)); }, [filters]);
    useEffect(() => { const i = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream; setIsIos(i); if (window.matchMedia?.('(display-mode: standalone)').matches) setIsStandalone(true); const p = (e) => { e.preventDefault(); setInstallPrompt(e); }; window.addEventListener('beforeinstallprompt', p); return () => window.removeEventListener('beforeinstallprompt', p);}, []);

    const openTrailerModal = (key) => { setModalTrailerKey(key); setIsTrailerModalOpen(true); };
    const closeModal = () => { setIsTrailerModalOpen(false); setModalTrailerKey(null); setIsActorModalOpen(false); setModalMedia(null); setIsWatchedModalOpen(false); setIsWatchlistModalOpen(false); setIsFilterModalOpen(false); };
    useEffect(() => { const handleKeyDown = (event) => { if (event.key === 'Escape') closeModal(); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);

    useEffect(() => { const bootstrapApp = async () => { setIsLoading(true); setError(null); try { const regionsData = await fetchApi('configuration/countries', {}); setAvailableRegions(regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a,b)=>a.english_name.localeCompare(b.english_name))); } catch (err) { console.error("Error bootstrapping:", err); setError(err.message); } finally { setIsLoading(false); } }; bootstrapApp(); }, [fetchApi]);
    useEffect(() => { const fetchLanguageData = async () => { if (!tmdbLanguage) return; try { const d = await fetchApi(`genre/${mediaType}/list`, { language: tmdbLanguage }); setGenresMap(d.genres.reduce((a, g) => ({ ...a, [g.id]: g.name }), {})); } catch (e) { console.error("Error fetching language data:", e); } }; fetchLanguageData(); }, [language, tmdbLanguage, mediaType, fetchApi]);
    useEffect(() => { if (!userRegion) return; const fetchPlatforms = async () => { try { const data = await fetchApi(`watch/providers/${mediaType}`, { watch_region: userRegion }); const sorted = data.results.sort((a, b) => (a.display_priorities?.[userRegion] ?? 100) - (b.display_priorities?.[userRegion] ?? 100)); setQuickPlatformOptions(sorted.slice(0, 6).map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); setAllPlatformOptions(sorted.map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))); } catch (err) { console.error("Error fetching providers", err); }}; fetchPlatforms();}, [userRegion, mediaType, fetchApi]);
    
    useEffect(() => {
        if (debouncedSearchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const search = async () => {
            try {
                const data = await fetchApi('search/multi', { query: debouncedSearchQuery, language: tmdbLanguage });
                const results = data.results
                    .filter(r => r.media_type === 'movie' || r.media_type === 'tv' || (r.media_type === 'person' && r.profile_path))
                    .map(r => {
                        if (r.media_type === 'person') {
                            return { id: r.id, title: r.name, year: r.known_for_department, poster: r.profile_path, resultType: 'person' };
                        }
                        return { ...normalizeMediaData(r, r.media_type, genresMap), resultType: 'media' };
                    })
                    .filter(Boolean)
                    .slice(0, 7);
                setSearchResults(results);
            } catch (err) { console.error(err); } 
            finally { setIsSearching(false); }
        };
        search();
    }, [debouncedSearchQuery, tmdbLanguage, mediaType, genresMap, fetchApi]);

    const fetchFullMediaDetails = useCallback(async (mediaId, type) => {
        if (!mediaId || !type) return null;
        try {
            const endpoint = type === 'movie' ? `${type}/${mediaId}` : `${type}/${mediaId}`;
            const append_to_response = type === 'movie' ? 'credits,videos,watch/providers,similar,recommendations,release_dates' : 'credits,videos,watch/providers,similar,recommendations,content_ratings';
            const data = await fetchApi(endpoint, { language: tmdbLanguage, append_to_response });
            let certification = '';
            if (type === 'movie') { const releaseDates = data.release_dates?.results || []; const usRelease = releaseDates.find(r => r.iso_3166_1 === userRegion); certification = usRelease?.release_dates.find(rd => rd.certification)?.certification || '';
            } else { const contentRatings = data.content_ratings?.results || []; const usRating = contentRatings.find(r => r.iso_3166_1 === userRegion); certification = usRating?.rating || ''; }
            const director = data.credits?.crew?.find(p => p.job === 'Director');
            const similarMedia = [...(data.recommendations?.results || []), ...(data.similar?.results || [])].filter((v,i,a) => v.poster_path && a.findIndex(t=>(t.id === v.id))===i).map(r => normalizeMediaData(r, type, genresMap)).filter(Boolean).slice(0, 10);
            const regionData = data['watch/providers']?.results?.[userRegion];
            const watchLink = regionData?.link || `https://www.themoviedb.org/${type}/${mediaId}/watch`;
            const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
            const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
            const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
            const combinedPayProviders = [...rentProviders, ...buyProviders];
            const uniquePayProviderIds = new Set();
            const uniquePayProviders = combinedPayProviders.filter(p => { if (uniquePayProviderIds.has(p.provider_id)) return false; uniquePayProviderIds.add(p.provider_id); return true; });
            return { ...data, duration: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null), providers, rentalProviders: uniquePayProviders, cast: data.credits?.cast?.slice(0, 10) || [], director, seasons: data.number_of_seasons, trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null, similar: similarMedia, certification: certification };
        } catch (err) { console.error(`Error fetching details for ${type} ${mediaId}`, err); return null; }
    }, [userRegion, tmdbLanguage, genresMap, fetchApi]);

    useEffect(() => { if (!selectedMedia) return; setIsFetchingDetails(true); setMediaDetails({}); fetchFullMediaDetails(selectedMedia.id, selectedMedia.mediaType).then(details => { if (details) setMediaDetails(details); setIsFetchingDetails(false); }); }, [selectedMedia, fetchFullMediaDetails]);
    
    useEffect(() => { if(cookieConsent) {const wm = localStorage.getItem(WATCHED_KEY); const wl = localStorage.getItem(WATCHLIST_KEY); if (wm) { try { setWatchedMedia(JSON.parse(wm)); } catch(e){} } if (wl) { try { setWatchList(JSON.parse(wl)); } catch(e){} }} }, [cookieConsent]);
    useEffect(() => { if(cookieConsent) localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMedia)); }, [watchedMedia, cookieConsent]);
    useEffect(() => { if(cookieConsent) localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchList)); }, [watchList, cookieConsent]);
    
    // --- UPDATED: Surprise Me logic with precise age rating filtering ---
    const handleSurpriseMe = useCallback(async () => {
        if (!userRegion || !Object.keys(genresMap).length) return;
        setIsDiscovering(true);
        setError(null);
        if (selectedMedia) setMediaHistory(prev => [...prev, selectedMedia]);
        setSelectedMedia(null);
        setHasSearched(true);
        try {
            const dateParam = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';
            const runtimeParam = mediaType === 'movie' ? 'with_runtime' : 'with_episode_runtime';
            const selectedDuration = durationOptions[filters.duration];
            
            const ageRatingParams = {};
            const minAgeIndex = Math.min(filters.minAge, filters.maxAge);
            const maxAgeIndex = Math.max(filters.minAge, filters.maxAge);
            
            if (maxAgeIndex < ageRatingOptions.length) {
                const allowedRatings = ageRatingOptions.slice(minAgeIndex, maxAgeIndex + 1);
                ageRatingParams.certification_country = userRegion;
                ageRatingParams['certification.lte'] = allowedRatings[allowedRatings.length - 1];
                ageRatingParams['certification.gte'] = allowedRatings[0];
            }
            
            const queryParams = { language: tmdbLanguage, 'vote_count.gte': mediaType === 'movie' ? 200 : 100, watch_region: userRegion, ...filters.platform.length > 0 && { with_watch_providers: filters.platform.join('|') }, ...filters.genre.length > 0 && { with_genres: filters.genre.join(',') }, ...filters.excludeGenres.length > 0 && { without_genres: filters.excludeGenres.join(',') }, ...filters.minRating > 0 && { 'vote_average.gte': filters.minRating }, ...filters.decade !== 'todos' && { [`${dateParam}.gte`]: `${parseInt(filters.decade)}-01-01`, [`${dateParam}.lte`]: `${parseInt(filters.decade) + 9}-12-31` }, ...(filters.actor && { with_cast: filters.actor.id }), ...(filters.creator && { with_crew: filters.creator.id }), ...(filters.duration > 0 && { [`${runtimeParam}.gte`]: selectedDuration.gte, [`${runtimeParam}.lte`]: selectedDuration.lte }), ...ageRatingParams, sort_by: 'popularity.desc' };
    
            const initialData = await fetchApi(`discover/${mediaType}`, queryParams);
            const totalPages = Math.min(initialData.total_pages, 200);
            if (totalPages === 0) { setAllMedia([]); setSelectedMedia(null); setIsDiscovering(false); return; }
            const randomPage = Math.floor(Math.pow(Math.random(), 2) * (totalPages - 1)) + 1;
            const data = randomPage === 1 ? initialData : await fetchApi(`discover/${mediaType}`, { ...queryParams, page: randomPage });
            const transformedMedia = data.results.map(m => normalizeMediaData(m, mediaType, genresMap)).filter(Boolean);
            const unwatchedMedia = transformedMedia.filter(m => !watchedMedia[m.id]);
    
            setAllMedia(unwatchedMedia);
            if (unwatchedMedia.length > 0) { const newMedia = unwatchedMedia[Math.floor(Math.random() * unwatchedMedia.length)]; setSelectedMedia(newMedia); } 
            else { setSelectedMedia(null); }
        } catch (err) { console.error("Error discovering media:", err); setError(err.message); } 
        finally { setIsDiscovering(false); }
    }, [filters, tmdbLanguage, mediaType, userRegion, genresMap, watchedMedia, selectedMedia, fetchApi, durationOptions, ageRatingOptions]);
    
    const handleRegionChange = (newRegion) => { setUserRegion(newRegion); resetAllState(); setFilters(initialFilters); setShowRegionSelector(false); };
    const handleMediaTypeChange = (type) => { if (type === mediaType) return; resetAllState(); setFilters(initialFilters); setMediaType(type); };
    const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); };
    const handleQuickFilterToggle = (list, id) => { setFilters(f => { const current = [...(f[list] || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, [list]: current }; }); resetAllState(); };
    const handleGenreChangeInModal = (genreId, type) => { setFilters(f => { const list = [...(f[type] || [])]; const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; const otherList = [...(f[otherType] || [])]; const index = list.indexOf(genreId); if (index > -1) list.splice(index, 1); else { list.push(genreId); const otherIndex = otherList.indexOf(genreId); if(otherIndex > -1) otherList.splice(otherIndex, 1); } return {...f, [type]: list, [otherType]: otherList }; }); };
    const handlePlatformChange = (id) => { setFilters(f => { const current = [...(f.platform || [])]; const index = current.indexOf(id); if (index > -1) current.splice(index, 1); else current.push(id); return { ...f, platform: current }; }); };
    const handleMarkAsWatched = (media) => { const newWatched = {...watchedMedia}; if (newWatched[media.id]) delete newWatched[media.id]; else newWatched[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchedMedia(newWatched); };
    const handleUnwatchMedia = (mediaId) => { const newWatched = {...watchedMedia}; delete newWatched[mediaId]; setWatchedMedia(newWatched); };
    const handleToggleWatchlist = (media) => { const newWatchlist = { ...watchList }; if (newWatchlist[media.id]) delete newWatchlist[media.id]; else newWatchlist[media.id] = { id: media.id, title: media.title, poster: media.poster, mediaType: media.mediaType, year: media.year }; setWatchList(newWatchlist); };
    const handleGoBack = () => { if(mediaHistory.length === 0) return; const newHistory = [...mediaHistory]; const prev = newHistory.pop(); setMediaHistory(newHistory); setSelectedMedia(prev); };
    const handleShare = useCallback(() => { if (!selectedMedia) return; const url = `https://www.themoviedb.org/${selectedMedia.mediaType}/${selectedMedia.id}`; if (navigator.share) { navigator.share({ title: selectedMedia.title, url }).catch(err => console.error(err)); } else { navigator.clipboard.writeText(url).then(() => { setShareStatus('success'); setTimeout(() => setShareStatus('idle'), 2000); }); } }, [selectedMedia]);
    const handleInstallClick = async () => { if (!installPrompt) return; await installPrompt.prompt(); setInstallPrompt(null); };
    const handleActorClick = async (actorId) => { closeModal(); setIsActorModalOpen(true); setIsFetchingActorDetails(true); fetchApi(`person/${actorId}`, { append_to_response: 'movie_credits,tv_credits' }).then(setActorDetails).catch(console.error).finally(()=>setIsFetchingActorDetails(false)); };
    const handleSimilarMediaClick = (media) => { setModalMedia(normalizeMediaData(media, mediaType, genresMap)); };
    
    const handleSearchResultClick = (result) => {
        if (result.resultType === 'person') {
            const isCreator = result.year === 'Directing' || result.year === 'Writing' || result.year === 'Production';
            setFilters(f => ({
                ...f,
                actor: isCreator ? null : result,
                creator: isCreator ? result : null
            }));
            resetAllState();
        } else {
            if(selectedMedia) setMediaHistory(prev=>[...prev,selectedMedia]);
            setSelectedMedia(result);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const quickFilterGenres = useMemo(() => {
        if(mediaType === 'movie') return [{ id: '28', name: 'Action' }, { id: '35', name: 'Comedy' }, { id: '878', name: 'Sci-Fi' }, { id: '53', name: 'Thriller' }];
        return [{ id: '10759', name: 'Action & Adventure' }, { id: '35', name: 'Comedy' }, { id: '10765', name: 'Sci-Fi & Fantasy' }, { id: '80', name: 'Crime' }];
    }, [mediaType]);
    
    const tmdbLanguages = [{code:'en-US',name:'English'},{code:'es-ES',name:'Español'},{code:'fr-FR',name:'Français'},{code:'de-DE',name:'Deutsch'},{code:'it-IT',name:'Italiano'},{code:'pt-PT',name:'Português'},{code:'ru-RU',name:'Русский'},{code:'ja-JP',name:'日本語'},{code:'ko-KR',name:'한국어/조선말'},{code:'zh-CN',name:'中文'}];
    const showInstallButton = installPrompt && !isIos && !isStandalone;
    const showIosInstallInstructions = isIos && !isStandalone;
    const isCurrentMediaWatched = selectedMedia && watchedMedia[selectedMedia.id];
    
    if (isLoading) { return ( <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center"><div className="loader"></div></div> ); }
    if (error) { return ( <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-red-500">{error}</div> ); }
    
    return (
        <div className="min-h-screen p-4 font-sans app-container">
            {/* ... (rest of the JSX from v0.0.6, which is already correct for v0.0.8 features) ... */}
        </div>
    );
};