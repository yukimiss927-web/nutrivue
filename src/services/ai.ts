import { supabase } from '@/lib/supabase';
import type { MealAnalysisResultJson } from '@/lib/database.types';

export type MealAnalysisResult = MealAnalysisResultJson;

/**
 * Send a meal photo (as base64) to the secure Edge Function, which forwards it
 * to Google Gemini along with the user's saved health profile and returns the
 * structured analysis. The API key never touches the device.
 */
export async function analyzeMeal(
  imageBase64: string,
  mediaType = 'image/jpeg'
): Promise<MealAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-meal', {
    body: { imageBase64, mediaType },
  });

  if (error) {
    throw new Error(
      error.message ||
        'Could not analyze the meal. Check your internet connection and try again.'
    );
  }
  if (!data?.result) {
    throw new Error(data?.error || 'The AI did not return a result.');
  }
  return data.result as MealAnalysisResult;
}
