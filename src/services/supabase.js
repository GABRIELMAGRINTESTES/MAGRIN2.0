import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdpdpnmnpehbuaisague.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcGRwbm1ucGVoYnVhaXNhZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2OTY4NDEsImV4cCI6MjA2MzI3Mjg0MX0.BnG8eeDVisFSW29tNp6JRJSqOZ6OJ9PhcjN-_MF_FUY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;