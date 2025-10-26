import { createClient } from '@supabase/supabase-js';

// Get the variables from your .env.local file or Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Correct variable name
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Correct variable name

// Create and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);