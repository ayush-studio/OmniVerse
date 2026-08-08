import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import seed from './seedData.js';

const prisma = new PrismaClient();

function cover(title) {
  return `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`;
}
function banner(title) {
  return `https://picsum.photos/seed/${encodeURIComponent(title)}-banner/1400/500`;
}

async function main() {
  console.log('Seeding OmniVerse…');

  await prisma.forumVote.deleteMany();
  await prisma.forumComment.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userMediaInteraction.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  const supportHash = await bcrypt.hash('support123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@omniverse.app',
      passwordHash: adminHash,
      displayName: 'Omni Admin',
      role: 'ADMIN',
      avatarUrl: seed.AVATAR_PRESETS[0],
      favoriteQuote: 'Everything is content.',
      tasteProfile: JSON.stringify({
        genres: ['Action Movies', 'AAA Story Games', 'Anime', 'Shonen Manga'],
        formats: ['Movies', 'Games', 'Anime', 'Manga'],
      }),
      onboardingComplete: true,
      maxMaturityRating: 'ADULT_18',
    },
  });

  await prisma.user.create({
    data: {
      email: 'support@omniverse.app',
      passwordHash: supportHash,
      displayName: 'Support Agent',
      role: 'SUPPORT_AGENT',
      avatarUrl: seed.AVATAR_PRESETS[1],
      onboardingComplete: true,
      tasteProfile: JSON.stringify({ genres: [], formats: [] }),
    },
  });

  await prisma.user.create({
    data: {
      email: 'demo@omniverse.app',
      passwordHash: userHash,
      displayName: 'Demo Explorer',
      role: 'USER',
      avatarUrl: seed.AVATAR_PRESETS[2],
      favoriteQuote: 'One more episode.',
      tasteProfile: JSON.stringify({
        genres: ['AAA Story Games', 'Shonen Manga', 'Hindi Pop', 'Sci-Fi'],
        formats: ['Games', 'Manga', 'Music', 'Movies'],
      }),
      onboardingComplete: true,
      maxMaturityRating: 'R',
    },
  });

  const all = [
    ...seed.movies,
    ...seed.games,
    ...seed.series,
    ...seed.books,
    ...seed.manga,
    ...seed.musicAlbums,
  ];

  console.log(`Inserting ${all.length} media items…`);

  const created = [];
  const batchSize = 50;
  for (let i = 0; i < all.length; i += batchSize) {
    const chunk = all.slice(i, i + batchSize);
    const rows = await Promise.all(
      chunk.map((item) =>
        prisma.mediaItem.create({
          data: {
            title: item.title,
            type: item.type,
            genreTags: JSON.stringify(item.genreTags || []),
            summary: item.summary,
            boxOfficeOrRank: BigInt(item.boxOfficeOrRank || 0),
            coverImageUrl: cover(item.title),
            bannerImageUrl: banner(item.title),
            releaseYear: item.releaseYear,
            language: item.language || 'English',
            maturityRating: item.maturityRating || 'PG13',
            metadata: JSON.stringify(item.metadata || {}),
            averageRating: item.averageRating || 7.5,
            ratingCount: Math.floor(Math.random() * 400) + 20,
          },
        })
      )
    );
    created.push(...rows);
    process.stdout.write(`\r  ${Math.min(i + batchSize, all.length)}/${all.length}`);
  }
  console.log('\nMedia seeded.');

  const sample = created.filter((c) => ['MOVIE', 'GAME', 'SERIES', 'MANGA'].includes(c.type)).slice(0, 8);
  for (const media of sample) {
    const post = await prisma.forumPost.create({
      data: {
        mediaId: media.id,
        authorId: admin.id,
        title: `What makes ${media.title} special?`,
        body: `Let's discuss **${media.title}**. Favorite moments? Overrated or underrated?\n\n- Hot take welcome\n- Spoilers in tags please`,
        upvotesCount: Math.floor(Math.random() * 40) + 5,
        downvotesCount: Math.floor(Math.random() * 5),
      },
    });
    await prisma.forumComment.create({
      data: {
        postId: post.id,
        authorId: admin.id,
        content: 'Opening the floor — drop your ranking below.',
        upvotes: 3,
      },
    });
  }

  console.log('Seed complete.');
  console.log('Accounts:');
  console.log('  admin@omniverse.app / admin123');
  console.log('  support@omniverse.app / support123');
  console.log('  demo@omniverse.app / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
