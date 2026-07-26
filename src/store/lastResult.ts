import type { MealAnalysisResult } from '@/services/ai';

/**
 * Tiny in-memory hand-off between the Scan screen and the Result screen,
 * so we don't have to serialize a large object through navigation params.
 */
let lastResult: { result: MealAnalysisResult; imageUri: string | null } | null =
  null;

export function setLastResult(
  result: MealAnalysisResult,
  imageUri: string | null
) {
  lastResult = { result, imageUri };
}

export function getLastResult() {
  return lastResult;
}
