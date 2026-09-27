import { prisma } from '../config/db.js';

export async function seedUserStarterData(userId) {
  try {
    const existingInteractions = await prisma.userMediaInteraction.count({ where: { userId } });
    if (existingInteractions > 0) return; // already has data

    // Fetch sample titles across diverse types
    const games = await prisma.mediaItem.findMany({ where: { type: 'GAME' }, take: 4 });
    const movies = await prisma.mediaItem.findMany({ where: { type: 'MOVIE' }, take: 4 });
    const series = await prisma.mediaItem.findMany({ where: { type: 'SERIES' }, take: 3 });
    const music = await prisma.mediaItem.findMany({ where: { type: 'MUSIC_ALBUM' }, take: 3 });
    const manga = await prisma.mediaItem.findMany({ where: { type: { in: ['MANGA', 'BOOK'] } }, take: 3 });

    const allToInteract = [
      ...games.map((g, idx) => ({
        mediaId: g.id,
        isFavorite: idx === 0,
        wishlistStatus: idx % 2 === 0 ? 'COMPLETED' : 'PLAN_TO_WATCH',
        userRating: 9.0 + (idx % 2 === 0 ? 0.8 : 0.4),
        reviewText: idx === 0 ? 'Peak gameplay mechanics and unbelievable world-building. Highly recommended to everyone.' : null,
      })),
      ...movies.map((m, idx) => ({
        mediaId: m.id,
        isFavorite: idx < 2,
        wishlistStatus: idx === 3 ? 'PLAN_TO_WATCH' : 'COMPLETED',
        userRating: 8.8 + idx * 0.3,
        reviewText: idx === 0 ? 'Visuals, sound design, and acting were immaculate. A masterclass in cinematic pacing.' : null,
      })),
      ...series.map((s, idx) => ({
        mediaId: s.id,
        isFavorite: true,
        wishlistStatus: 'COMPLETED',
        userRating: 9.5,
        reviewText: 'One of the greatest shows ever conceived. The character development is unmatched.',
      })),
      ...music.map((mu, idx) => ({
        mediaId: mu.id,
        isFavorite: idx === 0,
        wishlistStatus: 'COMPLETED',
        userRating: 9.2,
        reviewText: 'Zero skips on this album. Sonic perfection from start to finish.',
      })),
      ...manga.map((ma, idx) => ({
        mediaId: ma.id,
        isFavorite: idx === 0,
        wishlistStatus: 'COMPLETED',
        userRating: 9.0,
        reviewText: 'Iconic art style, incredible narrative tension, and unforgettable character arcs.',
      })),
    ];

    for (const item of allToInteract) {
      await prisma.userMediaInteraction.upsert({
        where: { userId_mediaId: { userId, mediaId: item.mediaId } },
        create: {
          userId,
          mediaId: item.mediaId,
          isFavorite: item.isFavorite,
          wishlistStatus: item.wishlistStatus,
          userRating: item.userRating,
          reviewText: item.reviewText,
        },
        update: {},
      });
    }

    // Create starter custom lists
    const list1 = await prisma.customList.create({
      data: {
        userId,
        name: 'GOAT Tier: Games & Cinema 🏆',
        description: 'All-time masterpieces that defined storytelling and visual excellence.',
      },
    });

    const list2 = await prisma.customList.create({
      data: {
        userId,
        name: 'Late-Night Deep Immersion 🌙',
        description: 'Music albums, atmospheric games, and thought-provoking series for late hours.',
      },
    });

    // Populate custom lists with items
    const list1MediaIds = [...games.slice(0, 2), ...movies.slice(0, 2)].map((m) => m.id);
    for (const mId of list1MediaIds) {
      await prisma.customListItem.create({
        data: { listId: list1.id, mediaId: mId },
      }).catch(() => {});
    }

    const list2MediaIds = [...music.slice(0, 2), ...series.slice(0, 2)].map((m) => m.id);
    for (const mId of list2MediaIds) {
      await prisma.customListItem.create({
        data: { listId: list2.id, mediaId: mId },
      }).catch(() => {});
    }

    console.log(`Starter data successfully provisioned for user ${userId}`);
  } catch (err) {
    console.error('Error seeding user starter data:', err);
  }
}
