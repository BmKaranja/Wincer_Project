import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.' +
    ' Please set them in your environment to connect to your Supabase instance.'
  );
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://hezdgjrzheglumkzgqvy.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlemRnanJ6aGVnbHVta3pncXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjA4MDksImV4cCI6MjA5NzQzNjgwOX0.xiPbK2Vni4vN9Qj904oRPKz7dt73j4F_n3SmY2_38Zs'
);

export default supabase;
