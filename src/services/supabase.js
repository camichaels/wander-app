import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://farkcodunbcxdzhirjml.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcmtjb2R1bmJjeGR6aGlyam1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTE4MzIsImV4cCI6MjA3MjMyNzgzMn0.AxjKf9eIDQ8U8sml2rTU2xMOkkK1-W5t_2SyTJZnBAQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}