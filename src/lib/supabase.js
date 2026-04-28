import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Check your Vercel/Environment settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
