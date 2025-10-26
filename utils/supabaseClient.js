import { createClient } from '@supabase/supabase-js';

// Get the variables from your .env.local file or Vercel environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

// Validate that environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check your .env.local file or Vercel environment variables.");
  // Optionally throw an error or handle this case appropriately
}

// Create and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

