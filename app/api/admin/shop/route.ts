import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await query<any>(
      `SELECT id, name, description, price, stock, item_type, enabled as is_active, created_at 
       FROM shop_items 
       ORDER BY id ASC`
    );
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Fetch shop items error:', error);
    return NextResponse.json({ error: '아이템 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, price, stock, item_type } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: '이름과 가격은 필수 항목입니다.' }, { status: 400 });
    }

    let cat = (item_type || 'general').toLowerCase();
    if (!['title', 'role', 'consumable', 'badge_frame', 'general'].includes(cat)) {
      cat = 'general';
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const createdBy = session.userId || '0';

    const newItem = await queryOne<any>(
      `INSERT INTO shop_items (name, description, price, stock, item_type, payload_json, per_user_limit, enabled, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, '{}', 0, 1, $6, $7)
       RETURNING id, name, description, price, stock, item_type, enabled as is_active, created_at`,
      [
        name.trim(),
        description ? description.trim() : '',
        parseInt(price, 10),
        stock !== undefined && stock !== '' ? parseInt(stock, 10) : -1,
        cat,
        createdBy,
        nowSeconds,
      ]
    );

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Add shop item error:', error);
    return NextResponse.json({ error: `아이템 등록에 실패했습니다: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, description, price, stock, item_type, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: '아이템 ID가 필요합니다.' }, { status: 400 });
    }

    const updated = await queryOne<any>(
      `UPDATE shop_items 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           stock = COALESCE($5, stock),
           item_type = COALESCE($6, item_type),
           enabled = COALESCE($7, enabled)
       WHERE id = $1
       RETURNING id, name, description, price, stock, item_type, enabled as is_active, created_at`,
      [
        id,
        name ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        price !== undefined ? parseInt(price, 10) : null,
        stock !== undefined ? parseInt(stock, 10) : null,
        item_type,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
      ]
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Update shop item error:', error);
    return NextResponse.json({ error: '아이템 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: '아이템 ID가 필요합니다.' }, { status: 400 });
  }

  try {
    await query(`DELETE FROM shop_items WHERE id = $1`, [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete shop item error:', error);
    return NextResponse.json({ error: '아이템 삭제에 실패했습니다.' }, { status: 500 });
  }
}
