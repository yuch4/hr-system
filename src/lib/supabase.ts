import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdfoygnmzatikbxuzezi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZm95Z25temF0aWtieHV6ZXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MjQwNzAsImV4cCI6MjA0NTAwMDA3MH0.rtcLq7lru-7ZDOdkj_TODKa59K6meOu4tP_hihLPPfQ';

export const supabase = createClient(supabaseUrl, supabaseKey);