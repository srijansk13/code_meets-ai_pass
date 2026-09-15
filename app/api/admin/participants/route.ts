import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const format = searchParams.get('format')?.toLowerCase();
    const filter = searchParams.get('filter')?.toLowerCase(); // 'checked_in', 'pending', 'all'

    const db = getSupabaseAdmin();
    let query = db.from('participants').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,roll_number.ilike.%${search}%,section.ilike.%${search}%`);
    }

    if (filter === 'checked_in') {
      query = query.eq('is_checked_in', true);
    } else if (filter === 'pending') {
      query = query.eq('is_checked_in', false);
    }

    const { data: participants, error } = await query;

    if (error) {
      console.error('Fetch participants error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // CSV Export Format
    if (format === 'csv') {
      const csvRows = [
        ['Full Name', 'Roll Number', 'Section', 'Year', 'Status', 'Checked In At', 'Checked In By', 'Registered At'].join(','),
      ];

      (participants || []).forEach((p) => {
        const row = [
          `"${(p.full_name || '').replace(/"/g, '""')}"`,
          `"${(p.roll_number || '').replace(/"/g, '""')}"`,
          `"${(p.section || '').replace(/"/g, '""')}"`,
          `"${(p.year || '').replace(/"/g, '""')}"`,
          p.is_checked_in ? 'Checked In' : 'Not Checked In',
          p.checked_in_at ? `"${new Date(p.checked_in_at).toLocaleString()}"` : '',
          `"${(p.checked_in_by || '').replace(/"/g, '""')}"`,
          `"${new Date(p.created_at).toLocaleString()}"`,
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="CODE_MEETS_AI_ROSTER_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON Format with Stats Summary
    const totalRegistered = (participants || []).length;
    const totalCheckedIn = (participants || []).filter((p) => p.is_checked_in).length;

    return NextResponse.json({
      success: true,
      stats: {
        total_registered: totalRegistered,
        total_checked_in: totalCheckedIn,
      },
      participants: participants || [],
    });
  } catch (err: any) {
    console.error('Participants GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 });
  }
}
