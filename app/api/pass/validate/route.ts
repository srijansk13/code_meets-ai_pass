import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/pass/validate?token=<qr_token>
 *
 * Public endpoint — no admin auth required.
 * Validates whether a locally stored QR token still corresponds to an
 * existing participant in the database.
 *
 * Returns ONLY { valid: true } or { valid: false }.
 * No PII (name, phone, backup code, etc.) is returned.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json({ valid: false });
    }

    // Query only for existence — select a minimal non-PII field (id)
    const { data, error } = await supabase
      .from('participants')
      .select('id')
      .eq('qr_token', token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch {
    // On any unexpected error, return invalid so stale tokens are safely cleared
    return NextResponse.json({ valid: false });
  }
}
