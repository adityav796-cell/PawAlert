'use server';

import { createClient } from '@/lib/supabase/server';
import { AnimalReport, NGO, AnimalType, RescueStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Database types from Supabase
interface DBAnimalReport {
  id: string;
  animal_type: AnimalType;
  location: string;
  area: string;
  reported_at: string;
  status: RescueStatus;
  photo: string | null;
  reporter_name: string;
  reporter_contact: string;
  assigned_ngo: string | null;
  assigned_ngo_name: string | null;
  assigned_ngo_contact: string | null;
  assigned_volunteer: string | null;
  notes: string | null;
  lat: number;
  lng: number;
  declined_count: number;
  rescue_photo: string | null;
  rescued_at: string | null;
  last_ngo_notified_at: string | null;
  last_ngo_notified_id: string | null;
}

interface DBNGO {
  id: string;
  name: string;
  phone: string;
  areas: string[];
  type: 'ngo' | 'helpline';
}

// Transform database row to app type
function transformReport(row: DBAnimalReport): AnimalReport {
  return {
    id: row.id,
    animalType: row.animal_type,
    location: row.location,
    area: row.area,
    reportedAt: new Date(row.reported_at),
    status: row.status,
    photo: row.photo ?? undefined,
    reporterName: row.reporter_name,
    reporterContact: row.reporter_contact,
    assignedNGO: row.assigned_ngo ?? undefined,
    assignedNGOName: row.assigned_ngo_name ?? undefined,
    assignedNGOContact: row.assigned_ngo_contact ?? undefined,
    assignedVolunteer: row.assigned_volunteer ?? undefined,
    notes: row.notes ?? undefined,
    declinedCount: row.declined_count ?? 0,
    rescuePhoto: row.rescue_photo ?? undefined,
    rescuedAt: row.rescued_at ? new Date(row.rescued_at) : undefined,
    lastNGONotifiedAt: row.last_ngo_notified_at ? new Date(row.last_ngo_notified_at) : undefined,
    lastNGONotifiedId: row.last_ngo_notified_id ?? undefined,
    coordinates: {
      lat: row.lat,
      lng: row.lng,
    },
  };
}

function transformNGO(row: DBNGO): NGO {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    areas: row.areas,
    type: row.type,
  };
}

export async function getReports(): Promise<AnimalReport[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('animal_reports')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return (data as DBAnimalReport[]).map(transformReport);
}

export async function getNGOs(): Promise<NGO[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('ngos')
    .select('*')
    .order('type', { ascending: true });

  if (error) {
    console.error('Error fetching NGOs:', error);
    return [];
  }

  return (data as DBNGO[]).map(transformNGO);
}

export async function createReport(formData: {
  animalType: AnimalType;
  location: string;
  area: string;
  reporterName: string;
  reporterContact: string;
  notes?: string;
  photo?: string;
}): Promise<{ success: boolean; error?: string; reportId?: string }> {
  const supabase = await createClient();

  // Default coordinates for Delhi (in a real app, you'd get these from a geocoding API or GPS)
  const defaultCoords = {
    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
    lng: 77.209 + (Math.random() - 0.5) * 0.1,
  };

  const { data, error } = await supabase
    .from('animal_reports')
    .insert({
      animal_type: formData.animalType,
      location: formData.location,
      area: formData.area,
      reporter_name: formData.reporterName,
      reporter_contact: formData.reporterContact,
      notes: formData.notes || null,
      photo: formData.photo || null,
      status: 'pending',
      lat: defaultCoords.lat,
      lng: defaultCoords.lng,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return { success: false, error: error.message };
  }

  // Notify NGOs about the new report
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify-ngos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: data.id }),
    });
  } catch (err) {
    console.error('Error notifying NGOs:', err);
    // Don't fail the report creation if notification fails
  }

  revalidatePath('/', 'layout');
  return { success: true, reportId: data.id };
}

export async function updateReportStatus(
  reportId: string,
  status: RescueStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function acceptReport(
  reportId: string,
  ngoId: string,
  ngoName: string,
  ngoContact: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({
      status: 'notified',
      assigned_ngo: ngoId,
      assigned_ngo_name: ngoName,
      assigned_ngo_contact: ngoContact,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error accepting report:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function declineReport(
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get current decline count
  const { data: report } = await supabase
    .from('animal_reports')
    .select('declined_count')
    .eq('id', reportId)
    .single();

  const newDeclineCount = (report?.declined_count ?? 0) + 1;

  const { error } = await supabase
    .from('animal_reports')
    .update({
      declined_count: newDeclineCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error declining report:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markAsRescued(
  reportId: string,
  rescuePhoto?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({
      status: 'rescued',
      rescue_photo: rescuePhoto || null,
      rescued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error marking as rescued:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
