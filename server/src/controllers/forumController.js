import { prisma } from '../config/db.js';
import { paginate } from '../utils/helpers.js';
import { createNotification } from './notificationController.js';

function scoreHot(post) {
  const score = post.upvotesCount - post.downvotesCount;
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
  return score / Math.pow(ageHours + 2, 1.5);
}

export async function listPosts(req, res, next) {
  try {
    const mediaId = req.params.mediaId || req.query.mediaId;
    const { sort = 'hot', page, limit, category, postType, search, tag } = req.query;
    const { skip, take, page: p, limit: l } = paginate({ page, limit: limit || 20 });

    const where = {};
    if (mediaId) {
      where.mediaId = mediaId;
    }
    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }
    if (postType && postType !== 'ALL') {
      where.postType = postType.toUpperCase();
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (tag && tag.trim()) {
      where.tags = { contains: tag.trim(), mode: 'insensitive' };
    }

    let posts = await prisma.forumPost.findMany({
      where,
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        media: { select: { id: true, title: true, type: true, coverImageUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    if (sort === 'new') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'top') {
      posts.sort((a, b) => b.upvotesCount - b.downvotesCount - (a.upvotesCount - a.downvotesCount));
    } else if (sort === 'comments') {
      posts.sort((a, b) => (b._count?.comments || 0) - (a._count?.comments || 0));
    } else if (sort === 'unanswered') {
      posts = posts.filter(p => (p._count?.comments || 0) === 0);
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'controversial') {
      posts.sort(
        (a, b) =>
          Math.min(b.upvotesCount, b.downvotesCount) - Math.min(a.upvotesCount, a.downvotesCount)
      );
    } else {
      posts.sort((a, b) => scoreHot(b) - scoreHot(a));
    }

    const total = posts.length;
    const sliced = posts.slice(skip, skip + take);

    let voteMap = {};
    if (req.user && sliced.length > 0) {
      const votes = await prisma.forumVote.findMany({
        where: { userId: req.user.id, postId: { in: sliced.map((p) => p.id) } },
      });
      voteMap = Object.fromEntries(votes.map((v) => [v.postId, v.value]));
    }

    res.json({
      posts: sliced.map((post) => ({
        ...post,
        tags: (() => {
          try {
            return JSON.parse(post.tags || '[]');
          } catch {
            return [];
          }
        })(),
        userVote: voteMap[post.id] || 0,
        commentCount: post._count.comments,
      })),
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const mediaId = req.params.mediaId || req.body.mediaId || null;
    const { title, body, category = 'GENERAL', postType = 'DISCUSSION', tags = [] } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    if (mediaId) {
      const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
      if (!media) return res.status(404).json({ error: 'Media not found' });
    }

    const parsedTags = Array.isArray(tags) ? JSON.stringify(tags) : typeof tags === 'string' ? tags : '[]';

    const post = await prisma.forumPost.create({
      data: {
        mediaId: mediaId || null,
        authorId: req.user.id,
        title: title.trim(),
        body: body.trim(),
        category: category.toUpperCase(),
        postType: postType.toUpperCase(),
        tags: parsedTags,
      },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        media: { select: { id: true, title: true, type: true, coverImageUrl: true } },
      },
    });

    res.status(201).json({
      post: {
        ...post,
        tags: (() => {
          try {
            return JSON.parse(post.tags || '[]');
          } catch {
            return [];
          }
        })(),
        userVote: 0,
        commentCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrendingDiscussions(req, res, next) {
  try {
    const posts = await prisma.forumPost.findMany({
      take: 6,
      orderBy: { upvotesCount: 'desc' },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        media: { select: { id: true, title: true, type: true, coverImageUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    const categoryCounts = await prisma.forumPost.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    res.json({
      trending: posts.map((p) => ({
        ...p,
        tags: (() => {
          try {
            return JSON.parse(p.tags || '[]');
          } catch {
            return [];
          }
        })(),
        commentCount: p._count.comments,
      })),
      stats: {
        totalDiscussions: await prisma.forumPost.count(),
        totalComments: await prisma.forumComment.count(),
        categories: categoryCounts,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.postId },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        media: { select: { id: true, title: true, type: true, coverImageUrl: true } },
      },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await prisma.forumComment.findMany({
      where: { postId: post.id },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    let postVote = 0;
    let commentVotes = {};
    if (req.user) {
      const votes = await prisma.forumVote.findMany({
        where: {
          userId: req.user.id,
          OR: [{ postId: post.id }, { commentId: { in: comments.map((c) => c.id) } }],
        },
      });
      for (const v of votes) {
        if (v.postId === post.id) postVote = v.value;
        if (v.commentId) commentVotes[v.commentId] = v.value;
      }
    }

    const tree = buildCommentTree(
      comments.map((c) => ({ ...c, userVote: commentVotes[c.id] || 0 }))
    );

    res.json({ post: { ...post, userVote: postVote, comments: tree } });
  } catch (err) {
    next(err);
  }
}

function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  for (const c of comments) {
    map[c.id] = { ...c, replies: [] };
  }
  for (const c of comments) {
    if (c.parentCommentId && map[c.parentCommentId]) {
      map[c.parentCommentId].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  }
  return roots;
}

export async function createComment(req, res, next) {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId: req.user.id,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
      },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    if (post.authorId !== req.user.id) {
      await createNotification({
        userId: post.authorId,
        type: 'FORUM',
        title: `${req.user.displayName} commented on your post`,
        body: content.trim().slice(0, 120),
        link: `/forum/${postId}`,
      });
    }

    res.status(201).json({ comment: { ...comment, userVote: 0, replies: [] } });
  } catch (err) {
    next(err);
  }
}

export async function votePost(req, res, next) {
  try {
    const { postId } = req.params;
    const value = Number(req.body.value);
    if (![1, -1, 0].includes(value)) {
      return res.status(400).json({ error: 'Vote must be 1, -1, or 0' });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = await prisma.forumVote.findFirst({
      where: { userId: req.user.id, postId },
    });

    let up = post.upvotesCount;
    let down = post.downvotesCount;

    if (existing) {
      if (existing.value === 1) up -= 1;
      if (existing.value === -1) down -= 1;
      if (value === 0) {
        await prisma.forumVote.delete({ where: { id: existing.id } });
      } else {
        await prisma.forumVote.update({ where: { id: existing.id }, data: { value } });
        if (value === 1) up += 1;
        if (value === -1) down += 1;
      }
    } else if (value !== 0) {
      await prisma.forumVote.create({
        data: { userId: req.user.id, postId, value },
      });
      if (value === 1) up += 1;
      if (value === -1) down += 1;
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: { upvotesCount: Math.max(0, up), downvotesCount: Math.max(0, down) },
    });

    res.json({ post: { ...updated, userVote: value } });
  } catch (err) {
    next(err);
  }
}

export async function voteComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const value = Number(req.body.value);
    if (![1, -1, 0].includes(value)) {
      return res.status(400).json({ error: 'Vote must be 1, -1, or 0' });
    }

    const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const existing = await prisma.forumVote.findFirst({
      where: { userId: req.user.id, commentId },
    });

    let upvotes = comment.upvotes;
    if (existing) {
      if (existing.value === 1) upvotes -= 1;
      if (value === 0) {
        await prisma.forumVote.delete({ where: { id: existing.id } });
      } else {
        if (existing.value === -1 && value === 1) upvotes += 1;
        if (existing.value === 1 && value === -1) upvotes -= 1;
        await prisma.forumVote.update({ where: { id: existing.id }, data: { value } });
      }
    } else if (value === 1) {
      await prisma.forumVote.create({ data: { userId: req.user.id, commentId, value } });
      upvotes += 1;
    } else if (value === -1) {
      await prisma.forumVote.create({ data: { userId: req.user.id, commentId, value } });
    }

    const updated = await prisma.forumComment.update({
      where: { id: commentId },
      data: { upvotes: Math.max(0, upvotes) },
    });

    res.json({ comment: { ...updated, userVote: value } });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const post = await prisma.forumPost.findUnique({ where: { id: req.params.postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    await prisma.forumPost.delete({ where: { id: post.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
