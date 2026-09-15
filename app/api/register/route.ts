import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { validateParticipantData } from '@/lib/validation';
import crypto from 'crypto';

/**
 * Generates a cryptographically secure 5-digit backup code (10000 - 99999)
 */
function generateSecureBackupCode(): string {
  const num = crypto.randomInt(10000, 100000);
  return num.toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Server-side validation of all mandatory participant fields & roll/year sync
    const validation = validateParticipantData(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { full_name, roll_number, section, branch, phone_number } = body;

    const trimmedFullName = full_name.trim();
    const trimmedRoll = roll_number.trim();
    const trimmedSection = section.trim();
    const trimmedBranch = branch.trim().toUpperCase();
    const cleanPhone = phone_number.toString().trim().replace(/\D/g, '');
    const finalYear = validation.derivedYear!;

    // Database client (fallback to admin client if service role key configured)
    const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? getSupabaseAdmin() : supabase;

    // Check if participant already exists by lower(roll_number)
    const { data: existing } = await db
      .from('participants')
      .select('id, full_name, roll_number, section, branch, year, phone_number, qr_token, backup_code, is_checked_in, checked_in_at, created_at')
      .ilike('roll_number', trimmedRoll)
      .maybeSingle();

    if (existing) {
      // If existing user doesn't have a backup_code yet, generate one on the fly
      if (!existing.backup_code) {
        let code = generateSecureBackupCode();
        await db.from('participants').update({ backup_code: code }).eq('id', existing.id);
        existing.backup_code = code;
      }
      return NextResponse.json({
        success: true,
        already_registered: true,
        message: "You're already in the system 👀 — here's your ticket.",
        participant: existing,
      });
    }

    // Retry loop to ensure unique 5-digit backup code generation
    let backupCode = generateSecureBackupCode();
    let attempts = 0;
    let inserted = null;
    let insertError = null;

    while (attempts < 5) {
      attempts++;
      const { data, error } = await db
        .from('participants')
        .insert([
          {
            full_name: trimmedFullName,
            roll_number: trimmedRoll,
            section: trimmedSection,
            branch: trimmedBranch,
            year: finalYear,
            phone_number: cleanPhone,
            backup_code: backupCode,
          },
        ])
        .select('id, full_name, roll_number, section, branch, year, phone_number, qr_token, backup_code, is_checked_in, checked_in_at, created_at')
        .single();

      if (!error) {
        inserted = data;
        insertError = null;
        break;
      }

      // If backup_code collision occurred, generate a new one and retry
      if (error.code === '23505' && error.message.includes('backup_code')) {
        backupCode = generateSecureBackupCode();
        continue;
      }

      insertError = error;
      break;
    }

    if (insertError) {
      console.error('Participant insert error:', insertError);
      // Handle unique constraint conflict on roll_number
      if (insertError.code === '23505' || insertError.message.includes('unique')) {
        const { data: duplicateMatch } = await db
          .from('participants')
          .select('id, full_name, roll_number, section, branch, year, phone_number, qr_token, backup_code, is_checked_in, checked_in_at, created_at')
          .ilike('roll_number', trimmedRoll)
          .single();

        if (duplicateMatch) {
          return NextResponse.json({
            success: true,
            already_registered: true,
            message: "You're already in the system 👀 — here's your ticket.",
            participant: duplicateMatch,
          });
        }
      }
      return NextResponse.json({ error: insertError.message || 'Failed to complete registration.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      already_registered: false,
      message: 'Registration successful! Keep your ticket ready.',
      participant: inserted,
    });
  } catch (err: any) {
    console.error('Registration API internal error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
