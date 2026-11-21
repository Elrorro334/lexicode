import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const db = getDatabase();
    let modules;
    if (category) {
      modules = db.prepare('SELECT * FROM Modules WHERE category = ? ORDER BY id ASC').all(category);
    } else {
      modules = db.prepare('SELECT * FROM Modules ORDER BY id ASC').all();
    }

    return NextResponse.json({ success: true, modules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
