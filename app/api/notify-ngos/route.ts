import { createClient } from '@/lib/supabase/server';
import { notifyNGOOfReport } from '@/lib/whatsapp';
import { getNGOsForArea } from '@/lib/ngo-routing';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to notify NGOs about a new animal report
 * Called after a report is created
 */
export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing reportId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the report
    const { data: report, error: fetchError } = await supabase
      .from('animal_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      console.error('[v0] Error fetching report:', fetchError);
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get NGOs for this area
    const ngoNames = getNGOsForArea(report.area, 'ngo');

    if (ngoNames.length === 0) {
      console.warn(`[v0] No NGOs available for area: ${report.area}`);
      return NextResponse.json({
        success: true,
        notified: 0,
        message: 'No NGOs available in this area',
      });
    }

    // Fetch NGO details from database
    const { data: ngosData, error: ngosError } = await supabase
      .from('ngos')
      .select('id, name, phone, areas')
      .in('name', ngoNames);

    if (ngosError || !ngosData || ngosData.length === 0) {
      console.error('[v0] Error fetching NGO details:', ngosError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch NGO details',
      });
    }

    // Notify the first 3 NGOs
    const ngosToNotify = ngosData.slice(0, 3);
    let notifiedCount = 0;

    const transformedReport = {
      id: report.id,
      animalType: report.animal_type,
      location: report.location,
      area: report.area,
      reportedAt: new Date(report.reported_at),
      status: report.status,
      reporterName: report.reporter_name,
      reporterContact: report.reporter_contact,
      notes: report.notes,
      coordinates: { lat: report.lat, lng: report.lng },
    };

    for (const ngo of ngosToNotify) {
      try {
        await notifyNGOOfReport(ngo, transformedReport as any);
        notifiedCount++;
        console.log(`[v0] Notified ${ngo.name} about report ${reportId}`);
      } catch (err) {
        console.error(`[v0] Error notifying ${ngo.name}:`, err);
      }
    }

    // Update report with first NGO notified
    if (ngosToNotify.length > 0) {
      const { error: updateError } = await supabase
        .from('animal_reports')
        .update({
          last_ngo_notified_at: new Date().toISOString(),
          last_ngo_notified_id: ngosToNotify[0].id,
        })
        .eq('id', reportId);

      if (updateError) {
        console.error('[v0] Error updating report notification status:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      notified: notifiedCount,
      message: `Notified ${notifiedCount} NGOs`,
    });
  } catch (error) {
    console.error('[v0] NGO notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
