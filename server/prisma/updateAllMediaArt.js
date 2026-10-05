import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Curated high-res official art for console-exclusive games not on Steam or needing exact covers
const EXCLUSIVE_GAME_ART = {
  'God of War Ragnarök': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/AQ0BpftEt0K3kGz8f6tG8sZk.jpg',
  },
  'The Last of Us': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eEczyEMdd2BLa3dtkGJILviu.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/K9F96LhA6F3fF7096d2Z3o8o.jpg',
  },
  'The Last of Us Part II': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202311/1717/3bfbb2e391456a00a12001a1c97acb8dbe8ce4ff4ad8ea0d.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202311/1717/cd5c9bcf2e2055655aa3d56cefbcc7e87ce6d8a3ba5b5502.jpg',
  },
  'Bloodborne': {
    cover: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2614/Sy5Ff4r9gP7bLhTz4q7gL1L6.png',
    banner: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2614/3fQ7bLhTz4q7gL1L6Sy5Ff4r.jpg',
  },
  'The Legend of Zelda: Breath of the Wild': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero',
  },
  'The Legend of Zelda: Tears of the Kingdom': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero',
  },
  'Super Mario Odyssey': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/s/super-mario-odyssey-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/s/super-mario-odyssey-switch/hero',
  },
  'Mario Kart 8 Deluxe': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/m/mario-kart-8-deluxe-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/m/mario-kart-8-deluxe-switch/hero',
  },
  'Animal Crossing: New Horizons': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/a/animal-crossing-new-horizons-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/a/animal-crossing-new-horizons-switch/hero',
  },
  'Pokémon Scarlet': {
    cover: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_pad,dpr_2.0,f_auto,q_auto,w_800/b_rgb:ffffff/v1/ncom/en_US/games/switch/p/pokemon-scarlet-switch/hero',
    banner: 'https://assets.nintendo.com/image/upload/c_fill,f_auto,q_auto,w_1200/v1/ncom/en_US/games/switch/p/pokemon-scarlet-switch/hero',
  },
  'Astro Bot': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/b545f1b6ee2b3dc92a01ceca2a9c3ce38d01917f694e9f3b.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202405/2908/42b918f6d63fbda5ee3962534f3661ebfdcb405b0d057a62.jpg',
  },
  'Marvel\'s Spider-Man 2': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/1c7b75d8b4343b1708492b32549d07f6629d02100db50b73.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/6a802f0612140bbda6b42b109e4d6a6a24128f7312eeea4f.jpg',
  },
  'Genshin Impact': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202408/0708/4ff477d9c185f403dfb7b137f769c8942b03f0b2f8a4df43.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202408/0708/034b07f2df27f8a719d363b9ef7753a86ebf4c5e317d7b05.jpg',
  },
  'Minecraft': {
    cover: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2618/Y02ljdBodKFBiziorYWevftf.png',
    banner: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2618/u02ljdBodKFBiziorYWevftf.jpg',
  },
  'Fortnite': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202405/2112/ff214ef5e791e8eaecfdbd783d5a28723cfa06ba87214777.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202405/2112/4885871fe25ebbc38fc9e09d850a4980bb6be3d0012720b0.jpg',
  },
  'Valorant': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202406/0517/a444dff3dbcd5c678a16823ca839ce6b9f29881fcfeaa2ec.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202406/0517/3db3e6189ef949bb396825c0d6438a2e51fccefb4581f125.jpg',
  },
  'World of Warcraft': {
    cover: 'https://upload.wikimedia.org/wikipedia/en/6/65/World_of_Warcraft.png',
    banner: 'https://upload.wikimedia.org/wikipedia/en/6/65/World_of_Warcraft.png',
  },
  'EA Sports FC 24': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202307/1110/374c44bc306c14b7e19195d85ddf4d6d628dd540306bf79e.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202307/1110/374c44bc306c14b7e19195d85ddf4d6d628dd540306bf79e.png',
  },
  'Rocket League': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202009/1601/r3rI5k5yQeU9yL67u2O34tY4.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202009/1601/r3rI5k5yQeU9yL67u2O34tY4.png',
  },
  'Uncharted 4: A Thief\'s End': {
    cover: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2012/yvF4QvWkW0f81d1h6O1Y1C8b.png',
    banner: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2012/yvF4QvWkW0f81d1h6O1Y1C8b.png',
  },
};

// 1. GAME ART (Steam Store API)
async function fetchGameArt(title) {
  if (EXCLUSIVE_GAME_ART[title]) {
    return EXCLUSIVE_GAME_ART[title];
  }

  // Steam clean title search
  const cleanTitle = title
    .replace(/Remake$/i, '')
    .replace(/:\s*New Horizons/i, '')
    .trim();

  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanTitle)}&l=english&cc=US`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const data = await res.json();
      const hit = data.items?.[0];
      if (hit && hit.id) {
        const appId = hit.id;
        return {
          cover: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`,
          banner: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`,
        };
      }
    }
  } catch (err) {
    // continue
  }

  // Fallback to Wikipedia for game
  return fetchWikiImage(`${title} (video game)`) || fetchWikiImage(title);
}

// 2. TV SERIES ART (TVMaze API)
async function fetchSeriesArt(title) {
  const cleanTitle = title.replace(/\s*\((TV|Anime)\)\s*/gi, '').trim();
  try {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanTitle)}`);
    if (res.ok) {
      const data = await res.json();
      const original = data.image?.original || data.image?.medium;
      if (original) {
        return {
          cover: original,
          banner: original,
        };
      }
    }
  } catch (err) {
    // continue
  }

  // iTunes fallback for TV
  const itunesArt = await fetchItunesArt(cleanTitle, 'tvSeason');
  if (itunesArt) return itunesArt;

  // Wikipedia fallback
  return fetchWikiImage(`${cleanTitle} (TV series)`);
}

// 3. MOVIE ART (Wikipedia Opensearch + Summary API)
async function fetchMovieArt(title) {
  const cleanTitle = title.replace(/\s*\((film|movie)\)\s*/gi, '').trim();

  // Try Wiki Opensearch
  const wikiArt = await fetchWikiImage(`${cleanTitle} film`);
  if (wikiArt) return wikiArt;

  const directWiki = await fetchWikiImage(cleanTitle);
  if (directWiki) return directWiki;

  // Try iTunes Movie search
  return fetchItunesArt(cleanTitle, 'movie');
}

// 4. MUSIC ALBUM ART (iTunes API)
async function fetchMusicAlbumArt(title, artist = '') {
  const query = artist ? `${title} ${artist}` : title;
  const itunes = await fetchItunesArt(query, 'album');
  if (itunes) return itunes;

  return fetchWikiImage(`${title} (album)`);
}

// 5. MANGA ART (Jikan MAL API + Wikipedia fallback)
async function fetchMangaArt(title) {
  const cleanTitle = title.replace(/\s*\((manga|anime)\)\s*/gi, '').trim();
  try {
    await sleep(400); // respect MAL rate limit
    const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(cleanTitle)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      const hit = data.data?.[0];
      const img = hit?.images?.jpg?.large_image_url || hit?.images?.jpg?.image_url;
      if (img) {
        return { cover: img, banner: img };
      }
    }
  } catch (e) {
    // continue
  }
  const wikiArt = await fetchWikiImage(`${cleanTitle} manga`);
  if (wikiArt) return wikiArt;
  return fetchWikiImage(cleanTitle);
}

// 6. BOOK ART (OpenLibrary API + Wikipedia fallback)
async function fetchBookArt(title) {
  const cleanTitle = title.replace(/\s*\((novel|book)\)\s*/gi, '').trim();
  try {
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      const doc = data.docs?.[0];
      if (doc?.cover_i) {
        const cover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        return { cover, banner: cover };
      }
    }
  } catch (e) {
    // continue
  }
  const wikiArt = await fetchWikiImage(`${cleanTitle} novel`);
  if (wikiArt) return wikiArt;
  return fetchWikiImage(cleanTitle);
}

// Shared: iTunes Search
async function fetchItunesArt(query, entity) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=3`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.results?.[0];
    if (hit?.artworkUrl100) {
      const highRes = hit.artworkUrl100
        .replace('100x100bb', '600x900bb')
        .replace('100x100', '600x600');
      return { cover: highRes, banner: highRes };
    }
  } catch {
    return null;
  }
  return null;
}

// Shared: Wikipedia Opensearch + Summary
async function fetchWikiImage(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json`;
    const sRes = await fetch(searchUrl, { headers: { 'User-Agent': 'OmniVerseApp/1.0 (contact@omniverse.local)' } });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const candidateTitles = sData[1] || [];
    for (const cand of candidateTitles) {
      const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cand)}`;
      const sumRes = await fetch(sumUrl, { headers: { 'User-Agent': 'OmniVerseApp/1.0 (contact@omniverse.local)' } });
      if (!sumRes.ok) continue;
      const sumData = await sumRes.json();
      const src = sumData.originalimage?.source || sumData.thumbnail?.source;
      if (src && !src.includes('Disambig') && !src.includes('Question_mark')) {
        return {
          cover: src,
          banner: src,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

// Resolver router
async function resolveArt(item) {
  switch (item.type) {
    case 'GAME':
      return await fetchGameArt(item.title);
    case 'SERIES':
      return await fetchSeriesArt(item.title);
    case 'MOVIE':
      return await fetchMovieArt(item.title);
    case 'MUSIC_ALBUM':
      return await fetchMusicAlbumArt(item.title, item.creator);
    case 'MANGA':
      return await fetchMangaArt(item.title);
    case 'BOOK':
      return await fetchBookArt(item.title);
    default:
      return await fetchMovieArt(item.title);
  }
}

async function main() {
  const targetType = process.argv[2]?.toUpperCase();
  const filter = targetType ? { type: targetType } : {};

  const items = await prisma.mediaItem.findMany({
    where: filter,
    select: { id: true, title: true, type: true, releaseYear: true, coverImageUrl: true },
    orderBy: { title: 'asc' },
  });

  console.log(`\n========================================`);
  console.log(`Starting Media Artwork Enrichment`);
  console.log(`Target: ${items.length} titles${targetType ? ` (${targetType})` : ''}`);
  console.log(`========================================\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prefix = `[${i + 1}/${items.length}] [${item.type}]`;
    
    try {
      const art = await resolveArt(item);
      if (art && art.cover) {
        await prisma.mediaItem.update({
          where: { id: item.id },
          data: {
            coverImageUrl: art.cover,
            bannerImageUrl: art.banner || art.cover,
          },
        });
        console.log(`${prefix} ✓ ${item.title}`);
        updated++;
      } else {
        console.log(`${prefix} ⚠ Could not resolve art for: ${item.title}`);
        skipped++;
      }
    } catch (err) {
      console.error(`${prefix} ✗ Error for ${item.title}:`, err.message);
      failed++;
    }

    // Small delay between calls to be a polite client
    await sleep(150);
  }

  console.log(`\n========================================`);
  console.log(`Completed Artwork Enrichment!`);
  console.log(`Updated: ${updated} | Skipped: ${skipped} | Failed: ${failed}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
