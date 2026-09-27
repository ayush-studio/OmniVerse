import { prisma } from '../src/config/db.js';

async function seedDiscussions() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return;

  const admin = users.find((u) => u.email === 'admin@omniverse.app') || users[0];
  const demo = users.find((u) => u.email === 'demo@omniverse.app') || users[1] || users[0];
  const support = users.find((u) => u.email === 'support@omniverse.app') || users[0];

  const sampleDiscussions = [
    {
      category: 'GAMES',
      postType: 'QUESTION',
      title: 'What game gave you the most intense "post-game depression" after the credits rolled?',
      body: `Just finished an 80-hour playthrough of *The Witcher 3: Wild Hunt* and *Blood and Wine*. I'm staring at the title screen and feeling completely hollow.\n\nWhich games had such rich worldbuilding, character depth, or emotional finales that you genuinely couldn't bring yourself to start another game for days or weeks?\n\nFor me it's:\n1. The Witcher 3\n2. NieR: Automata (Ending E)\n3. Red Dead Redemption 2\n\nWhat are your picks?`,
      tags: JSON.stringify(['Gaming', 'RPG', 'StoryRich', 'Witcher', 'Discussion']),
      upvotesCount: 84,
      downvotesCount: 3,
      authorId: demo.id,
      comments: [
        {
          authorId: admin.id,
          content: 'Outer Wilds. Hands down. Once you know how the universe works, you can never play it fresh again. It hurts in the best existential way possible.',
          upvotes: 32,
          replies: [
            {
              authorId: demo.id,
              content: 'I keep seeing Outer Wilds mentioned everywhere. Is it better on controller or keyboard/mouse?',
              upvotes: 7,
            },
            {
              authorId: admin.id,
              content: 'Definitely controller! The analog thruster control for the ship makes a world of difference.',
              upvotes: 14,
            }
          ]
        },
        {
          authorId: support.id,
          content: 'Cyberpunk 2077 Phantom Liberty (The Tower ending). Left me sitting in silence for 20 minutes listening to the credits song.',
          upvotes: 19,
        }
      ]
    },
    {
      category: 'SPORTS',
      postType: 'DISCUSSION',
      title: 'Is this Premier League title race the most competitive in modern football history?',
      body: `Looking at the current tactical shifts, the goal differential margins, and how deep squads are having to rotate between Europe and domestic leagues.\n\nKey talking points:\n- Managers adapting to high-press recovery systems\n- VAR consistency across crucial penalty box decisions\n- The physical toll of the 60+ match calendar on players\n\nWho takes the silverware at the end of May? What tactical adjustment will prove decisive?`,
      tags: JSON.stringify(['Sports', 'Football', 'PremierLeague', 'Tactics', 'Debate']),
      upvotesCount: 62,
      downvotesCount: 8,
      authorId: admin.id,
      comments: [
        {
          authorId: demo.id,
          content: 'Injuries are going to be the sole deciding factor. Whichever team avoids losing their central defensive anchor or starting DM will edge it out.',
          upvotes: 18,
          replies: [
            {
              authorId: admin.id,
              content: 'Spot on. Depth is fine on paper until you lose your tempo-dictator in midfield for 6 weeks.',
              upvotes: 9,
            }
          ]
        },
        {
          authorId: support.id,
          content: '2018/19 will always be the standard for me — 98 points vs 97 points where a literal 11-millimeter goal-line clearance decided the championship.',
          upvotes: 27,
        }
      ]
    },
    {
      category: 'MOVIES',
      postType: 'THEORY',
      title: 'Dune: Part Two and Oppenheimer proved that audiences crave high-craft cinema over CGI slop',
      body: `For years, studios claimed that audiences only had an attention span for 90-minute formulaic comedies or conveyor-belt superhero flicks.\n\nYet the biggest cultural phenomenons of the past 2 years were 3-hour biographical dramas about quantum physics, and sweeping desert epics shot with IMAX 70mm cameras emphasizing practical effects and heavy sound design.\n\nWhat other genres or intellectual properties deserve this uncompromising auteur treatment next?`,
      tags: JSON.stringify(['Movies', 'Cinema', 'ChristopherNolan', 'DenisVilleneuve', 'IMAX']),
      upvotesCount: 119,
      downvotesCount: 4,
      authorId: demo.id,
      comments: [
        {
          authorId: admin.id,
          content: 'Give Denis Villeneuve or Guillermo del Toro free rein to adapt *Hyperion* or *Neuromancer*. Treat sci-fi literature with reverence instead of Marvelizing it.',
          upvotes: 45,
          replies: [
            {
              authorId: demo.id,
              content: 'A faithful Hyperion Cantos mini-series with Villeneuve directing the Canterbury Tales-style prologue would be legendary.',
              upvotes: 21,
            }
          ]
        },
        {
          authorId: support.id,
          content: 'Sound design alone in Dune 2 in IMAX felt like a religious experience. The Sardaukar throat singing and ornithopter rumble shook the seats.',
          upvotes: 31,
        }
      ]
    },
    {
      category: 'MUSIC',
      postType: 'REVIEW',
      title: 'Top 5 album intros of all time that instantly set the tone for a masterpiece',
      body: `An album opener has a huge burden: it has to hook the listener, establish the sonic palette, and hint at the emotional trajectory of the record.\n\nHere are my five favorites across genres:\n1. **Pink Floyd** - *Shine On You Crazy Diamond (Pts. 1-5)* (Wish You Were Here)\n2. **Kendrick Lamar** - *Wesley's Theory* (To Pimp A Butterfly)\n3. **Radiohead** - *Airbag* (OK Computer)\n4. **Michael Jackson** - *Wanna Be Startin' Somethin'* (Thriller)\n5. **A.R. Rahman** - *Dil Se Re* (Dil Se)\n\nWhat album opener gives you chills every single time you press play?`,
      tags: JSON.stringify(['Music', 'Albums', 'Vinyl', 'HipHop', 'Rock', 'Production']),
      upvotesCount: 95,
      downvotesCount: 2,
      authorId: admin.id,
      comments: [
        {
          authorId: demo.id,
          content: 'Wesley\'s Theory is unmatched. That Boris Gardiner sample cutting into Flying Lotus\'s funk bassline and George Clinton\'s vocal is pure genius.',
          upvotes: 38,
        },
        {
          authorId: support.id,
          content: 'Gotta add *Neighborhood #1 (Tunnels)* by Arcade Fire from Funeral. The piano melody kicking in is instantaneous nostalgia.',
          upvotes: 14,
        }
      ]
    },
    {
      category: 'SERIES',
      postType: 'HOT_TAKE',
      title: 'Better Call Saul surpassed Breaking Bad in character writing and tragedy',
      body: `Breaking Bad is a masterclass in tension, momentum, and explosive climaxes. But *Better Call Saul* achieved something even rarer:\n\nYou already knew Jimmy McGill's and Mike Ehrmantraut's ultimate fates from BB, yet the tragedy of watching Jimmy fight his instincts, Kim Wexler's moral unraveling, and Chuck McGill's tragic pride made it feel infinitely more heartbreaking.\n\nAgree or disagree? How do you rank the two?`,
      tags: JSON.stringify(['Series', 'BreakingBad', 'BetterCallSaul', 'VinceGilligan', 'TV']),
      upvotesCount: 78,
      downvotesCount: 11,
      authorId: demo.id,
      comments: [
        {
          authorId: admin.id,
          content: 'Agree 100%. "Point and Shoot" and "Fun and Games" (Season 6) are some of the most devastating hours of television ever produced.',
          upvotes: 29,
        },
        {
          authorId: support.id,
          content: 'Rhea Seehorn as Kim Wexler was the heart of the entire Gilliverse. That bus breakdown scene in the finale season... goosebumps.',
          upvotes: 22,
        }
      ]
    },
    {
      category: 'QA',
      postType: 'QUESTION',
      title: 'What should I play next if I loved Baldur\'s Gate 3 and Dragon Age: Origins?',
      body: `I am obsessed with party-based tactical RPGs with deep companion romance, branching dialogue consequences, and memorable villains.\n\nI have already played:\n- Baldur's Gate 3\n- Dragon Age: Origins & Inquisition\n- Mass Effect Legendary Edition\n- Divinity: Original Sin 2\n\nWhat should be my next 100-hour obsession? Is Pillars of Eternity or Pathfinder: Wrath of the Righteous better for someone coming from BG3?`,
      tags: JSON.stringify(['QA', 'Gaming', 'CRPG', 'Recommendations', 'AskOmni']),
      upvotesCount: 54,
      downvotesCount: 1,
      authorId: demo.id,
      comments: [
        {
          authorId: admin.id,
          content: 'Pathfinder: Wrath of the Righteous if you want power fantasy, mythic paths (Angel, Lich, Demon, Azata), and epic scale! Just be prepared to use turn-based mode and don\'t hesitate to adjust difficulty.',
          upvotes: 24,
          replies: [
            {
              authorId: demo.id,
              content: 'Does Wrath of the Righteous have full voice acting or is it mostly text?',
              upvotes: 5,
            },
            {
              authorId: admin.id,
              content: 'Key story moments and companion conversations are voiced, but there is substantial reading for lore books and secondary quests. The companion banter is top notch though!',
              upvotes: 11,
            }
          ]
        },
        {
          authorId: support.id,
          content: 'Check out Rogue Trader (Warhammer 40k) by Owlcat too if you want dark sci-fi with awesome turn-based combat.',
          upvotes: 12,
        }
      ]
    },
    {
      category: 'SPORTS',
      postType: 'QUESTION',
      title: 'Who is currently the most complete all-format cricketer in the world?',
      body: `Looking at batting averages across Tests, ODIs, and T20 leagues, alongside athletic fielding and clutch match-winning performances under pressure.\n\nAre we looking at Bumrah for bowling impact across all 3 formats, or all-rounders like Jadeja, or modern batting masters? Drop your statistical breakdowns and reasoning!`,
      tags: JSON.stringify(['Sports', 'Cricket', 'ICC', 'Analysis', 'Debate']),
      upvotesCount: 47,
      downvotesCount: 5,
      authorId: admin.id,
      comments: [
        {
          authorId: demo.id,
          content: 'Jasprit Bumrah. In a batsman\'s era with flat pitches and shorter boundaries, he is literally a cheat code in all three formats. Economy, reverse swing, slower balls, yorkers at 145km/h.',
          upvotes: 35,
        }
      ]
    }
  ];

  for (const item of sampleDiscussions) {
    const existing = await prisma.forumPost.findFirst({ where: { title: item.title } });
    if (!existing) {
      const createdPost = await prisma.forumPost.create({
        data: {
          title: item.title,
          body: item.body,
          category: item.category,
          postType: item.postType,
          tags: item.tags,
          upvotesCount: item.upvotesCount,
          downvotesCount: item.downvotesCount,
          authorId: item.authorId,
        },
      });

      for (const c of item.comments) {
        const rootComment = await prisma.forumComment.create({
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
                parentCommentId: rootComment.id,
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

  console.log('Seeded Reddit-style discussions successfully!');
}

seedDiscussions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
