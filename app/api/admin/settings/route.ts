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
      .select('registration_locked, first_year_locked, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      // If table doesn't exist yet, return safe default
      return NextResponse.json({ registration_locked: false, first_year_locked: false });
    }

    return NextResponse.json({
      registration_locked: data.registration_locked,
      first_year_locked: data.first_year_locked || false,
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

    if (
      body.registration_locked !== undefined && typeof body.registration_locked !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'registration_locked must be a boolean value.' },
        { status: 400 }
      );
    }
    if (
      body.first_year_locked !== undefined && typeof body.first_year_locked !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'first_year_locked must be a boolean value.' },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    // Fetch existing first
    const { data: existing } = await db.from('event_settings').select('*').eq('id', 1).maybeSingle();

    const updatePayload = {
      id: 1,
      registration_locked: body.registration_locked !== undefined ? body.registration_locked : existing?.registration_locked || false,
      first_year_locked: body.first_year_locked !== undefined ? body.first_year_locked : existing?.first_year_locked || false,
      updated_at: new Date().toISOString(),
    };

    // Upsert the singleton row (id=1)
    const { data, error } = await db
      .from('event_settings')
      .upsert(updatePayload, { onConflict: 'id' })
      .select('registration_locked, first_year_locked, updated_at')
      .single();

    if (error) {
      console.error('Admin settings update error:', error);
      return NextResponse.json({ error: error.message || 'Failed to update settings.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registration_locked: data.registration_locked,
      first_year_locked: data.first_year_locked,
      updated_at: data.updated_at,
    });
  } catch (err: any) {
    console.error('Admin settings POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}
