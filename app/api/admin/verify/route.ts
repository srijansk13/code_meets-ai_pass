import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { hashAdminKey, createAdminSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, label } = body;

    if (!key || typeof key !== 'string' || !key.trim()) {
      return NextResponse.json({ error: 'Security key is required.' }, { status: 400 });
    }

    const trimmedKey = key.trim();
    const hashedKey = hashAdminKey(trimmedKey);
    const envAdminKey = process.env.ADMIN_SECURITY_KEY?.trim();

    let isValid = false;

    // Direct environment key match check
    if (envAdminKey && trimmedKey === envAdminKey) {
      isValid = true;
    } else {
      // Supabase admin_keys database table match check
      const db = getSupabaseAdmin();
      const { data: matchedKey, error } = await db
        .from('admin_keys')
        .select('id, key_hash, active')
        .eq('key_hash', hashedKey)
        .eq('active', true)
        .maybeSingle();

      if (matchedKey) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin security key 💀' }, { status: 401 });
    }

    const deviceLabel = (label && typeof label === 'string' && label.trim()) ? label.trim() : 'Gate Admin';
    const token = await createAdminSessionToken(deviceLabel);

    const response = NextResponse.json({
      success: true,
      message: 'Gate access granted 🚀',
      deviceLabel,
    });

    // Set httpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('Admin verify error:', err);
    return NextResponse.json({ error: err.message || 'Internal authentication error.' }, { status: 500 });
  }
}
