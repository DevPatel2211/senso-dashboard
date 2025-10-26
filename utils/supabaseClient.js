import { createClient } from '@supabase/supabase-js'

// Get the variables from your .env.local file
const supabaseUrl = process.env.https://kjhxummltrkmcgadbfwv.supabase.co
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqaHh1bW1sdHJrbWNnYWRiZnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzUxNjcsImV4cCI6MjA3NzA1MTE2N30.NB9UPM180R0BuShm7VnWsWjTTtlP1_yWTNmw1g3DeWo

// Create and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

