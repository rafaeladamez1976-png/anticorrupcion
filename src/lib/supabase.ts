import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback to empty strings to avoid crashing during build if env vars are missing.
// The app will still require these variables to be set in Vercel to function.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
