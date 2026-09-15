import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Authenticate gate admin session cookie
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login with security key.' }, { status: 401 });
    }

    const body = await req.json();
    const { qr_token, backup_code, participant_id, action, device_label } = body;

    const tokenStr = qr_token ? qr_token.trim() : null;
    const backupCodeStr = backup_code ? backup_code.trim() : null;
    const pIdStr = participant_id ? participant_id.trim() : null;
    const activeLabel = device_label || session.deviceLabel || 'Gate Admin';
    const db = getSupabaseAdmin();

    // Must provide either qr_token, backup_code, or participant_id
    if (!tokenStr && !backupCodeStr && !pIdStr) {
      return NextResponse.json({ error: 'QR token, 5-digit Backup Code, or Participant ID is required.' }, { status: 400 });
    }

    // Handle Uncheckin (Mark Unpresent / Reset)
    if (action === 'uncheckin') {
      let query = db
        .from('participants')
        .select('id, full_name, roll_number, section, branch, year, qr_token, backup_code, is_checked_in, checked_in_at, checked_in_by');

      if (pIdStr) {
        query = query.eq('id', pIdStr);
      } else if (tokenStr) {
        query = query.eq('qr_token', tokenStr);
      } else if (backupCodeStr) {
        query = query.eq('backup_code', backupCodeStr);
      }

      const { data: participant, error: fetchErr } = await query.maybeSingle();

      if (fetchErr || !participant) {
        return NextResponse.json({
          status: 'invalid',
          message: 'Participant not found.',
        });
      }

      const { data: updatedRows, error: updateErr } = await db
        .from('participants')
        .update({
          is_checked_in: false,
          checked_in_at: null,
          checked_in_by: null,
        })
        .eq('id', participant.id)
        .select('id, full_name, roll_number, section, branch, year, qr_token, backup_code, is_checked_in, checked_in_at, checked_in_by');

      if (updateErr || !updatedRows || updatedRows.length === 0) {
        return NextResponse.json({ error: updateErr?.message || 'Failed to uncheck participant.' }, { status: 500 });
      }

      return NextResponse.json({
        status: 'success',
        participant: updatedRows[0],
        message: 'Participant marked as UNPRESENT 🔄',
      });
    }

    // 1. Fetch participant by QR token OR backup code OR participant_id
    let query = db
      .from('participants')
      .select('id, full_name, roll_number, section, branch, year, qr_token, backup_code, is_checked_in, checked_in_at, checked_in_by');

    if (pIdStr) {
      query = query.eq('id', pIdStr);
    } else if (tokenStr) {
      query = query.eq('qr_token', tokenStr);
    } else if (backupCodeStr) {
      query = query.eq('backup_code', backupCodeStr);
    }

    const { data: participant, error: fetchErr } = await query.maybeSingle();

    // Invalid Token / Backup Code Case
    if (fetchErr || !participant) {
      await db.from('scan_log').insert([
        {
          participant_id: null,
          scanned_token: tokenStr || `BACKUP:${backupCodeStr}`,
          result: 'invalid',
          device_label: activeLabel,
        },
      ]);

      return NextResponse.json({
        status: 'invalid',
        message: 'Invalid entry pass or backup code not found.',
      });
    }

    // 2. Already Checked In Case
    if (participant.is_checked_in) {
      await db.from('scan_log').insert([
        {
          participant_id: participant.id,
          scanned_token: tokenStr || `BACKUP:${backupCodeStr}`,
          result: 'duplicate',
          device_label: activeLabel,
        },
      ]);

      return NextResponse.json({
        status: 'duplicate',
        participant,
        message: `Already checked in at ${participant.checked_in_at ? new Date(participant.checked_in_at).toLocaleTimeString() : 'gate'}.`,
      });
    }

    // 3. Atomic Update Guard (WHERE is_checked_in = false)
    const nowIso = new Date().toISOString();
    const { data: updatedRows, error: updateErr } = await db
      .from('participants')
      .update({
        is_checked_in: true,
        checked_in_at: nowIso,
        checked_in_by: activeLabel,
      })
      .eq('id', participant.id)
      .eq('is_checked_in', false)
      .select('id, full_name, roll_number, section, branch, year, qr_token, backup_code, is_checked_in, checked_in_at, checked_in_by');

    if (updateErr || !updatedRows || updatedRows.length === 0) {
      // Race condition occurred: another scanner checked them in concurrently
      await db.from('scan_log').insert([
        {
          participant_id: participant.id,
          scanned_token: tokenStr || `BACKUP:${backupCodeStr}`,
          result: 'duplicate',
          device_label: activeLabel,
        },
      ]);

      return NextResponse.json({
        status: 'duplicate',
        participant: { ...participant, is_checked_in: true, checked_in_at: nowIso },
        message: 'Already checked in by another scanner device!',
      });
    }

    const updatedParticipant = updatedRows[0];

    // 4. Log Success in scan_log
    await db.from('scan_log').insert([
      {
        participant_id: updatedParticipant.id,
        scanned_token: tokenStr || `BACKUP:${backupCodeStr}`,
        result: 'success',
        device_label: activeLabel,
      },
    ]);

    return NextResponse.json({
      status: 'success',
      participant: updatedParticipant,
      message: 'ENTRY ALLOWED 🚀',
    });
  } catch (err: any) {
    console.error('Checkin API error:', err);
    return NextResponse.json({ error: err.message || 'Internal checkin failure.' }, { status: 500 });
  }
}

