import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lphvjrrmdudwfttunyxv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZqcnJtZHVkd2Z0dHVueXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNTc5MDMsImV4cCI6MjEwODYzMzkwM30.3McdKnjQCRmYFOEKdrMEdIJbWpBSeuLFXdiF-Lhnrlo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
