const { useState, useEffect, useCallback, useMemo, useRef } = React;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const TMDB_THUMBNAIL_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const CURATED_COUNTRY_LIST = new Set([ 'AR', 'AU', 'AT', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'DK', 'EG', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'ID', 'IE', 'IL', 'IT', 'JP', 'MY', 'MX', 'NL', 'NZ', 'NG', 'NO', 'PE', 'PH', 'PL', 'PT', 'RO', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'CH', 'TW', 'TH', 'TR', 'AE', 'GB', 'US' ]);
const ACCENT_COLORS = [ { name: 'Cyberpunk', color: '#d946ef', text: '#f0abfc', from: '#22d3ee', to: '#d946ef' }, { name: 'Ocean', color: '#22d3ee', text: '#67e8f9', from: '#22d3ee', to: '#3b82f6' }, { name: 'Forest', color: '#22c55e', text: '#4ade80', from: '#4ade80', to: '#a3e635' }, { name: 'Volcano', color: '#dc2626', text: '#f87171', from: '#f97316', to: '#ef4444' }, { name: 'Sunset', color: '#f97316', text: '#fbbf24', from: '#fb923c', to: '#f59e0b' }, { name: 'Galaxy', color: '#8b5cf6', text: '#d8b4fe', from: '#a855f7', to: '#d946ef' }, { name: 'Mint', color: '#10b981', text: '#6ee7b7', from: '#34d399', to: '#6ee7b7' }, { name: 'Gold', color: '#f59e0b', text: '#fcd34d', from: '#fbbf24', to: '#fde047'}];
const translations = {
    es: { settings: "Ajustes", watchedMoviesTitle: "Películas Vistas", unmark: "Quitar", noMoviesWatched: "Aún no has marcado ninguna película como vista.", installApp: "Instalar App", installInstructions: "Para instalar, presiona Compartir y luego 'Agregar a la pantalla de inicio'", title: 'Movie Randomizer', subtitle: '¿Qué vemos esta noche?', advancedFilters: 'Filtros Avanzados', clearFilters: 'Limpiar Filtros', showFilters: 'Más Filtros', hideFilters: 'Ocultar Filtros', applyFilters: 'Aplicar Filtros', sortBy: 'Ordenar por:', sortOptions: [ { name: 'Popularidad', id: 'popularity.desc' }, { name: 'Mejor Calificación', id: 'vote_average.desc' }, { name: 'Fecha de Estreno', id: 'primary_release_date.desc' } ], region: 'País:', selectRegionPrompt: 'Por favor, selecciona tu país para empezar', platform: 'Plataformas (Opcional):', platformSearchPlaceholder: 'Buscar plataforma...', includeGenre: 'Incluir Géneros:', excludeGenre: 'Excluir Géneros:', decade: 'Década:', allDecades: 'Cualquiera', minRating: 'Calificación Mínima:', surpriseMe: '¡Sorpréndeme!', goBack: 'Atrás', searching: 'Buscando...', searchPlaceholder: 'O busca una película específica...', welcomeMessage: "¡Ajusta los filtros y haz clic en '¡Sorpréndeme!' para descubrir una película!", noMoviesFound: 'No se encontraron películas con los filtros actuales. ¡Prueba con otros!', cardYear: 'Año:', cardDuration: 'Duración:', cardRating: 'Nota TMDb:', cardDirector: 'Director:', cardGenres: 'Géneros:', cardAvailableOn: 'Disponible en (Suscripción):', cardAvailableToRent: 'Disponible para Alquilar/Comprar:', cardStreamingNotFound: 'No encontrado en streaming.', cardCast: 'Reparto Principal:', cardCastNotFound: 'Reparto no disponible.', cardMarkAsWatched: 'Ya la he visto', cardTrailer: 'Ver Tráiler', cardTrailerNotFound: 'Tráiler no disponible.', cardSimilarMovies: 'Películas Similares', footer: 'Datos de películas cortesía de', shareButton: 'Compartir', shareSuccess: '¡Enlace copiado!', clearAllFilters: 'Limpiar todos los filtros', details: "Details", actorBiography: "Biografía",
    actorKnownFor: "Conocido/a por" },
    en: { settings: "Settings", watchedMoviesTitle: "Watched Movies", unmark: "Unmark", noMoviesWatched: "You haven't marked any movies as watched yet.", installApp: "Install App", installInstructions: "To install, tap Share then 'Add to Home Screen'", title: 'Movie Randomizer', subtitle: "What should we watch tonight?", advancedFilters: 'Advanced Filters', clearFilters: 'Clear Filters', showFilters: 'More Filters', hideFilters: 'Hide Filters', applyFilters: 'Apply Filters', sortBy: 'Sort by:', sortOptions: [ { name: 'Popularity', id: 'popularity.desc' }, { name: 'Top Rated', id: 'vote_average.desc' }, { name: 'Release Date', id: 'primary_release_date.desc' } ], region: 'Country:', selectRegionPrompt: 'Please select your country to begin', platform: 'Platforms (Optional):', platformSearchPlaceholder: 'Search platform...', includeGenre: 'Include Genres:', excludeGenre: 'Exclude Genres:', decade: 'Decade:', allDecades: 'Any', minRating: 'Minimum Rating:', surpriseMe: 'Surprise Me!', goBack: 'Back', searching: 'Searching...', searchPlaceholder: 'Or search for a specific movie...', welcomeMessage: "Adjust the filters and click 'Surprise Me!' to discover a movie!", noMoviesFound: 'No movies found with the current filters. Try changing them!', cardYear: 'Year:', cardDuration: 'Duration:', cardRating: 'TMDb Rating:', cardDirector: 'Director:', cardGenres: 'Genres:', cardAvailableOn: 'Available on (Subscription):', cardAvailableToRent: 'Available for Rent or Buy:', cardStreamingNotFound: 'Not found on streaming.', cardCast: 'Main Cast:', cardCastNotFound: 'Cast not available.', cardMarkAsWatched: "Already Seen", cardTrailer: 'Watch Trailer', cardTrailerNotFound: 'Trailer not available.', cardSimilarMovies: 'Similar Movies', footer: 'Movie data courtesy of', shareButton: 'Share', shareSuccess: 'Link Copied!', clearAllFilters: 'Clear All Filters', details: "Details", actorBiography: "Biography", 
    actorKnownFor: "Known For"}
};

const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};

const InstallPwaInstructions = ({ t }) => {
    return (
        <div className="install-button-wrapper">
            <div className="bg-gray-800 text-white text-center text-sm p-3 rounded-lg shadow-lg flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{t.installInstructions}</span>
            </div>
        </div>
    );
}

const InstallPwaButton = ({ t, handleInstallClick }) => {
     return (
        <div className="install-button-wrapper">
             <button 
                onClick={handleInstallClick} 
                className="bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 transition-transform"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {t.installApp}
              </button>
        </div>
    );
}

const WatchedListModal = ({ isOpen, close, watchedMovies, unmarkMovie, t }) => {
    if (!isOpen) return null;

    const watchedArray = Object.entries(watchedMovies);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50 p-4 pt-16 sm:pt-24" onClick={close}>
            <div className="bg-[var(--color-card-bg)] rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-card-bg)] rounded-t-xl">
                    <h2 className="text-xl font-semibold text-[var(--color-accent-text)]">{t.watchedMoviesTitle}</h2>
                    <button onClick={close} className="text-[var(--color-text-secondary)] hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {watchedArray.length > 0 ? (
                        <ul className="space-y-3">
                            {watchedArray.sort(([, a], [, b]) => a.title.localeCompare(b.title)).map(([movieId, movieData]) => (
                                <li key={movieId} className="flex items-center justify-between gap-4 p-2 bg-[var(--color-bg)] rounded-lg">
                                    <img src={movieData.poster ? `${TMDB_THUMBNAIL_BASE_URL}${movieData.poster}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={`Poster for ${movieData.title}`} className="w-12 h-auto rounded-md" />
                                    <p className="flex-grow font-semibold break-words">{movieData.title}</p>
                                    <button onClick={() => unmarkMovie(movieId)} className="flex-shrink-0 px-3 py-1 text-sm bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-md transition-colors">{t.unmark}</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-[var(--color-text-secondary)] py-8">{t.noMoviesWatched}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
const ActorDetailModal = ({ actor, close, t, onMovieClick }) => {
    if (!actor) return null;

    const topMovies = actor.movie_credits?.cast
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={close}>
            <div className="bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col sm:flex-row border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button onClick={close} className="absolute top-3 right-3 text-white bg-gray-900 rounded-full p-1 hover:bg-gray-700 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {/* Left Column: Actor Image */}
                <div className="w-full sm:w-1/3 flex-shrink-0">
                    <img src={actor.profile_path ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}` : 'https://placehold.co/500x750/4A5568/FFFFFF?text=?'} alt={actor.name} className="w-full h-full object-cover sm:rounded-l-xl" />
                </div>

                {/* Right Column: Details */}
                <div className="w-full sm:w-2/3 p-4 sm:p-6 overflow-y-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3">{actor.name}</h2>
                    
                    {/* Biography Section */}
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.actorBiography}</h3>
                        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-h-48 overflow-y-auto">
                            {actor.biography || "No biography available."}
                        </p>
                    </div>

                    {/* Filmography Section */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                         <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-3">{t.actorKnownFor}</h3>
                         <div className="horizontal-scroll-container">
                            {topMovies?.map(movie => (
                                <button key={movie.id} onClick={() => onMovieClick(movie)} className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150">
                                    <div className="w-full aspect-[2/3] bg-[var(--color-border)] rounded-lg overflow-hidden">
                                         <img loading="lazy" src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=No+Poster'} alt={movie.title} className="w-full h-full object-cover"/>
                                    </div>
                                    <span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">{movie.title}</span>
                                </button> 
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsDropdown = ({ mode, setMode, accent, setAccent, language, setLanguage, t, openWatchedModal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 rounded-full bg-[var(--color-card-bg)] shadow border border-[var(--color-border)] hover:bg-[var(--color-border)]"
                aria-label="Settings"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] z-30">
                    <div className="p-4">
                        <h3 className="font-semibold mb-3">{t.settings}</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-8 gap-2 bg-[var(--color-bg)] p-1 rounded-full">{ACCENT_COLORS.map(colorOption => (<button key={colorOption.name} onClick={() => setAccent(colorOption)} className={`w-6 h-6 rounded-full transition-transform duration-150 ${accent.name === colorOption.name ? 'scale-125 ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-accent)]' : ''}`} style={{backgroundColor: colorOption.color}} title={colorOption.name}></button>))}</div>
                             <div className="flex items-center gap-2 bg-[var(--color-bg)] p-1 rounded-full">
                                <button onClick={() => setMode('light')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Light Mode">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Light
                                </button>
                                <button onClick={() => setMode('dark')} className={`w-full p-1.5 rounded-full flex justify-center items-center gap-2 ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`} title="Dark Mode">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> Dark
                                </button>
                            </div>
                            <div className="flex items-center bg-[var(--color-bg)] p-1 rounded-full"><button onClick={() => setLanguage('es')} className={`w-full lang-btn ${language === 'es' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>Español</button><button onClick={() => setLanguage('en')} className={`w-full lang-btn ${language === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}`}>English</button></div>
                            <div>
                                <button onClick={() => { setIsOpen(false); openWatchedModal(); }} className="w-full p-2 text-sm bg-[var(--color-bg)] hover:bg-[var(--color-border)] rounded-full font-semibold transition-colors">
                                    {t.watchedMoviesTitle}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const MovieCardContent = ({ movie, details, isFetching, t, userRegion }) => {
    const displayDetails = isFetching ? {} : details;
    return (
        <React.Fragment>
            <h2 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-2 sm:mb-3 break-words text-center sm:text-left">{movie.title}</h2>
            <p className="mt-1 sm:mt-2 text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed break-words text-center sm:text-left">{movie.synopsis}</p>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm text-left">
                 <div><strong className="text-[var(--color-accent-text)]">{t.cardYear}</strong> {movie.year}</div>
                {isFetching ? <div className="inline-flex items-center"><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong><div className="small-loader"></div></div> : displayDetails.duration && <div><strong className="text-[var(--color-accent-text)]">{t.cardDuration}</strong> {formatDuration(displayDetails.duration)}</div>}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardRating}</strong> {movie.imdbRating}/10 ⭐</div>
                {isFetching ? null : displayDetails.director?.name && <div><strong className="text-[var(--color-accent-text)]">{t.cardDirector}</strong> {displayDetails.director.name}</div>}
                <div><strong className="text-[var(--color-accent-text)]">{t.cardGenres}</strong> {movie.genres.join(', ')}</div>
                
                <div>
                    <strong className="text-[var(--color-accent-text)] block mb-1">{`${t.cardAvailableOn} ${userRegion}`}</strong>
                    {isFetching ? <div className="small-loader"></div> : displayDetails.providers?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                            {displayDetails.providers.map(p => ( 
                                <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Watch on ${p.provider_name}`}>
                                    <img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/> 
                                </a>
                            ))}
                        </div>
                    ) : <span className="text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</span>}
                </div>
                {isFetching ? null : displayDetails.rentalProviders?.length > 0 && (
                <div>
                    <strong className="text-[var(--color-accent-text)] block mb-1">{t.cardAvailableToRent}</strong>
                    <div className="flex flex-wrap gap-2 items-center">
                        {displayDetails.rentalProviders.map(p => (
                            <a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Rent or buy on ${p.provider_name}`}>
                                <img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/> 
                            </a>
                        ))}
                    </div>
                </div>)}

                <div>
                    <strong className="text-[var(--color-accent-text)] block mb-1">{t.cardCast}</strong>
                    {isFetching ? <div className="small-loader"></div> : displayDetails.cast?.length > 0 ? (
                    <div className="flex flex-wrap gap-x-2 sm:gap-x-4 gap-y-2">
                        {displayDetails.cast.map(actor => (
                        <div key={actor.id} className="flex flex-col items-center text-center w-16 sm:w-20">
                            <img loading="lazy" src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1"/>
                            <span className="text-xs text-[var(--color-text-secondary)] leading-tight">{actor.name}</span>
                        </div>
                        ))}
                    </div>
                    ) : <span className="text-xs text-[var(--color-text-secondary)]">{t.cardCastNotFound}</span>}
                </div>
            </div>
        </React.Fragment>
    );
};


const SkeletonMovieCard = () => {
    return (
        <div className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] animate-pulse">
            <div className="p-6">
                <div className="w-1/2 h-auto mx-auto aspect-[2/3] bg-gray-700 rounded-lg"></div>
            </div>
             <div className="p-6 space-y-4">
                <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="space-y-3 mt-4">
                    <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

const FilterModal = ({ isOpen, close, filters, handleGenreChange, handlePlatformChange, t, genresMap, platformOptions, platformSearchQuery, handlePlatformSearchChange }) => {
    if (!isOpen) return null;
    const filteredPlatforms = platformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase()));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={close}>
            <div className="bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[var(--color-border)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[var(--color-accent-text)]">{t.advancedFilters}</h2>
                    <button onClick={close} className="text-[var(--color-text-secondary)] hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto">
                    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.includeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`inc-modal-${id}`} className="flex items-center"><input id={`inc-modal-genre-${id}`} type="checkbox" checked={filters.genre.includes(id)} onChange={() => handleGenreChange(id, 'genre')} disabled={filters.excludeGenres.includes(id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)] disabled:opacity-50"/><label htmlFor={`inc-modal-genre-${id}`} className={`ml-3 text-base text-[var(--color-text-secondary)] ${filters.excludeGenres.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
                    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.excludeGenre}</label><div className="filter-checkbox-list space-y-2">{Object.entries(genresMap).sort(([,a],[,b]) => a.localeCompare(b)).map(([id, name]) => (<div key={`ex-modal-${id}`} className="flex items-center"><input id={`ex-modal-genre-${id}`} type="checkbox" checked={filters.excludeGenres.includes(id)} onChange={() => handleGenreChange(id, 'excludeGenres')} disabled={filters.genre.includes(id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-red-600 focus:ring-red-500 accent-red-600 disabled:opacity-50"/><label htmlFor={`ex-modal-genre-${id}`} className={`ml-3 text-base text-[var(--color-text-secondary)] ${filters.genre.includes(id) ? 'opacity-50' : ''}`}>{name}</label></div>))}</div></div>
                    <div><label className="block text-lg font-medium text-[var(--color-text-primary)] mb-3">{t.platform}</label><input type="text" value={platformSearchQuery} onChange={handlePlatformSearchChange} placeholder={t.platformSearchPlaceholder} className="w-full p-2 mb-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm" /><div className="filter-checkbox-list space-y-2">{platformOptions.length > 0 ? filteredPlatforms.map(p => (<div key={`modal-p-${p.id}`} className="flex items-center"><input id={`modal-platform-${p.id}`} type="checkbox" checked={filters.platform.includes(p.id)} onChange={() => handlePlatformChange(p.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"/><label htmlFor={`modal-platform-${p.id}`} className="ml-3 text-base text-[var(--color-text-secondary)]">{p.name}</label></div>)) : <p className="text-sm text-gray-400 col-span-2">No matching platforms.</p>}</div></div>
                </div>
                <div className="p-4 mt-auto border-t border-[var(--color-border)] text-right">
                    <button onClick={close} className="px-6 py-2 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg">{t.applyFilters}</button>
                </div>
            </div>
        </div>
    );
};


const App = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('movieRandomizerMode') || 'dark');
  const [accent, setAccent] = useState(() => {
    const savedAccent = localStorage.getItem('movieRandomizerAccent');
    try { return savedAccent ? JSON.parse(savedAccent) : ACCENT_COLORS[0]; } catch { return ACCENT_COLORS[0]; }
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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isWatchedModalOpen, setIsWatchedModalOpen] = useState(false);
  const initialFilters = { genre: [], excludeGenres: [], decade: 'todos', platform: [], sortBy: 'popularity.desc', minRating: 0 };
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('movieRandomizerFilters');
    if (savedFilters) { try { return { ...initialFilters, ...JSON.parse(savedFilters) }; } catch (e) { console.error("Failed to parse filters from localStorage", e); return initialFilters; } }
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
  const WATCHED_MOVIES_KEY = 'watchedUserMoviesRandomizer_TMDb_v9';
  const [watchedMovies, setWatchedMovies] = useState({});
  const [sessionShownMovies, setSessionShownMovies] = useState(new Set());
  const cardRef = useRef(null);
  const [selectedActor, setSelectedActor] = useState(null);
const [isFetchingActor, setIsFetchingActor] = useState(false);
  
  useEffect(() => {
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIos(isIosDevice);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);
  
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
  useEffect(() => {
    localStorage.setItem('movieRandomizerLang', language);
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (userRegion) { localStorage.setItem('movieRandomizerRegion', userRegion); }
  }, [userRegion]);
  useEffect(() => {
    localStorage.setItem('movieRandomizerFilters', JSON.stringify(filters));
  }, [filters]);
  useEffect(() => {
    const bootstrapApp = async () => {
        setIsLoading(true);
        setError(null);
        if (typeof TMDB_API_KEY === 'undefined' || !TMDB_API_KEY) { setError("API Key not found. Please check config.js."); setIsLoading(false); return; }
        try {
            const regionsResponse = await fetch(`${TMDB_BASE_URL}/configuration/countries?api_key=${TMDB_API_KEY}`);
            if (!regionsResponse.ok) throw new Error("Could not fetch TMDb regions");
            const regionsData = await regionsResponse.json();
            const curatedRegions = regionsData.filter(r => CURATED_COUNTRY_LIST.has(r.iso_3166_1)).sort((a, b) => a.english_name.localeCompare(b.english_name));
            setAvailableRegions(curatedRegions);
        } catch (err) { console.error("Error during app bootstrap:", err); setError(err.message); } finally { setIsLoading(false); }
    };
    bootstrapApp();
  }, []);
  useEffect(() => {
    const fetchLanguageData = async () => {
        if (!language) return;
        try {
            const langParam = language === 'es' ? 'es-ES' : 'en-US';
            const genresResponse = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${langParam}`);
            if (!genresResponse.ok) throw new Error(`Could not fetch genres (Lang: ${langParam})`);
            const genresData = await genresResponse.json();
            setGenresMap(genresData.genres.reduce((acc, genre) => ({ ...acc, [genre.id]: genre.name }), {}));
        } catch (err) { console.error("Error fetching language data:", err); }
    };
    fetchLanguageData();
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
        const unwatchedMovies = transformedMovies.filter(m => !(watchedMovies[m.id] && watchedMovies[m.id].expiry > now));
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
  
    const fetchFullMovieDetails = useCallback(async (movieId, lang) => {
        try {
            const mainDetailsUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits,videos,watch/providers`;
            const mainDetailsRes = await fetch(mainDetailsUrl);
            if (!mainDetailsRes.ok) throw new Error(`Details: ${mainDetailsRes.statusText}`);
            const data = await mainDetailsRes.json();
            
            let recommendations = [];
            const addedMovieIds = new Set([parseInt(movieId)]);
            const addMovies = (movies) => {
                for (const movie of movies) {
                    if (recommendations.length >= 20) break;
                    if (!addedMovieIds.has(movie.id)) {
                        recommendations.push(movie);
                        addedMovieIds.add(movie.id);
                    }
                }
            };
            if (data.belongs_to_collection) {
                const collectionRes = await fetch(`${TMDB_BASE_URL}/collection/${data.belongs_to_collection.id}?api_key=${TMDB_API_KEY}&language=${lang}`);
                if (collectionRes.ok) addMovies((await collectionRes.json()).parts.sort((a,b) => b.popularity - a.popularity));
            }
            const director = data.credits?.crew?.find(p => p.job === 'Director');
            if (director) {
                 const directorMoviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&with_crew=${director.id}&sort_by=popularity.desc`);
                 if(directorMoviesRes.ok) addMovies((await directorMoviesRes.json()).results);
            }
            const leadActors = data.credits?.cast?.slice(0, 2).map(actor => actor.id);
            if (leadActors?.length > 0) {
                const actorMoviesRes = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&with_cast=${leadActors.join('|')}&sort_by=popularity.desc`);
                if(actorMoviesRes.ok) addMovies((await actorMoviesRes.json()).results);
            }
            if (recommendations.length < 15) {
                const [similarRes, genreRes] = await Promise.all([
                    fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=${lang}`),
                    fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${lang}&with_genres=${data.genres.map(g => g.id).join(',')}&sort_by=popularity.desc`)
                ]);
                if(similarRes.ok) addMovies((await similarRes.json()).results);
                if(genreRes.ok) addMovies((await genreRes.json()).results);
            }
            const highQualitySimilar = recommendations
                .filter(m => m.poster_path && m.overview && m.vote_average > 6.0 && m.vote_count > 100)
                .slice(0, 10);
            const regionData = data['watch/providers']?.results?.[userRegion];
            const watchLink = regionData?.link || `https://www.themoviedb.org/movie/${movieId}/watch`;
            const providers = (regionData?.flatrate || []).map(p => ({ ...p, link: watchLink }));
            const rentProviders = (regionData?.rent || []).map(p => ({ ...p, link: watchLink }));
            const buyProviders = (regionData?.buy || []).map(p => ({ ...p, link: watchLink }));
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
                providers: providers, 
                rentalProviders: uniquePayProviders, 
                cast: data.credits?.cast?.slice(0, 5) || [], 
                director: director, 
                trailerKey: (data.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || [])[0]?.key || null,
                similar: highQualitySimilar
            };
        } catch (err) { 
            console.error("Error fetching all details for movie", movieId, err); 
            return null; 
        }
    }, [userRegion, language]);

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
    if (storedWatched) { try { const parsed = JSON.parse(storedWatched); const now = Date.now(); const validWatched = Object.fromEntries(Object.entries(parsed).filter(([_, movieData]) => movieData.expiry > now)); setWatchedMovies(validWatched); } catch (e) { console.error("Could not parse watched movies from localStorage", e); } }
  }, []);
  useEffect(() => {
    localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(watchedMovies));
  }, [watchedMovies]);
  
  const resetSearchState = () => { setAllMovies([]); setSelectedMovie(null); setHasSearched(false); setMovieHistory([]); setSessionShownMovies(new Set()); };
  const removeFilter = (type, value = null) => {
    setFilters(currentFilters => {
        const newFilters = { ...currentFilters };
        if (type === 'decade' || type === 'minRating') {
            newFilters[type] = initialFilters[type];
        } else if (type === 'genre' && value) {
            newFilters.genre = newFilters.genre.filter(id => id !== value);
        } else if (type === 'excludeGenres' && value) {
            newFilters.excludeGenres = newFilters.excludeGenres.filter(id => id !== value);
        } else if (type === 'platform' && value) {
            newFilters.platform = newFilters.platform.filter(id => id !== value);
        }
        return newFilters;
    });
    resetSearchState();
  };
  const handleFilterChange = (type, value) => { setFilters(f => ({ ...f, [type]: value })); resetSearchState(); };
  const handleGenreChange = (genreId, type) => { setFilters(f => { const currentType = f[type] || []; const otherType = type === 'genre' ? 'excludeGenres' : 'genre'; const currentOtherType = f[otherType] || []; const newCurrentList = [...currentType]; const index = newCurrentList.indexOf(genreId); const newOtherList = [...currentOtherType]; const otherIndex = newOtherList.indexOf(genreId); if (index > -1) { newCurrentList.splice(index, 1); } else { newCurrentList.push(genreId); if (otherIndex > -1) { newOtherList.splice(otherIndex, 1); } } return { ...f, [type]: newCurrentList, [otherType]: newOtherList }; }); resetSearchState(); };
  const handlePlatformChange = (id) => { setFilters(f => { const p = [...(f.platform || [])]; const i = p.indexOf(id); i > -1 ? p.splice(i, 1) : p.push(id); return { ...f, platform: p }; }); resetSearchState(); };
  const handleClearFilters = () => { setFilters(initialFilters); resetSearchState(); };
  const handleLanguageSelect = (lang) => { setLanguage(lang); };
  const handleRegionChange = (newRegion) => { setUserRegion(newRegion); };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); };
  const handleSearchResultClick = (movie) => { const formattedMovie = { id: movie.id.toString(), title: movie.title, synopsis: movie.overview, year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null, imdbRating: movie.vote_average.toFixed(1), genres: movie.genre_ids.map(id => genresMap[id]).filter(Boolean) || ["Desconocido"], poster: movie.poster_path, }; if (selectedMovie) setMovieHistory(prev => [...prev, selectedMovie]); setSelectedMovie(formattedMovie); setSearchQuery(''); setSearchResults([]); };
  const handleGoBack = () => { if (movieHistory.length === 0) return; const newHistory = [...movieHistory]; const previousMovie = newHistory.pop(); setMovieHistory(newHistory); setSelectedMovie(previousMovie); if(selectedMovie) setSessionShownMovies(prev => new Set(prev).add(selectedMovie.id)); };
  const handleMarkAsWatched = (movie) => {
    if (!movie || !movie.id) return;
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    const movieToStore = {
        title: movie.title,
        poster: movie.poster,
        expiry: Date.now() + threeMonths
    };
    setWatchedMovies(prev => ({...prev, [movie.id]: movieToStore }));
    setAllMovies(prev => prev.filter(m => m.id !== movie.id));
    handleSurpriseMe(); 
  };
  const handleUnmarkAsWatched = (movieId) => {
    setWatchedMovies(prev => {
        const newWatched = { ...prev };
        delete newWatched[movieId];
        return newWatched;
    });
  };
  const handleShare = useCallback(() => { if (!selectedMovie) return; const movieUrl = `https://www.themoviedb.org/movie/${selectedMovie.id}`; const shareData = { title: selectedMovie.title, text: `Check out this movie I found: ${selectedMovie.title}`, url: movieUrl }; if (navigator.share) { navigator.share(shareData).catch(err => console.error("Couldn't share", err)); } else { navigator.clipboard.writeText(movieUrl).then(() => { setShareStatus('success'); setTimeout(() => setShareStatus('idle'), 2000); }); } }, [selectedMovie]);
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
        setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };
  const handleSimilarMovieClick = async (movie) => { setIsFetchingModalDetails(true); setModalMovie(null); const langParam = language === 'es' ? 'es-ES' : 'en-US'; const details = await fetchFullMovieDetails(movie.id, langParam); setModalMovie(details); setIsFetchingModalDetails(false); };
  const handlePlatformSearchChange = (e) => { setPlatformSearchQuery(e.target.value); };
  const filteredPlatforms = useMemo(() => { return platformOptions.filter(p => p.name.toLowerCase().includes(platformSearchQuery.toLowerCase())); }, [platformOptions, platformSearchQuery]);
  const closeModal = () => setModalMovie(null);
  const openTrailerModal = () => setIsTrailerModalOpen(true);
  const closeTrailerModal = () => setIsTrailerModalOpen(false);
  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);
  const openWatchedModal = () => setIsWatchedModalOpen(true);
  const closeWatchedModal = () => setIsWatchedModalOpen(false);
  const fetchActorDetails = useCallback(async (actorId, lang) => {
    setIsFetchingActor(true);
    try {
        const personUrl = `${TMDB_BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=movie_credits`;
        const response = await fetch(personUrl);
        if (!response.ok) throw new Error("Could not fetch actor details.");
        const data = await response.json();
        setSelectedActor(data);
    } catch(err) {
        console.error("Error fetching actor details:", err);
        // You might want to set an error state here
    } finally {
        setIsFetchingActor(false);
    }
}, []);

const handleActorClick = (actorId) => {
    const langParam = language === 'es' ? 'es-ES' : 'en-US';
    fetchActorDetails(actorId, langParam);
};

const handleSimilarMovieFromActorClick = (movie) => {
    // This function reuses your existing logic to display a movie
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
    setSelectedActor(null); // Close the actor modal
    setSelectedMovie(formattedMovie);
};

const closeActorModal = () => setSelectedActor(null);

  if (isLoading) { return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="loader"></div></div> ); }
  if (error) { return ( <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-8 flex items-center justify-center"><div className="text-center"><h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1><p className="text-xl">{error}</p></div></div> ); }
  
  return (
    <div className="min-h-screen p-4 font-sans app-container relative">
        <div className="absolute top-4 right-4 z-20">
            <SettingsDropdown
                mode={mode} setMode={setMode}
                accent={accent} setAccent={setAccent}
                language={language} setLanguage={setLanguage}
                t={t}
                openWatchedModal={openWatchedModal}
            />
        </div>
      
        <header className="text-center mb-4 pt-16 sm:pt-16"><h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)]">{t.title}</h1><h2 className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mt-2">{t.subtitle}</h2><div className="max-w-xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-4"><div ref={searchRef} className="relative w-full sm:flex-grow"><input type="text" value={searchQuery} onChange={handleSearchChange} placeholder={t.searchPlaceholder} className="w-full p-3 pl-10 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-full focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)] shadow-sm"/><div className="absolute top-0 left-0 inline-flex items-center p-3">{isSearching ? <div className="small-loader !m-0 !w-5 !h-5"></div> : <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}</div>{searchResults.length > 0 && (<ul className="absolute w-full mt-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">{searchResults.map(movie => (<li key={movie.id} onClick={() => handleSearchResultClick(movie)} className="p-3 hover:bg-[var(--color-bg)] cursor-pointer flex items-center gap-4"><img loading="lazy" src={movie.poster_path ? `${TMDB_THUMBNAIL_BASE_URL}${movie.poster_path}` : 'https://placehold.co/92x138/4A5568/FFFFFF?text=?'} alt={movie.title} className="w-12 h-auto rounded-md" /><div className="text-left"><p className="font-semibold text-[var(--color-text-primary)]">{movie.title}</p><p className="text-sm text-[var(--color-text-secondary)]">{movie.release_date?.split('-')[0]}</p></div></li>))}</ul>)}</div></div></header>

        <div className="max-w-3xl mx-auto mb-8 p-4 bg-[var(--color-card-bg)] rounded-xl shadow-lg border border-[var(--color-border)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div><label htmlFor="decade-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.decade}</label><select id="decade-filter" value={filters.decade} onChange={e => handleFilterChange('decade', e.target.value)} className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"><option value="todos">{t.allDecades}</option>{[2020, 2010, 2000, 1990, 1980, 1970].map(d=>(<option key={d} value={d}>{`${d}s`}</option>))}</select></div>
                <div className="sm:col-span-1"><label htmlFor="rating-filter" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.minRating} {Number(filters.minRating).toFixed(1)}</label><input type="range" id="rating-filter" min="0" max="9.5" step="0.5" value={filters.minRating} onChange={e => handleFilterChange('minRating', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" /></div>
                <button 
                  onClick={openFilterModal} 
                  className="w-full sm:col-span-1 p-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    {t.showFilters}
                </button>
            </div>
        </div>
      
        <div className="text-center mb-10 flex justify-center items-center gap-4">
            <button onClick={handleGoBack} disabled={movieHistory.length === 0} className="p-4 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 font-bold rounded-lg shadow-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
            <button onClick={handleSurpriseMe} disabled={isDiscovering || !userRegion} title={!userRegion ? t.selectRegionPrompt : ''} className={`px-8 py-4 bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 text-xl disabled:opacity-50 disabled:cursor-not-allowed`}>{isDiscovering ? t.searching : t.surpriseMe}</button>
        </div>

        <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
            {filters.decade !== 'todos' && <div className="filter-pill"><span>{`${t.decade} ${filters.decade}s`}</span><button onClick={() => removeFilter('decade')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>}
            {filters.minRating > 0 && <div className="filter-pill"><span>{`${t.minRating} ${Number(filters.minRating).toFixed(1)}+`}</span><button onClick={() => removeFilter('minRating')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>}
            {filters.genre.map(id => <div key={`pill-g-${id}`} className="filter-pill"><span>{genresMap[id]}</span><button onClick={() => removeFilter('genre', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>)}
            {filters.excludeGenres.map(id => <div key={`pill-exg-${id}`} className="filter-pill !bg-red-600"><span>{`No ${genresMap[id]}`}</span><button onClick={() => removeFilter('excludeGenres', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>)}
            {filters.platform.map(id => <div key={`pill-p-${id}`} className="filter-pill"><span>{platformOptions.find(p=>p.id===id)?.name}</span><button onClick={() => removeFilter('platform', id)}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>)}
        </div>
      
        {isDiscovering ? <SkeletonMovieCard /> : selectedMovie ? ( 
            <div ref={cardRef} className="w-full max-w-4xl mx-auto bg-[var(--color-card-bg)] rounded-xl shadow-2xl overflow-hidden mb-10 border border-[var(--color-border)] movie-card-enter">
                <div className="sm:grid sm:grid-cols-3 sm:gap-x-8">
                    <div className="sm:col-span-1 p-4 sm:p-6">
                        <img loading="lazy" className="h-auto w-3/4 sm:w-full mx-auto object-cover rounded-lg shadow-lg" src={`${TMDB_IMAGE_BASE_URL}${selectedMovie.poster}`} alt={`Poster for ${selectedMovie.title}`}/>
                        {!isFetchingDetails && movieDetails.trailerKey && (
                            <div className="mt-4 flex justify-center">
                                <button onClick={openTrailerModal} className="w-full max-w-[300px] rounded-lg overflow-hidden relative group shadow-lg hover:shadow-2xl transition-shadow">
                                    <img loading="lazy" src={`https://img.youtube.com/vi/${movieDetails.trailerKey}/mqdefault.jpg`} alt="Trailer thumbnail" className="w-full" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="sm:col-span-2 p-4 sm:p-6 sm:pl-0">
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-3 break-words">{selectedMovie.title}</h2>
                            <p className="mt-2 text-[var(--color-text-secondary)] text-base leading-relaxed break-words">{selectedMovie.synopsis}</p>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                           <button onClick={() => handleMarkAsWatched(selectedMovie)} className="w-full py-3 px-4 bg-gray-600/60 hover:bg-gray-500/80 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                               {t.cardMarkAsWatched}
                           </button>
                           <button onClick={handleShare} className="w-full py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                {shareStatus === 'success' ? t.shareSuccess : t.shareButton}
                           </button>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                             <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{t.details}</h3>
                             <div className="space-y-2 text-sm">
                                <div><strong className="font-semibold">{t.cardYear}</strong> {selectedMovie.year}</div>
                                {isFetchingDetails ? <div className="small-loader"></div> : (movieDetails.duration && <div><strong className="font-semibold">{t.cardDuration}</strong> {formatDuration(movieDetails.duration)}</div>)}
                                <div><strong className="font-semibold">{t.cardRating}</strong> {selectedMovie.imdbRating}/10 ⭐</div>
                                {isFetchingDetails ? null : (movieDetails.director?.name && <div><strong className="font-semibold">{t.cardDirector}</strong> {movieDetails.director.name}</div>)}
                                <div><strong className="font-semibold">{t.cardGenres}</strong> {selectedMovie.genres.join(', ')}</div>
                             </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-2">{`${t.cardAvailableOn} ${userRegion}`}</h3>
                            {isFetchingDetails ? <div className="small-loader"></div> : movieDetails.providers?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 items-center">
                                    {movieDetails.providers.map(p => (<a key={p.provider_id} href={p.link} target="_blank" rel="noopener noreferrer" title={`Watch on ${p.provider_name}`}><img loading="lazy" src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="platform-logo"/></a>))}
                                </div>
                            ) : <p className="text-sm text-[var(--color-text-secondary)]">{t.cardStreamingNotFound}</p>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <h3 className="text-lg font-semibold text-[var(--color-accent-text)] mb-3">{t.cardCast}</h3>
                            {isFetchingDetails ? <div className="small-loader"></div> : movieDetails.cast?.length > 0 ? (
                              <div className="flex flex-wrap gap-4">
    {movieDetails.cast.map(actor => (
        <button key={actor.id} onClick={() => handleActorClick(actor.id)} className="flex flex-col items-center text-center w-20 hover:scale-105 transition-transform duration-150">
            <img loading="lazy" src={actor.profile_path ? `${TMDB_PROFILE_IMAGE_BASE_URL}${actor.profile_path}`:'https://placehold.co/185x278/777/FFF?text=?'} alt={actor.name} className="actor-thumbnail mb-1 rounded-md shadow-lg"/>
            <span className="text-xs text-[var(--color-text-secondary)] leading-tight">{actor.name}</span>
        </button>
    ))}
</div>
                            ) : <p className="text-sm text-[var(--color-text-secondary)]">{t.cardCastNotFound}</p>}
                        </div>
                    </div>
                </div>
                
                <div className="p-4 sm:p-6 bg-[var(--color-bg)]/50 border-t border-[var(--color-border)]">
                    <h3 className="text-xl font-semibold text-[var(--color-accent-text)] mb-3">{t.cardSimilarMovies}</h3>
                    {isFetchingDetails ? <div className="flex justify-center"><div className="small-loader"></div></div> :  movieDetails.similar?.length > 0 ? ( 
                        <div className="horizontal-scroll-container">
                            {movieDetails.similar.map(movie => ( 
                                <button 
                                    key={movie.id} 
                                    onClick={() => handleSimilarMovieClick(movie)} 
                                    className="flex-shrink-0 w-32 text-center group hover:scale-105 transition-transform duration-150"
                                >
                                    <div className="w-full aspect-[2/3] bg-[var(--color-border)] rounded-lg overflow-hidden">
                                         <img 
                                             loading="lazy" 
                                             src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://placehold.co/200x300/4A5568/FFFFFF?text=No+Poster'} 
                                             alt={movie.title} 
                                             className="w-full h-full object-cover"
                                         />
                                    </div>
                                    <span className="block w-full text-xs text-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-text)] transition-colors pt-2 truncate">
                                        {movie.title}
                                    </span>
                                </button> 
                            ))}
                        </div> 
                    ) : <p className="text-sm text-[var(--color-text-secondary)] text-sm">{t.noMoviesFound}</p>}
                </div>
            </div> 
        ) : ( 
            <div className="text-center text-gray-400 mt-10 text-lg">
                {hasSearched && allMovies.length === 0 && !isDiscovering 
                    ? (<div><p>{t.noMoviesFound}</p><button onClick={handleClearFilters} className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg">{t.clearAllFilters}</button></div>) 
                    : !hasSearched && t.welcomeMessage
                }
            </div>
        )}
        
        <FilterModal isOpen={isFilterModalOpen} close={closeFilterModal} filters={filters} handleGenreChange={handleGenreChange} handlePlatformChange={handlePlatformChange} t={t} genresMap={genresMap} platformOptions={platformOptions} platformSearchQuery={platformSearchQuery} handlePlatformSearchChange={handlePlatformSearchChange} />
        
        <WatchedListModal 
            isOpen={isWatchedModalOpen} 
            close={closeWatchedModal} 
            watchedMovies={watchedMovies} 
            unmarkMovie={handleUnmarkAsWatched} 
            t={t}
        />
        <ActorDetailModal 
    actor={selectedActor} 
    close={closeActorModal}
    onMovieClick={handleSimilarMovieFromActorClick}
    t={t}
/>
        
        {modalMovie && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={closeModal}>
                <div className="bg-[var(--color-card-bg)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={closeModal} className="absolute top-3 right-3 text-white bg-gray-900 rounded-full p-1 hover:bg-gray-700 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    {isFetchingModalDetails ? <div className="h-96 flex items-center justify-center"><div className="loader"></div></div> : (
                        <div className="p-4 sm:p-8">
                             <MovieCardContent
                                movie={{
                                    title: modalMovie.title,
                                    synopsis: modalMovie.overview,
                                    year: modalMovie.release_date?.split('-')[0],
                                    imdbRating: modalMovie.vote_average?.toFixed(1),
                                    genres: modalMovie.genres?.map(g => g.name) || [],
                                }}
                                details={modalMovie}
                                isFetching={false}
                                t={t}
                                userRegion={userRegion}
                            />
                        </div>
                    )}
                </div>
            </div>
        )}
        {isTrailerModalOpen && movieDetails.trailerKey && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={closeTrailerModal}>
                <div className="bg-[var(--color-card-bg)] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden relative" onClick={e => e.stopPropagation()}>
                    <button onClick={closeTrailerModal} className="absolute top-2 right-2 bg-gray-700 text-white rounded-full p-2 hover:bg-gray-600 z-10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="aspect-video w-full">
                        <iframe
                            width="100%"
                            height="400"
                            src={`https://www.youtube.com/embed/${movieDetails.trailerKey}?autoplay=1`}
                            title="YouTube trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>
        )}
        {!userRegion && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-40 flex items-center justify-center p-4">
              <div className="text-center max-w-md bg-[var(--color-card-bg)] p-8 rounded-xl shadow-2xl">
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-gradient-from)] to-[var(--color-accent-gradient-to)] mb-4">{t.selectRegionPrompt}</h1>
                  {availableRegions.length > 0 ? (
                    <select id="initial-region-filter" onChange={e => handleRegionChange(e.target.value)} defaultValue="" className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] text-[var(--color-text-primary)]">
                        <option value="" disabled>-- {t.region} --</option>
                        {availableRegions.map(region => (<option key={region.iso_3166_1} value={region.iso_3166_1}>{region.english_name}</option>))}
                    </select>
                  ) : (
                    <div className="loader"></div>
                  )}
              </div>
            </div>
        )}
        
      <footer className="text-center mt-auto py-4 text-sm text-[var(--color-text-subtle)]">
            {showInstallBanner && installPrompt && !isIos && <InstallPwaButton t={t} handleInstallClick={handleInstallClick} />}
            {showInstallBanner && isIos && <InstallPwaInstructions t={t} />}
            <p className="pt-4">{t.footer} <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-text)] hover:underline">TMDb</a>.</p>
      </footer>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));