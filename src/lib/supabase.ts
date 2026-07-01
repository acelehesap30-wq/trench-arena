import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yxtlsudyxvbemqsabdbd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGxzdWR5eHZiZW1xc2FiZGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjgzMDAsImV4cCI6MjA5ODI0NDMwMH0.ZAgCUTfWKGDeHZzJ75Vq4O-0cIkCEBcz9p775ls-3Pw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
