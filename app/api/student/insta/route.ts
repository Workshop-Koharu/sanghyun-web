import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const userId = session?.userId ? BigInt(session.userId) : BigInt(0);

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10), 1), 50);

    const orderClause = sort === 'popular' ? 'p.likes_count DESC, p.created_at DESC' : 'p.created_at DESC';

    const posts = await query<any>(
      `SELECT p.id, p.user_id, p.author_name, p.grade, p.class_no,
              p.image_url, p.caption, p.tags, p.likes_count, p.created_at,
              CASE WHEN l.user_id IS NOT NULL THEN true ELSE false END as is_liked,
              COALESCE(c.comment_count, 0) as comment_count
       FROM insta_posts p
       LEFT JOIN insta_likes l ON p.id = l.post_id AND l.user_id = $1
       LEFT JOIN (
           SELECT post_id, COUNT(*) as comment_count
           FROM insta_comments
           GROUP BY post_id
       ) c ON p.id = c.post_id
       ORDER BY ${orderClause}
       LIMIT $2`,
      [userId, limit]
    );

    // If no posts yet, provide mock default posts to start with
    if (posts.length === 0) {
      return NextResponse.json({
        posts: [
          {
            id: 1,
            user_id: '1',
            author_name: '박서연',
            grade: 2,
            class_no: 3,
            image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop',
            caption: '상현고 벚꽃 필 무렵 교정 산책 🌸 올해도 다들 화이팅!',
            tags: '#상현고 #봄날 #교정 #고2일상',
            likes_count: 24,
            is_liked: false,
            comment_count: 5,
            created_at: Math.floor(Date.now() / 1000) - 3600,
          },
          {
            id: 2,
            user_id: '2',
            author_name: '이지우',
            grade: 1,
            class_no: 5,
            image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop',
            caption: '오늘 방과후 과학동아리 화학 실험 대성공 🧪 불꽃 반응 너무 예쁘다',
            tags: '#상현고 #과학동아리 #실험 #방과후',
            likes_count: 18,
            is_liked: false,
            comment_count: 3,
            created_at: Math.floor(Date.now() / 1000) - 7200,
          },
        ],
      });
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 본문 형식입니다.' }, { status: 400 });
  }

  try {
    const userId = BigInt(session.userId);
    const now = Math.floor(Date.now() / 1000);

    // 1. Toggle Like
    if (body.action === 'like') {
      const postId = parseInt(String(body.postId), 10);
      if (isNaN(postId) || postId <= 0) {
        return NextResponse.json({ error: '유효한 게시물 ID가 아닙니다.' }, { status: 400 });
      }

      const existingLike = await queryOne<any>(
        'SELECT 1 FROM insta_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      if (existingLike) {
        await query('DELETE FROM insta_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        const updated = await queryOne<any>(
          'UPDATE insta_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count',
          [postId]
        );
        return NextResponse.json({ success: true, liked: false, likesCount: updated?.likes_count ?? 0 });
      } else {
        await query('INSERT INTO insta_likes (post_id, user_id, created_at) VALUES ($1, $2, $3)', [
          postId,
          userId,
          now,
        ]);
        const updated = await queryOne<any>(
          'UPDATE insta_posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count, user_id',
          [postId]
        );

        // Award author 5 coins in wallets table
        if (updated?.user_id && String(updated.user_id) !== String(userId)) {
          await query(
            `INSERT INTO wallets (user_id, balance, total_earned, total_spent, updated_at)
             VALUES ($1, 5, 5, 0, $2)
             ON CONFLICT (user_id) DO UPDATE SET
                 balance = wallets.balance + 5,
                 total_earned = wallets.total_earned + 5,
                 updated_at = $2`,
            [updated.user_id, now]
          );
        }

        return NextResponse.json({ success: true, liked: true, likesCount: updated?.likes_count ?? 1 });
      }
    }

    // 2. Add Comment
    if (body.action === 'comment') {
      const postId = parseInt(String(body.postId), 10);
      const rawContent = typeof body.content === 'string' ? body.content.trim() : '';

      if (isNaN(postId) || postId <= 0) {
        return NextResponse.json({ error: '유효한 게시물 ID가 아닙니다.' }, { status: 400 });
      }
      if (!rawContent || rawContent.length < 1) {
        return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
      }
      if (rawContent.length > 200) {
        return NextResponse.json({ error: '댓글은 최대 200자까지 가능합니다.' }, { status: 400 });
      }

      const student = await queryOne<any>('SELECT nickname FROM students WHERE user_id = $1', [userId]);
      const authorName = (student?.nickname || session.username || '학생').slice(0, 32);

      const insertedComment = await queryOne<any>(
        `INSERT INTO insta_comments (post_id, user_id, author_name, content, created_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, post_id, author_name, content, created_at`,
        [postId, userId, authorName, rawContent, now]
      );

      return NextResponse.json({ success: true, comment: insertedComment });
    }

    // 3. New Instagram Post Upload
    const { imageUrl, caption, tags } = body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '사진 이미지 URL을 입력해주세요.' }, { status: 400 });
    }

    const cleanUrl = imageUrl.trim();
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      return NextResponse.json({ error: '올바른 웹 이미지 링크 (https://...)여야 합니다.' }, { status: 400 });
    }
    if (cleanUrl.length > 1000) {
      return NextResponse.json({ error: 'URL 길이가 너무 깁니다.' }, { status: 400 });
    }

    const cleanCaption = (typeof caption === 'string' ? caption.trim() : '').slice(0, 1000);
    const cleanTags = (typeof tags === 'string' ? tags.trim() : '').slice(0, 200);

    const student = await queryOne<any>(
      'SELECT nickname, grade, class_no FROM students WHERE user_id = $1',
      [userId]
    );

    const authorName = (student?.nickname || session.username || '상현고 학생').slice(0, 32);
    const grade = student?.grade || 1;
    const classNo = student?.class_no || 1;

    const inserted = await queryOne<any>(
      `INSERT INTO insta_posts (user_id, author_name, grade, class_no, image_url, caption, tags, likes_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)
       RETURNING id, user_id, author_name, grade, class_no, image_url, caption, tags, likes_count, created_at`,
      [userId, authorName, grade, classNo, cleanUrl, cleanCaption, cleanTags, now]
    );

    // Award +20 coins in wallets table (strictly wallets, never economics)
    await query(
      `INSERT INTO wallets (user_id, balance, total_earned, total_spent, updated_at)
       VALUES ($1, 20, 20, 0, $2)
       ON CONFLICT (user_id) DO UPDATE SET
           balance = wallets.balance + 20,
           total_earned = wallets.total_earned + 20,
           updated_at = $2`,
      [userId, now]
    );

    return NextResponse.json({
      success: true,
      post: {
        ...inserted,
        is_liked: false,
        comment_count: 0,
      },
      message: '상현스타에 피드가 성공적으로 발행되었습니다! (+20 코인 보너스 적립)',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
