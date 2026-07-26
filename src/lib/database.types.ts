/**
 * Types that mirror the Supabase schema (supabase/schema.sql).
 * If you change the SQL, update these to match.
 */

export type HealthCondition =
  | 'Diabetes (Type 1)'
  | 'Diabetes (Type 2)'
  | 'Hypertension'
  | 'High Cholesterol'
  | 'GERD / Acid Reflux'
  | 'Kidney Disease'
  | 'Heart Disease'
  | 'Celiac / Gluten Intolerance'
  | 'IBS';

export type Allergy =
  | 'Peanuts'
  | 'Tree Nuts'
  | 'Dairy'
  | 'Eggs'
  | 'Shellfish'
  | 'Fish'
  | 'Soy'
  | 'Wheat / Gluten'
  | 'Sesame';

export type DietaryRestriction =
  | 'Vegetarian'
  | 'Vegan'
  | 'Halal'
  | 'Kosher'
  | 'Low Sodium'
  | 'Low Sugar'
  | 'Low Carb'
  | 'Keto';

export interface HealthProfile {
  id: string; // == auth user id
  full_name: string | null;
  conditions: string[];
  allergies: string[];
  restrictions: string[];
  notes: string | null;
  updated_at: string;
}

export interface MealAnalysis {
  id: string;
  user_id: string;
  image_url: string | null;
  created_at: string;
  // Snapshot of the AI JSON result (see services/ai.ts -> MealAnalysisResult)
  result: MealAnalysisResultJson;
}

export interface MealAnalysisResultJson {
  foods: { name: string; confidence?: number }[];
  nutrition: {
    calories: number;
    carbs_g: number;
    protein_g: number;
    fats_g: number;
    sodium_mg: number;
    sugar_g: number;
  };
  safety: {
    rating: 'safe' | 'caution' | 'avoid';
    summary: string;
    concerns: string[];
  };
  recommendations: {
    portions: string;
    avoid_or_limit: string[];
    tips: string[];
  };
}

export interface Reminder {
  id: string;
  user_id: string;
  type: 'medication' | 'hydration';
  title: string;
  // 'HH:MM' 24h for medication; hydration uses interval fields instead
  time: string | null;
  interval_hours: number | null;
  days_of_week: number[] | null; // 0=Sun..6=Sat
  enabled: boolean;
  notification_ids: string[]; // local Expo notification identifiers
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: HealthProfile;
        Insert: Partial<HealthProfile> & { id: string };
        Update: Partial<HealthProfile>;
      };
      meals: {
        Row: MealAnalysis;
        Insert: Partial<MealAnalysis> & { user_id: string };
        Update: Partial<MealAnalysis>;
      };
      reminders: {
        Row: Reminder;
        Insert: Partial<Reminder> & { user_id: string };
        Update: Partial<Reminder>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
