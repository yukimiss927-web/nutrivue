import { supabase } from '@/lib/supabase';
import type { HealthProfile } from '@/lib/database.types';

/** Load the current user's permanent health profile. */
export async function getProfile(userId: string): Promise<HealthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no row yet
    throw error;
  }
  return data;
}

/** Save (create or update) the health profile. Persists across logins. */
export async function saveProfile(
  userId: string,
  patch: Partial<HealthProfile>
): Promise<HealthProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
