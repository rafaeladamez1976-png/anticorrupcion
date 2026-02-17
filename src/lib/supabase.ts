import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Durante el build en Vercel, si las variables de entorno aún no están configuradas,
// proporcionamos valores provisionales para evitar que el proceso falle.
// El cliente funcionará correctamente una vez que las variables reales se añadan en el dashboard de Vercel.
const effectiveUrl = supabaseUrl || 'https://placeholder-dont-crash-build.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(effectiveUrl, effectiveKey);
