import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await query<any>(
      `SELECT id, name, description, price, category as item_type, stock, active as is_active, created_at 
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

    let cat = (item_type || 'item').toLowerCase();
    if (!['title', 'item', 'role', 'badge_frame', 'consumable', 'special'].includes(cat)) {
      cat = 'item';
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    const newItem = await queryOne<any>(
      `INSERT INTO shop_items (name, description, price, category, stock, active, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, $6)
       RETURNING id, name, description, price, category as item_type, stock, active as is_active, created_at`,
      [
        name,
        description || '',
        parseInt(price, 10),
        cat,
        stock !== undefined ? parseInt(stock, 10) : -1,
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
           category = COALESCE($6, category),
           active = COALESCE($7, active)
       WHERE id = $1
       RETURNING id, name, description, price, category as item_type, stock, active as is_active, created_at`,
      [
        id,
        name,
        description,
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
