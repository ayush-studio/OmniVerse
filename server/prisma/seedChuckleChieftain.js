import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db.js';
import { seedUserStarterData } from '../src/services/starterDataService.js';

async function main() {
  console.log('Seeding Chuckle Chieftain data…');

  const email = 'chuckle@omniverse.app';
  const passwordHash = await bcrypt.hash('chuckle123', 10);

  let user = await prisma.user.findUnique({ where: { email } });

  const tasteProfile = JSON.stringify({
    formats: ['Games', 'Movies', 'Series', 'Music', 'Sports', 'Anime'],
    genres: ['AAA Story Games', 'Action Movies', 'Sci-Fi', 'Anime', 'Thriller Series', 'Indie Games'],
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: 'Chuckle Chieftain',
        role: 'USER',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuckleChief',
        favoriteQuote: '“Gaming, Cinema & Sports are the holy trinity of modern entertainment.”',
        tasteProfile,
        onboardingComplete: true,
        maxMaturityRating: 'ADULT_18',
      },
    });
    console.log('Created user Chuckle Chieftain:', user.id);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: 'Chuckle Chieftain',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuckleChief',
        favoriteQuote: '“Gaming, Cinema & Sports are the holy trinity of modern entertainment.”',
        tasteProfile,
        onboardingComplete: true,
      },
    });
    console.log('Updated user Chuckle Chieftain:', user.id);
  }

  // Provision starter data (favorites, custom lists, reviews)
  await seedUserStarterData(user.id);

  // Add rich specific interactions for Chuckle Chieftain
  const sampleItems = await prisma.mediaItem.findMany({ take: 30 });
  const games = sampleItems.filter((i) => i.type === 'GAME');
  const movies = sampleItems.filter((i) => i.type === 'MOVIE');
  const series = sampleItems.filter((i) => i.type === 'SERIES');
  const music = sampleItems.filter((i) => i.type === 'MUSIC_ALBUM');
  const sportsOrManga = sampleItems.filter((i) => ['MANGA', 'BOOK'].includes(i.type));

  const specificReviews = [
    {
      items: games,
      rating: 9.8,
      isFav: true,
      status: 'COMPLETED',
      review: 'Absolute masterwork in mechanical depth and art direction. One of my favorite gaming experiences in the past 10 years.',
    },
    {
      items: movies,
      rating: 9.6,
      isFav: true,
      status: 'COMPLETED',
      review: 'Unbelievable cinematography and pacing. The third act had me completely glued to the screen.',
    },
    {
      items: series,
      rating: 9.9,
      isFav: true,
      status: 'COMPLETED',
      review: 'Character development that sets the gold standard for television writing. Flawless execution.',
    },
    {
      items: music,
      rating: 9.4,
      isFav: true,
      status: 'COMPLETED',
      review: 'The production quality and mixing on this record are extraordinary. Timeless classics.',
    },
    {
      items: sportsOrManga,
      rating: 9.7,
      isFav: true,
      status: 'COMPLETED',
      review: 'Incredible competitive intensity and sports psychology. Depicts the obsession and thrill of victory better than anything else.',
    },
  ];

  for (const group of specificReviews) {
    for (const item of group.items) {
      await prisma.userMediaInteraction.upsert({
        where: { userId_mediaId: { userId: user.id, mediaId: item.id } },
        create: {
          userId: user.id,
          mediaId: item.id,
          isFavorite: group.isFav,
          wishlistStatus: group.status,
          userRating: group.rating,
          reviewText: group.review,
        },
        update: {
          isFavorite: group.isFav,
          wishlistStatus: group.status,
          userRating: group.rating,
          reviewText: group.review,
        },
      });
    }
  }

  // Create Chuckle Chieftain's Custom Curated Lists
  const listData = [
    {
      name: "Chuckle's Hall of Fame: GOAT Games & Movies 🏆",
      description: 'The absolute summit of gaming and cinema. Games and movies that changed my worldview.',
      mediaIds: [...games.slice(0, 3), ...movies.slice(0, 3)].map((m) => m.id),
    },
    {
      name: 'Elite Sports Classics & Competitive Thrillers ⚽',
      description: 'High-stakes rivalries, clutch performances, and sports stories with unmatched intensity.',
      mediaIds: [...sportsOrManga.slice(0, 3), ...movies.slice(0, 2)].map((m) => m.id),
    },
    {
      name: 'Album Masterpieces: Zero Skips Allowed 🎵',
      description: 'Full record listening experiences with flawless transitions and timeless sound.',
      mediaIds: music.slice(0, 4).map((m) => m.id),
    },
  ];

  for (const l of listData) {
    let existingList = await prisma.customList.findFirst({
      where: { userId: user.id, name: l.name },
    });
    if (!existingList) {
      existingList = await prisma.customList.create({
        data: {
          userId: user.id,
          name: l.name,
          description: l.description,
        },
      });
    }
    for (const mId of l.mediaIds) {
      await prisma.customListItem.upsert({
        where: { listId_mediaId: { listId: existingList.id, mediaId: mId } },
        create: { listId: existingList.id, mediaId: mId },
        update: {},
      }).catch(() => {});
    }
  }

  // Seed Reddit-style Community Discussions authored by Chuckle Chieftain
  const otherUsers = await prisma.user.findMany({ where: { id: { not: user.id } } });
  const replier1 = otherUsers[0] || user;
  const replier2 = otherUsers[1] || replier1;

  const chuckleDiscussions = [
    {
      category: 'GAMES',
      postType: 'DISCUSSION',
      title: 'Why immersive game design beats ultra-realistic graphics every single time',
      body: `We have reached a plateau where games spend 200 million dollars on pore rendering and blade-of-grass physics, but forget why games like *Hades*, *Undertale*, or *The Witcher 3* are unforgettable.\n\nAtmosphere, tight gameplay loops, and musical direction will always evoke stronger emotions than 4K photorealism with shallow mechanics.\n\nWhich games proved this to you?`,
      tags: JSON.stringify(['Gaming', 'GameDesign', 'Immersion', 'Hades', 'Debate']),
      upvotesCount: 142,
      downvotesCount: 6,
      comments: [
        {
          authorId: replier1.id,
          content: 'Preach! Art direction ages like fine wine, while graphical realism looks dated within 3 years.',
          upvotes: 48,
          replies: [
            {
              authorId: user.id,
              content: 'Exactly. Look at games from 2002 with stylized art versus games trying to be "photo real". Stylization is eternal.',
              upvotes: 24,
            },
          ],
        },
        {
          authorId: replier2.id,
          content: 'Soundtrack does 70% of the heavy lifting. The moment the music swells in a boss fight, graphics become secondary.',
          upvotes: 31,
        },
      ],
    },
    {
      category: 'SPORTS',
      postType: 'DISCUSSION',
      title: 'The psychological toll of penalty shootouts in major cup finals: Luck or Mental Fortitude?',
      body: `Every time a major World Cup or Champions League final goes to penalties, pundits say "it is a lottery".\n\nI completely disagree. When you walk from the halfway line in front of 80,000 screaming fans after 120 minutes of sprinting, technique takes a back seat to emotional composure, pre-shot routines, and goalkeeper mind games.\n\nWhat is the most iconic penalty shootout or clutch sports moment you have ever witnessed live?`,
      tags: JSON.stringify(['Sports', 'Football', 'WorldCup', 'Psychology', 'ClutchMoments']),
      upvotesCount: 98,
      downvotesCount: 4,
      comments: [
        {
          authorId: replier1.id,
          content: 'Argentina vs France in 2022. Dibu Martinez doing mental warfare on every kick was a masterclass in psychological disruption.',
          upvotes: 42,
          replies: [
            {
              authorId: user.id,
              content: 'Throwing the ball away to make Tchouaméni walk to retrieve it... sheer villainous genius. Ice in his veins.',
              upvotes: 19,
            },
          ],
        },
        {
          authorId: replier2.id,
          content: '2005 Champions League final in Istanbul. Dudek’s wobbly legs tribute to Grobbelaar. Unforgettable.',
          upvotes: 26,
        },
      ],
    },
    {
      category: 'MOVIES',
      postType: 'REVIEW',
      title: 'Why Lord of the Rings: Return of the King remains the gold standard of fantasy cinema',
      body: `Over 20 years later, no fantasy film or series has captured the scale, heartfelt camaraderie, and earned emotional release of the Pelennor Fields charge or Mount Doom.\n\nPractical sets, miniature bigatures, Howard Shore\'s leitmotifs, and actors who poured their soul into every scene.\n\nWill we ever see another trilogy achieve 11 Academy Awards and universal critical acclaim again?`,
      tags: JSON.stringify(['Movies', 'LordOfTheRings', 'Cinema', 'HowardShore', 'Masterpiece']),
      upvotesCount: 167,
      downvotesCount: 2,
      comments: [
        {
          authorId: replier1.id,
          content: '"Ride now, ride now, ride! Ride for ruin and the world\'s ending!" Still gives me full-body chills without fail.',
          upvotes: 55,
        },
      ],
    },
    {
      category: 'MUSIC',
      postType: 'QUESTION',
      title: 'What song has a key change or beat drop so powerful it completely changes your mood?',
      body: `You know that feeling when a song shifts into second gear and you immediately get goosebumps or want to sprint through a brick wall?\n\nWhether it is classic rock, hip-hop, orchestral, or electronic — drop your ultimate goosebump timestamps below!`,
      tags: JSON.stringify(['Music', 'BeatDrop', 'Songs', 'AudioExperience', 'AskOmni']),
      upvotesCount: 86,
      downvotesCount: 1,
      comments: [
        {
          authorId: replier2.id,
          content: 'The drum transition in "In the Air Tonight" by Phil Collins, or the beat switch in "DNA." by Kendrick Lamar.',
          upvotes: 39,
        },
      ],
    },
  ];

  for (const disc of chuckleDiscussions) {
    const existing = await prisma.forumPost.findFirst({ where: { title: disc.title } });
    if (!existing) {
      const createdPost = await prisma.forumPost.create({
        data: {
          title: disc.title,
          body: disc.body,
          category: disc.category,
          postType: disc.postType,
          tags: disc.tags,
          upvotesCount: disc.upvotesCount,
          downvotesCount: disc.downvotesCount,
          authorId: user.id,
        },
      });

      for (const c of disc.comments) {
        const root = await prisma.forumComment.create({
          data: {
            postId: createdPost.id,
            authorId: c.authorId,
            content: c.content,
            upvotes: c.upvotes,
          },
        });
        if (c.replies?.length) {
          for (const rep of c.replies) {
            await prisma.forumComment.create({
              data: {
                postId: createdPost.id,
                parentCommentId: root.id,
                authorId: rep.authorId,
                content: rep.content,
                upvotes: rep.upvotes,
              },
            });
          }
        }
      }
    }
  }

  console.log('Seeded Chuckle Chieftain with complete Games, Movies, Songs, Sports, Lists & Discussions!');
  console.log('Login credentials:');
  console.log('  Email:    chuckle@omniverse.app');
  console.log('  Password: chuckle123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
