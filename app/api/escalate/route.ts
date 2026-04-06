import { createClient } from '@/lib/supabase/server';
import { notifyEscalation } from '@/lib/whatsapp';
import { getNGOsForArea } from '@/lib/ngo-routing';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes max for this endpoint

/**
 * Auto-escalation API endpoint
 * Checks for pending reports that haven't been assigned for 30 minutes
 * and escalates them to the next available NGO
 * 
 * Call this from a cron job every 5 minutes
 */
export async function GET(request: Request) {
  // Verify this is a cron request (in production, use Vercel KV for cron secrets)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Find pending reports that haven't been assigned in 30 minutes
    const { data: reportsToEscalate, error: fetchError } = await supabase
      .from('animal_reports')
      .select('*')
      .eq('status', 'pending')
      .or(
        `last_ngo_notified_at.is.null,last_ngo_notified_at.lt.${thirtyMinutesAgo.toISOString()}`
      )
      .lt('declined_count', 3); // Stop escalating after 3 declines

    if (fetchError) {
      console.error('[v0] Error fetching reports to escalate:', fetchError);
      return NextResponse.json(
        { error: 'Database error', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!reportsToEscalate || reportsToEscalate.length === 0) {
      return NextResponse.json({
        success: true,
        escalated: 0,
        message: 'No reports to escalate',
      });
    }

    console.log(
      `[v0] Found ${reportsToEscalate.length} reports to escalate`
    );

    let escalatedCount = 0;

    for (const report of reportsToEscalate) {
      try {
        // Get NGOs for this area
        const availableNGOs = getNGOsForArea(report.area, 'all');

        // Filter out already declined NGOs (using declined_count as proxy)
        const nextNGO = availableNGOs[report.declined_count % availableNGOs.length];

        if (!nextNGO) {
          console.warn(`[v0] No NGOs available for area: ${report.area}`);
          continue;
        }

        // Send escalation alert
        const transformedReport = {
          ...report,
          animalType: report.animal_type,
          reportedAt: new Date(report.reported_at),
          status: report.status,
          coordinates: { lat: report.lat, lng: report.lng },
        };

        await notifyEscalation(transformedReport, nextNGO);

        // Update last notified timestamp
        const { error: updateError } = await supabase
          .from('animal_reports')
          .update({
            last_ngo_notified_at: now.toISOString(),
            last_ngo_notified_id: nextNGO.id,
          })
          .eq('id', report.id);

        if (updateError) {
          console.error('[v0] Error updating report escalation:', updateError);
        } else {
          escalatedCount++;
          console.log(`[v0] Escalated report ${report.id} to ${nextNGO.name}`);
        }
      } catch (err) {
        console.error(`[v0] Error escalating report ${report.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      escalated: escalatedCount,
      total: reportsToEscalate.length,
      message: `Escalated ${escalatedCount}/${reportsToEscalate.length} reports`,
    });
  } catch (error) {
    console.error('[v0] Escalation service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
