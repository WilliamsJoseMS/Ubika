import { createClient } from '@supabase/supabase-js';

// CREDENCIALES REALES DE TU PROYECTO SUPABASE
const SUPABASE_URL = 'https://keguftvohasnqynkrzra.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZ3VmdHZvaGFzbnF5bmtyenJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzI4MTQsImV4cCI6MjA4NTEwODgxNH0.yhlRidmya4kO4a0G7Ig3IOLyPRNXbRuSlZ__7PljDIA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});