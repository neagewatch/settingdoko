import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:0';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Step = {
  text: string;
  image_url?: string;
};

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Setting = {
  id: string;
  title: string;
  slug: string;
  os: string;                 // 'windows11' | 'ios' | 'macos' | 'android' | 'outlook' | ...
  os_type: 'os' | 'app';
  version: string | null;
  category: string | null;
  description: string | null;
  aliases: string[];
  path: string[];
  steps: Step[];
  tips: string | null;
  related_slugs: string[];
  keywords: string[];
  difficulty: Difficulty;
  minutes: number;            // 所要時間目安（分）
  is_published: boolean;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
};
