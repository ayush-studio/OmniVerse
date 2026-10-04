import { prisma } from '../src/config/db.js';

async function seedMediaDebates() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return;

  const chuckle = users.find((u) => u.email === 'chuckle@omniverse.app') || users[0];
  const admin = users.find((u) => u.email === 'admin@omniverse.app') || users[0];
  const demo = users.find((u) => u.email === 'demo@omniverse.app') || users[1] || users[0];

  // Helper to find media by title match
  async function findMedia(titleKeyword) {
    return await prisma.mediaItem.findFirst({
      where: { title: { contains: titleKeyword, mode: 'insensitive' } },
    });
  }

  const debates = [
    {
      titleKeyword: 'Elden Ring',
      category: 'GAMES',
      postType: 'HOT_TAKE',
      title: 'Is Shadow of the Erdtree boss design over-tuned, or are players refusing to adapt?',
      body: `After 120 hours in the Lands Between and conquering Promised Consort Radahn, I keep seeing debates about boss combo length and camera tracking.\n\nSome argue FromSoftware crossed the line into trial-and-error memory checks, while others claim the Deflecting Hardtear and Scadutree fragment system gives you the most flexible combat toolkit in gaming history.\n\nWhere do you stand? Does peak difficulty enhance the triumph, or diminish the fun?`,
      tags: JSON.stringify(['Gaming', 'Soulslike', 'EldenRing', 'BossDesign', 'Debate']),
      upvotesCount: 184,
      downvotesCount: 14,
      authorId: chuckle.id,
      comments: [
        {
          authorId: demo.id,
          content: 'The Scadutree blessings were misunderstood. Once you hit level 15+ blessings, the incoming damage feels completely fair and in line with late-game Elden Ring.',
          upvotes: 42,
          replies: [
            {
              authorId: admin.id,
              content: 'Fair point, but the visual clarity on certain second-phase light beams makes learning patterns much harder than Sword Saint Isshin or Gael.',
              upvotes: 28,
            },
            {
              authorId: chuckle.id,
              content: 'Isshin is still the gold standard for telegraphing. Radahn is incredible spectacle, but Isshin felt like a conversation with blades.',
              upvotes: 19,
            }
          ]
        },
        {
          authorId: admin.id,
          content: 'Bayle the Dread with Igon is the single greatest dragon fight ever created in an action RPG. Nothing else comes close.',
          upvotes: 65,
        }
      ]
    },
    {
      titleKeyword: 'Dune: Part Two',
      category: 'MOVIES',
      postType: 'DISCUSSION',
      title: 'Paul Atreides: Hero, Tragic Figure, or Calculated Religious Tyrant?',
      body: `Denis Villeneuve made a profound change to Chani's perspective in Dune: Part Two compared to the novel. Watching Paul unleash the holy war across the galaxy was chilling.\n\nDid Paul genuinely have no choice because every other future led to total annihilation, or did he succumb to the addictive pull of charismatic prophecy?\n\nHow did you interpret the finale's tone compared to Part One?`,
      tags: JSON.stringify(['Cinema', 'SciFi', 'Dune', 'Villeneuve', 'CharacterStudy']),
      upvotesCount: 210,
      downvotesCount: 8,
      authorId: admin.id,
      comments: [
        {
          authorId: chuckle.id,
          content: 'Villeneuve executed Frank Herbert\'s true warning masterfully: charismatic leaders should come with a warning label. The look in Chani\'s eyes at the end anchored the horror of what was coming.',
          upvotes: 78,
          replies: [
            {
              authorId: demo.id,
              content: 'Hans Zimmer\'s score during the southern fundamentalist speech scene gave me genuine goosebumps in IMAX. Unforgettable sound design.',
              upvotes: 35,
            }
          ]
        }
      ]
    },
    {
      titleKeyword: 'Berserk',
      category: 'MANGA',
      postType: 'THEORY',
      title: 'The Golden Age Arc: Why Griffith\'s choice remains the most tragic betrayal in fiction',
      body: `Kentaro Miura spent years building the camaraderie of the Band of the Hawk so the Eclipse would feel like a personal amputation. What makes Griffith such a terrifying antagonist is that his ambition was always visible from chapter one.\n\nWas Griffith destined by the God Hand to make the sacrifice, or did free will play the ultimate role in the Crimson Behelit?`,
      tags: JSON.stringify(['Manga', 'DarkFantasy', 'Berserk', 'Miura', 'Analysis']),
      upvotesCount: 295,
      downvotesCount: 5,
      authorId: chuckle.id,
      comments: [
        {
          authorId: demo.id,
          content: 'The beauty of Miura\'s writing is that Griffith broke the moment Guts defeated him on the snowy hill. His entire empire crumbled because for the first time, he cared about another human more than his dream.',
          upvotes: 94,
          replies: [
            {
              authorId: admin.id,
              content: 'Exactly. "He was the only one who made me forget my dream." That single realization sealed everyone\'s fate.',
              upvotes: 51,
            }
          ]
        }
      ]
    },
    {
      titleKeyword: 'Interstellar',
      category: 'MOVIES',
      postType: 'REVIEW',
      title: 'Ten years later: Why the Docking Scene still stands as peak cinematic tension',
      body: `"Cooper, this is no time for caution."\n\nTen years later, the spinning docking sequence in Interstellar still has no equal. Between the realistic physics, the ticking sound of Hans Zimmer's "No Time For Caution" pipe organ, and Matthew McConaughey's performance.\n\nDoes Nolan's emotional core hold up for you on rewatches?`,
      tags: JSON.stringify(['Movies', 'SciFi', 'Nolan', 'Interstellar', 'Soundtrack']),
      upvotesCount: 312,
      downvotesCount: 11,
      authorId: demo.id,
      comments: [
        {
          authorId: chuckle.id,
          content: 'The decision to mute all sound in space during the initial airlock decompression, followed by the organ roaring back in... absolute masterclass in dynamics.',
          upvotes: 82,
        },
        {
          authorId: admin.id,
          content: 'TARS is legitimately one of the best sci-fi robot companions in cinema history. 90% humor, 100% loyalty.',
          upvotes: 61,
        }
      ]
    },
    {
      titleKeyword: 'Cyberpunk 2077',
      category: 'GAMES',
      postType: 'DISCUSSION',
      title: 'Phantom Liberty vs Base Game: Which storyline delivered the stronger emotional punch?',
      body: `Songbird, Solomon Reed, and Johnny Silverhand. Phantom Liberty transformed Cyberpunk into a gripping spy thriller where every choice felt agonizing.\n\nDid you send Songbird to the Moon, or turn her over to Myers and the NUSA? How did it compare to Arasaka Tower and the Mikoshi choices?`,
      tags: JSON.stringify(['Gaming', 'Cyberpunk', 'CDPR', 'PhantomLiberty', 'StoryChoice']),
      upvotesCount: 172,
      downvotesCount: 9,
      authorId: chuckle.id,
      comments: [
        {
          authorId: demo.id,
          content: 'The Killing Moon train sequence with Johnny sitting across from you while Songbird confesses the one-way cure... that broke my heart. I couldn\'t hand her over.',
          upvotes: 53,
          replies: [
            {
              authorId: admin.id,
              content: 'Idris Elba gave Solomon Reed so much gravitas. You can tell he hated the orders he had to follow, but duty was all he had left.',
              upvotes: 39,
            }
          ]
        }
      ]
    }
  ];

  let count = 0;
  for (const d of debates) {
    const media = await findMedia(d.titleKeyword);
    const existing = await prisma.forumPost.findFirst({ where: { title: d.title } });

    if (!existing) {
      const createdPost = await prisma.forumPost.create({
        data: {
          title: d.title,
          body: d.body,
          category: d.category,
          postType: d.postType,
          tags: d.tags,
          upvotesCount: d.upvotesCount,
          downvotesCount: d.downvotesCount,
          authorId: d.authorId,
          mediaId: media ? media.id : null,
        },
      });

      for (const c of d.comments) {
        const root = await prisma.forumComment.create({
          data: {
            postId: createdPost.id,
            authorId: c.authorId,
            content: c.content,
            upvotes: c.upvotes,
          },
        });

        if (c.replies?.length) {
          for (const r of c.replies) {
            await prisma.forumComment.create({
              data: {
                postId: createdPost.id,
                parentCommentId: root.id,
                authorId: r.authorId,
                content: r.content,
                upvotes: r.upvotes,
              },
            });
          }
        }
      }
      count++;
    }
  }

  console.log(`Seeded ${count} title-linked debates with nested comments!`);
}

seedMediaDebates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
