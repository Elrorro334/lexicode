import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM Users WHERE id = 1').get();
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { track, cefr_level, role } = body;

    const updates: string[] = [];
    const params: any[] = [];

    if (track) {
      updates.push('track = ?');
      params.push(track);
    }
    if (cefr_level) {
      updates.push('cefr_level = ?');
      params.push(cefr_level);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length > 0) {
      params.push(1); // user id
      db.prepare(`UPDATE Users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updatedUser = db.prepare('SELECT * FROM Users WHERE id = 1').get();
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
