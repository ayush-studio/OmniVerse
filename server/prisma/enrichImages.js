import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'OmniVerseImageBot/1.0 (educational; contact@omniverse.local)',
      ...headers,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function cleanTitle(title) {
  return String(title || '')
    .replace(/\s*\((TV|Anime|Manga|PS4|PS5|2019|2017|1994)\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fromWikipedia(title) {
  const candidates = [
    title,
    cleanTitle(title),
    `${cleanTitle(title)} (film)`,
    `${cleanTitle(title)} (video game)`,
    `${cleanTitle(title)} (novel)`,
    `${cleanTitle(title)} (TV series)`,
    `${cleanTitle(title)} (manga)`,
    `${cleanTitle(title)} (album)`,
  ];

  for (const q of candidates) {
    try {
      const data = await fetchJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
      );
      if (!data || data.type === 'disambiguation') continue;
      const src = data.originalimage?.source || data.thumbnail?.source;
      if (src) {
        return {
          cover: src.replace(/\/\d+px-/, '/600px-'),
          banner: src.replace(/\/\d+px-/, '/1200px-'),
        };
      }
    } catch {
      // continue
    }
  }
  return null;
}

async function fromItunes(title, entity) {
  try {
    const data = await fetchJson(
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle(title))}&entity=${entity}&limit=8`
    );
    const results = data?.results || [];
    const needle = cleanTitle(title).toLowerCase();
    const filtered = results.filter((r) => {
      if (entity === 'movie' && r.kind && r.kind !== 'feature-movie') return false;
      if (entity === 'album' && r.collectionType && r.collectionType !== 'Album') return false;
      return Boolean(r.artworkUrl100);
    });
    const hit =
      filtered.find((r) => {
        const name = String(r.trackName || r.collectionName || '').toLowerCase();
        return name === needle || name.startsWith(needle) || needle.startsWith(name);
      }) || filtered[0];
    if (!hit?.artworkUrl100) return null;
    const cover = hit.artworkUrl100.replace('100x100bb', '600x600bb');
    return { cover, banner: cover };
  } catch {
    return null;
  }
}

async function fromOpenLibrary(title) {
  try {
    const data = await fetchJson(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle(title))}&limit=1`
    );
    const doc = data?.docs?.[0];
    if (!doc) return null;
    let cover = null;
    if (doc.cover_i) {
      cover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    } else if (doc.isbn?.[0]) {
      cover = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
    }
    if (!cover) return null;
    return { cover, banner: cover };
  } catch {
    return null;
  }
}

async function fromJikan(title, kind) {
  try {
    await sleep(400); // be polite to Jikan rate limits
    const endpoint = kind === 'manga' ? 'manga' : 'anime';
    const data = await fetchJson(
      `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(cleanTitle(title))}&limit=1`
    );
    const hit = data?.data?.[0];
    const cover = hit?.images?.jpg?.large_image_url || hit?.images?.jpg?.image_url;
    if (!cover) return null;
    return { cover, banner: cover };
  } catch {
    return null;
  }
}

async function fromTmdb(title, mediaType = 'movie') {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  try {
    const data = await fetchJson(
      `https://api.themoviedb.org/3/search/${mediaType}?api_key=${key}&query=${encodeURIComponent(cleanTitle(title))}`
    );
    const hit = data?.results?.[0];
    if (!hit?.poster_path) return null;
    return {
      cover: `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
      banner: hit.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}`
        : `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
    };
  } catch {
    return null;
  }
}

async function resolveImages(item) {
  const t = item.type;
  let images = null;

  if (t === 'BOOK') {
    images = (await fromOpenLibrary(item.title)) || (await fromWikipedia(item.title));
  } else if (t === 'MANGA') {
    images = (await fromJikan(item.title, 'manga')) || (await fromWikipedia(item.title));
  } else if (t === 'SERIES') {
    const isAnime = item.language === 'Japanese' || /anime/i.test(item.genreTags || '');
    images = isAnime
      ? (await fromJikan(item.title, 'anime')) || (await fromWikipedia(item.title))
      : (await fromTmdb(item.title, 'tv')) ||
        (await fromWikipedia(`${cleanTitle(item.title)} (TV series)`)) ||
        (await fromWikipedia(item.title)) ||
        (await fromItunes(item.title, 'tvSeason'));
  } else if (t === 'MUSIC_ALBUM') {
    images = (await fromItunes(item.title, 'album')) || (await fromWikipedia(item.title));
  } else if (t === 'GAME') {
    images =
      (await fromWikipedia(`${cleanTitle(item.title)} (video game)`)) ||
      (await fromWikipedia(item.title));
  } else {
    // MOVIE — TMDB (optional key) → iTunes → film Wikipedia
    images =
      (await fromTmdb(item.title, 'movie')) ||
      (await fromItunes(item.title, 'movie')) ||
      (await fromWikipedia(`${cleanTitle(item.title)} (film)`)) ||
      (await fromWikipedia(item.title));
  }

  if (!images) {
    const text = encodeURIComponent(item.title.slice(0, 24));
    images = {
      cover: `https://placehold.co/400x600/111827/14b8a6/png?text=${text}`,
      banner: `https://placehold.co/1400x500/0f172a/38bdf8/png?text=${text}`,
    };
  }

  return images;
}

async function main() {
  const typeFilter = process.argv[2]?.toUpperCase();
  const items = await prisma.mediaItem.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    select: { id: true, title: true, type: true, language: true, genreTags: true },
    orderBy: { title: 'asc' },
  });

  console.log(`Enriching images for ${items.length} titles${typeFilter ? ` (${typeFilter})` : ''}…`);
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    process.stdout.write(`\r[${i + 1}/${items.length}] ${item.title.slice(0, 40).padEnd(40)}`);
    try {
      const images = await resolveImages(item);
      await prisma.mediaItem.update({
        where: { id: item.id },
        data: {
          coverImageUrl: images.cover,
          bannerImageUrl: images.banner,
        },
      });
      updated += 1;
    } catch (err) {
      failed += 1;
      console.error(`\nFailed: ${item.title}`, err.message);
    }
    await sleep(120);
  }

  console.log(`\nDone. Updated ${updated}, failed ${failed}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
