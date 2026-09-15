import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/registration/status
 *
 * Public endpoint — no admin auth required.
 * Returns the current global registration lock state.
 *
 * Used by the homepage and /register page to decide whether to show
 * GET ENTRY PASS as active or disabled.
 *
 * If the event_settings table does not exist (migration not yet applied),
 * safely defaults to { registration_locked: false } so existing behavior
 * is preserved.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('event_settings')
      .select('registration_locked')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      // Safe default: treat as open if settings table is missing or query fails
      return NextResponse.json({ registration_locked: false });
    }

    return NextResponse.json({ registration_locked: data.registration_locked });
  } catch {
    return NextResponse.json({ registration_locked: false });
  }
}
