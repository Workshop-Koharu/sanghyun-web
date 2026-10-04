import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const userId = session?.userId ? BigInt(session.userId) : BigInt(0);

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);

    const todayKST = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const targetDate = dateParam || todayKST;

    const photos = await query<any>(
      `SELECT mp.id, mp.user_id, mp.author_name, mp.grade, mp.class_no,
              mp.image_url, mp.comment, mp.meal_date, mp.meal_type, mp.likes, mp.created_at,
              CASE WHEN mpl.user_id IS NOT NULL THEN true ELSE false END as is_liked
       FROM meal_photos mp
       LEFT JOIN meal_photo_likes mpl ON mp.id = mpl.photo_id AND mpl.user_id = $1
       WHERE mp.meal_date = $2
       ORDER BY mp.likes DESC, mp.created_at DESC
       LIMIT $3`,
      [userId, targetDate, limit]
    );

    // If no photos for target date, also fetch recent feed fallback
    let recentPhotos: any[] = [];
    if (photos.length === 0) {
      recentPhotos = await query<any>(
        `SELECT mp.id, mp.user_id, mp.author_name, mp.grade, mp.class_no,
                mp.image_url, mp.comment, mp.meal_date, mp.meal_type, mp.likes, mp.created_at,
                CASE WHEN mpl.user_id IS NOT NULL THEN true ELSE false END as is_liked
         FROM meal_photos mp
         LEFT JOIN meal_photo_likes mpl ON mp.id = mpl.photo_id AND mpl.user_id = $1
         ORDER BY mp.created_at DESC
         LIMIT 20`,
        [userId]
      );
    }

    return NextResponse.json({
      photos: photos.length > 0 ? photos : recentPhotos,
      date: targetDate,
      isToday: targetDate === todayKST,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = BigInt(session.userId);
    const now = Math.floor(Date.now() / 1000);

    // 1. Toggle Like
    if (body.action === 'like') {
      const { photoId } = body;
      if (!photoId) {
        return NextResponse.json({ error: '사진 ID가 누락되었습니다.' }, { status: 400 });
      }

      const existingLike = await queryOne<any>(
        'SELECT 1 FROM meal_photo_likes WHERE photo_id = $1 AND user_id = $2',
        [photoId, userId]
      );

      if (existingLike) {
        await query('DELETE FROM meal_photo_likes WHERE photo_id = $1 AND user_id = $2', [photoId, userId]);
        const updated = await queryOne<any>(
          'UPDATE meal_photos SET likes = GREATEST(0, likes - 1) WHERE id = $1 RETURNING likes',
          [photoId]
        );
        return NextResponse.json({ success: true, liked: false, likes: updated?.likes ?? 0 });
      } else {
        await query('INSERT INTO meal_photo_likes (photo_id, user_id, created_at) VALUES ($1, $2, $3)', [
          photoId,
          userId,
          now,
        ]);
        const updated = await queryOne<any>(
          'UPDATE meal_photos SET likes = likes + 1 WHERE id = $1 RETURNING likes',
          [photoId]
        );
        return NextResponse.json({ success: true, liked: true, likes: updated?.likes ?? 1 });
      }
    }

    // 2. Upload / Post Meal Photo
    const { imageUrl, comment, mealType } = body;
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return NextResponse.json({ error: '올바른 사진 이미지 URL을 입력해주세요.' }, { status: 400 });
    }

    // Get student profile info
    const student = await queryOne<any>(
      'SELECT nickname, grade, class_no FROM students WHERE user_id = $1',
      [userId]
    );

    const authorName = student?.nickname || session.username || '상현고 학생';
    const grade = student?.grade || 1;
    const classNo = student?.class_no || 1;
    const todayKST = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const cleanComment = (comment || '').trim().slice(0, 200);
    const mType = (mealType || '중식').slice(0, 10);

    const inserted = await queryOne<any>(
      `INSERT INTO meal_photos (user_id, author_name, grade, class_no, image_url, comment, meal_date, meal_type, likes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9)
       RETURNING id, user_id, author_name, grade, class_no, image_url, comment, meal_date, meal_type, likes, created_at`,
      [userId, authorName, grade, classNo, imageUrl.trim(), cleanComment, todayKST, mType, now]
    );

    // Give reward bonus to student for contributing to meal feed
    await query('UPDATE economics SET coins = coins + 20 WHERE user_id = $1', [userId]);

    return NextResponse.json({
      success: true,
      photo: {
        ...inserted,
        is_liked: false,
      },
      message: '급식 사진이 성공적으로 등록되었습니다! (참여 보너스 20 코인 지급)',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
