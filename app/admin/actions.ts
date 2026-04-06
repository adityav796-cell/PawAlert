'use server';

import { createClient } from '@/lib/supabase/server';
import { AnimalReport, AnimalType, RescueStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

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

export async function getAllReports(): Promise<AnimalReport[]> {
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

export async function updateReport(
  reportId: string,
  updates: Partial<{
    animal_type: AnimalType;
    location: string;
    area: string;
    status: RescueStatus;
    assigned_ngo: string | null;
    assigned_ngo_name: string | null;
    assigned_ngo_contact: string | null;
    notes: string | null;
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function deleteReport(
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    console.error('Error deleting report:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function bulkDeleteReports(
  reportIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .delete()
    .in('id', reportIds);

  if (error) {
    console.error('Error bulk deleting reports:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function bulkMarkAsRescued(
  reportIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({
      status: 'rescued',
      rescued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('id', reportIds);

  if (error) {
    console.error('Error bulk marking as rescued:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function bulkReassignNGO(
  reportIds: string[],
  ngoId: string,
  ngoName: string,
  ngoContact: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('animal_reports')
    .update({
      assigned_ngo: ngoId,
      assigned_ngo_name: ngoName,
      assigned_ngo_contact: ngoContact,
      updated_at: new Date().toISOString(),
    })
    .in('id', reportIds);

  if (error) {
    console.error('Error bulk reassigning NGO:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function getTodayStats(): Promise<{
  totalToday: number;
  pending: number;
  notified: number;
  rescued: number;
}> {
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data, error } = await supabase
    .from('animal_reports')
    .select('status')
    .gte('reported_at', todayISO);

  if (error) {
    console.error('Error fetching stats:', error);
    return { totalToday: 0, pending: 0, notified: 0, rescued: 0 };
  }

  const reports = data as { status: RescueStatus }[];
  
  return {
    totalToday: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    notified: reports.filter(r => r.status === 'notified').length,
    rescued: reports.filter(r => r.status === 'rescued').length,
  };
}
