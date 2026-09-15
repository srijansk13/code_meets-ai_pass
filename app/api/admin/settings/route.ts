import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

/**
 * GET /api/admin/settings
 *
 * Returns current event settings. Requires admin session cookie.
 */
export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('event_settings')
      .select('registration_locked, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      // If table doesn't exist yet, return safe default
      return NextResponse.json({ registration_locked: false });
    }

    return NextResponse.json({
      registration_locked: data.registration_locked,
      updated_at: data.updated_at,
    });
  } catch (err: any) {
    console.error('Admin settings GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/settings
 *
 * Updates event settings. Requires admin session cookie.
 * Body: { registration_locked: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await req.json();

    if (typeof body.registration_locked !== 'boolean') {
      return NextResponse.json(
        { error: 'registration_locked must be a boolean value.' },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    // Upsert the singleton row (id=1)
    const { data, error } = await db
      .from('event_settings')
      .upsert(
        {
          id: 1,
          registration_locked: body.registration_locked,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('registration_locked, updated_at')
      .single();

    if (error) {
      console.error('Admin settings update error:', error);
      return NextResponse.json({ error: error.message || 'Failed to update settings.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registration_locked: data.registration_locked,
      updated_at: data.updated_at,
    });
  } catch (err: any) {
    console.error('Admin settings POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}
