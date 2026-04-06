import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimalReport } from '@/lib/types';

interface DBAnimalReport {
  id: string;
  animal_type: string;
  location: string;
  area: string;
  reported_at: string;
  status: string;
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
    animalType: row.animal_type as any,
    location: row.location,
    area: row.area,
    reportedAt: new Date(row.reported_at),
    status: row.status as any,
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

export function useRealtimeReports() {
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    async function setupRealtimeListener() {
      try {
        const supabase = createClient();

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('animal_reports')
          .select('*')
          .order('reported_at', { ascending: false });

        if (fetchError) throw fetchError;

        setReports((data as DBAnimalReport[]).map(transformReport));
        setIsLoading(false);

        // Setup realtime subscription
        subscription = supabase
          .channel('animal_reports_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'animal_reports',
            },
            (payload: any) => {
              console.log('[v0] Realtime update received:', payload);

              if (payload.eventType === 'INSERT') {
                setReports((prev) => [transformReport(payload.new), ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setReports((prev) =>
                  prev.map((r) =>
                    r.id === payload.new.id ? transformReport(payload.new) : r
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error setting up realtime listener:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    }

    setupRealtimeListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { reports, isLoading, error };
}
