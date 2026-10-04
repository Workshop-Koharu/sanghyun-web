import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const items = await query<any>(
      `SELECT * FROM shop_items ORDER BY id ASC`
    );
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch shop items error:', error);
    return NextResponse.json({ error: '아이템 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, price, stock, item_type, icon_url } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: '이름과 가격은 필수 항목입니다.' }, { status: 400 });
    }

    const newItem = await queryOne<any>(
      `INSERT INTO shop_items (name, description, price, stock, item_type, icon_url, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING *`,
      [
        name,
        description || '',
        parseInt(price, 10),
        stock !== undefined ? parseInt(stock, 10) : -1,
        item_type || 'general',
        icon_url || null,
      ]
    );

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Add shop item error:', error);
    return NextResponse.json({ error: '아이템 등록에 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
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
           is_active = COALESCE($7, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, name, description, price !== undefined ? parseInt(price, 10) : null, stock !== undefined ? parseInt(stock, 10) : null, item_type, is_active]
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Update shop item error:', error);
    return NextResponse.json({ error: '아이템 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
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
  } catch (error) {
    console.error('Delete shop item error:', error);
    return NextResponse.json({ error: '아이템 삭제에 실패했습니다.' }, { status: 500 });
  }
}
