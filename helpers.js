// helpers.js

function formatDuration(totalMinutes) {
    if (!totalMinutes || totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
}

function normalizeMediaData(media, mediaType, genresMap) {
    if (!media || !media.id) return null;
    const type = (media.media_type || mediaType);
    const isMovie = type === 'movie';
    const releaseDate = isMovie ? media.release_date : media.first_air_date;
    return {
        id: media.id.toString(),
        title: isMovie ? media.title : media.name,
        synopsis: media.overview,
        year: releaseDate ? parseInt(releaseDate.split('-')[0]) : null,
        imdbRating: media.vote_average?.toFixed(1) || 'N/A',
        genres: media.genre_ids?.map(id => genresMap[id]).filter(Boolean) || [],
        poster: media.poster_path,
        mediaType: type
    };
}