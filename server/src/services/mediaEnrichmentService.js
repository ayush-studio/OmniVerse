import { prisma } from '../config/db.js';
import { parseJson } from '../utils/helpers.js';

// In-memory cache for fast lookups
const enrichmentCache = new Map();

function cleanTitle(title) {
  return String(title || '')
    .replace(/\s*\((TV|Anime|Manga|PS4|PS5|2019|2017|1994)\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve YouTube Video ID for trailers without requiring an API key.
 * Uses lightweight search page scraping with timeout and fallbacks.
 */
async function resolveYouTubeVideoId(query) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const text = await res.text();
    // Match watch?v=... with valid 11 char YouTube ID
    const match = text.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Fetch iTunes track previews for music albums (free, no auth needed).
 */
async function fetchItunesTracks(title) {
  try {
    const cleaned = cleanTitle(title);
    const searchRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleaned)}&entity=album&limit=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const album = searchData.results?.[0];
    if (!album?.collectionId) return null;

    const lookupRes = await fetch(
      `https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song&limit=8`,
      { headers: { Accept: 'application/json' } }
    );
    if (!lookupRes.ok) return null;
    const lookupData = await lookupRes.json();

    const songs = lookupData.results
      .filter((r) => r.wrapperType === 'track' && r.previewUrl)
      .slice(0, 6)
      .map((s, idx) => ({
        id: s.trackId || idx + 1,
        trackNumber: s.trackNumber || idx + 1,
        title: s.trackName,
        artist: s.artistName,
        previewUrl: s.previewUrl,
        durationSeconds: 30,
        trackViewUrl: s.trackViewUrl,
      }));

    return {
      artistName: album.artistName,
      collectionName: album.collectionName,
      collectionViewUrl: album.collectionViewUrl,
      tracks: songs,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch TMDB Watch Providers & Trailer if TMDB_API_KEY is configured
 */
async function fetchTmdbEnrichment(title, type) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  try {
    const endpoint = type === 'SERIES' ? 'tv' : 'movie';
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/${endpoint}?api_key=${key}&query=${encodeURIComponent(cleanTitle(title))}`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hit = searchData.results?.[0];
    if (!hit?.id) return null;

    const [providersRes, videosRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${endpoint}/${hit.id}/watch/providers?api_key=${key}`).catch(() => null),
      fetch(`https://api.themoviedb.org/3/${endpoint}/${hit.id}/videos?api_key=${key}`).catch(() => null),
    ]);

    let providers = [];
    if (providersRes && providersRes.ok) {
      const pData = await providersRes.json();
      const us = pData.results?.US || pData.results?.GB || Object.values(pData.results || {})[0];
      if (us) {
        if (us.flatrate) {
          providers.push(
            ...us.flatrate.map((p) => ({
              name: p.provider_name,
              type: 'stream',
              logoUrl: `https://image.tmdb.org/t/p/original${p.logo_path}`,
              url: us.link || `https://www.google.com/search?q=${encodeURIComponent(title + ' on ' + p.provider_name)}`,
            }))
          );
        }
        if (us.buy || us.rent) {
          const buyRent = (us.buy || us.rent || []).slice(0, 3);
          providers.push(
            ...buyRent.map((p) => ({
              name: p.provider_name,
              type: 'rent_buy',
              logoUrl: `https://image.tmdb.org/t/p/original${p.logo_path}`,
              url: us.link || `https://www.google.com/search?q=${encodeURIComponent(title + ' rent on ' + p.provider_name)}`,
            }))
          );
        }
      }
    }

    let youtubeKey = null;
    if (videosRes && videosRes.ok) {
      const vData = await videosRes.json();
      const trailer =
        vData.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
        vData.results?.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
        vData.results?.find((v) => v.site === 'YouTube');
      if (trailer?.key) {
        youtubeKey = trailer.key;
      }
    }

    return { providers, youtubeKey };
  } catch {
    return null;
  }
}

/**
 * Generate standard direct platform providers for any media item
 */
function getDefaultProviders(item) {
  const enc = encodeURIComponent(item.title);
  const t = item.type;

  if (t === 'MOVIE' || t === 'SERIES') {
    const isAnime = item.language === 'Japanese' || /anime/i.test(item.genreTags || '');
    const list = [
      {
        id: 'netflix',
        name: 'Netflix',
        type: 'stream',
        badge: 'Subscription',
        color: '#E50914',
        url: `https://www.netflix.com/search?q=${enc}`,
      },
      {
        id: 'prime',
        name: 'Prime Video',
        type: 'stream',
        badge: 'Stream / Rent',
        color: '#00A8E1',
        url: `https://www.amazon.com/s?k=${enc}&i=instant-video`,
      },
      {
        id: 'disney',
        name: 'Disney+',
        type: 'stream',
        badge: 'Subscription',
        color: '#113CCF',
        url: `https://www.disneyplus.com/search?q=${enc}`,
      },
      {
        id: 'apple_tv',
        name: 'Apple TV',
        type: 'rent_buy',
        badge: 'Rent / Buy',
        color: '#A2AAAD',
        url: `https://tv.apple.com/search?term=${enc}`,
      },
    ];

    if (isAnime) {
      list.unshift({
        id: 'crunchyroll',
        name: 'Crunchyroll',
        type: 'stream',
        badge: 'Anime Stream',
        color: '#F47521',
        url: `https://www.crunchyroll.com/search?q=${enc}`,
      });
    } else {
      list.push({
        id: 'max',
        name: 'Max (HBO)',
        type: 'stream',
        badge: 'Subscription',
        color: '#002BE7',
        url: `https://play.max.com/search?q=${enc}`,
      });
    }
    return list;
  }

  if (t === 'GAME') {
    return [
      {
        id: 'steam',
        name: 'Steam',
        type: 'store',
        badge: 'PC Store',
        color: '#171A21',
        url: `https://store.steampowered.com/search/?term=${enc}`,
      },
      {
        id: 'epic',
        name: 'Epic Games',
        type: 'store',
        badge: 'PC Store',
        color: '#313131',
        url: `https://store.epicgames.com/en-US/browse?q=${enc}`,
      },
      {
        id: 'playstation',
        name: 'PlayStation Store',
        type: 'store',
        badge: 'PS4 / PS5',
        color: '#003791',
        url: `https://store.playstation.com/en-us/search/${enc}`,
      },
      {
        id: 'xbox',
        name: 'Xbox Store',
        type: 'store',
        badge: 'Xbox / Game Pass',
        color: '#107C10',
        url: `https://www.xbox.com/en-us/search?q=${enc}`,
      },
      {
        id: 'gog',
        name: 'GOG.com',
        type: 'store',
        badge: 'DRM-Free PC',
        color: '#86328A',
        url: `https://www.gog.com/en/games?query=${enc}`,
      },
    ];
  }

  if (t === 'MUSIC_ALBUM') {
    return [
      {
        id: 'spotify',
        name: 'Spotify',
        type: 'listen',
        badge: 'Stream Album',
        color: '#1DB954',
        url: `https://open.spotify.com/search/${enc}`,
      },
      {
        id: 'apple_music',
        name: 'Apple Music',
        type: 'listen',
        badge: 'Lossless Audio',
        color: '#FA243C',
        url: `https://music.apple.com/search?term=${enc}`,
      },
      {
        id: 'youtube_music',
        name: 'YouTube Music',
        type: 'listen',
        badge: 'Free / Premium',
        color: '#FF0000',
        url: `https://music.youtube.com/search?q=${enc}`,
      },
    ];
  }

  if (t === 'BOOK' || t === 'MANGA') {
    const list = [
      {
        id: 'open_library',
        name: 'Open Library',
        type: 'read',
        badge: 'Borrow / Read Free',
        color: '#3388CC',
        url: `https://openlibrary.org/search?q=${enc}`,
      },
      {
        id: 'google_books',
        name: 'Google Books',
        type: 'read',
        badge: 'Preview & Buy',
        color: '#4285F4',
        url: `https://www.google.com/search?tbm=bks&q=${enc}`,
      },
      {
        id: 'kindle',
        name: 'Amazon Kindle',
        type: 'read',
        badge: 'E-Book / Paperback',
        color: '#FF9900',
        url: `https://www.amazon.com/s?k=${enc}+kindle`,
      },
      {
        id: 'goodreads',
        name: 'Goodreads',
        type: 'community',
        badge: 'Book Reviews',
        color: '#7B5128',
        url: `https://www.goodreads.com/search?q=${enc}`,
      },
    ];

    if (t === 'MANGA') {
      list.unshift({
        id: 'mangadex',
        name: 'MangaDex',
        type: 'read',
        badge: 'Online Reader',
        color: '#FF6740',
        url: `https://mangadex.org/search?q=${enc}`,
      });
    }

    return list;
  }

  return [];
}

/**
 * Main function to retrieve enrichment data for a media item
 */
export async function getMediaEnrichmentData(mediaItem) {
  if (!mediaItem) return null;

  // Check memory cache first
  if (enrichmentCache.has(mediaItem.id)) {
    return enrichmentCache.get(mediaItem.id);
  }

  const existingMeta = parseJson(mediaItem.metadata, {});
  const t = mediaItem.type;

  let youtubeKey = existingMeta.trailerKey || null;
  let audioData = null;
  let providers = getDefaultProviders(mediaItem);

  // 1. Try TMDB if configured (for Movie/Series)
  if (t === 'MOVIE' || t === 'SERIES') {
    const tmdbData = await fetchTmdbEnrichment(mediaItem.title, t);
    if (tmdbData?.youtubeKey && !youtubeKey) {
      youtubeKey = tmdbData.youtubeKey;
    }
    if (tmdbData?.providers && tmdbData.providers.length > 0) {
      // Merge with default providers
      providers = [...tmdbData.providers, ...providers];
    }
  }

  // 2. Resolve YouTube Trailer ID if still missing (for Movies, Games, Series)
  if (!youtubeKey && (t === 'MOVIE' || t === 'SERIES' || t === 'GAME')) {
    const searchQuery =
      t === 'GAME'
        ? `${mediaItem.title} official gameplay trailer`
        : `${mediaItem.title} ${mediaItem.releaseYear || ''} official trailer`;
    youtubeKey = await resolveYouTubeVideoId(searchQuery);
  }

  // 3. For Music Albums: Fetch audio sample previews via iTunes
  if (t === 'MUSIC_ALBUM') {
    audioData = await fetchItunesTracks(mediaItem.title);
  }

  const result = {
    mediaId: mediaItem.id,
    type: mediaItem.type,
    trailer: {
      hasTrailer: Boolean(youtubeKey),
      youtubeKey: youtubeKey,
      embedUrl: youtubeKey ? `https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0` : null,
      watchUrl: youtubeKey
        ? `https://www.youtube.com/watch?v=${youtubeKey}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaItem.title + ' trailer')}`,
    },
    providers,
    audioPreview: audioData,
  };

  // Cache in memory for 1 hour
  enrichmentCache.set(mediaItem.id, result);

  // Optionally persist trailerKey back into mediaItem metadata if it was newly found
  if (youtubeKey && !existingMeta.trailerKey) {
    try {
      const updatedMeta = { ...existingMeta, trailerKey: youtubeKey };
      await prisma.mediaItem.update({
        where: { id: mediaItem.id },
        data: { metadata: JSON.stringify(updatedMeta) },
      });
    } catch {
      // silent background update
    }
  }

  return result;
}
