import { supabase } from '@/lib/supabase';
import type { MealAnalysis, MealAnalysisResultJson } from '@/lib/database.types';

/**
 * Upload a meal photo to the private "meal-photos" bucket under the user's
 * own folder (RLS enforces isolation), returning a signed URL for display.
 */
export async function uploadMealPhoto(
  userId: string,
  fileBytes: ArrayBuffer,
  ext = 'jpg'
): Promise<string | null> {
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(path, fileBytes, { contentType: `image/${ext}`, upsert: false });

  if (error) {
    console.warn('[meals] photo upload failed:', error.message);
    return null; // analysis can still proceed without a stored photo
  }
  return path;
}

/** Save an AI analysis to the user's history. */
export async function saveMeal(
  userId: string,
  result: MealAnalysisResultJson,
  imageUrl: string | null
): Promise<MealAnalysis> {
  const { data, error } = await supabase
    .from('meals')
    .insert({ user_id: userId, result, image_url: imageUrl })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/** Most-recent meals for the dashboard / history. */
export async function listMeals(userId: string, limit = 20): Promise<MealAnalysis[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Meals logged today, used for the daily nutrition summary. */
export async function listTodayMeals(userId: string): Promise<MealAnalysis[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}
