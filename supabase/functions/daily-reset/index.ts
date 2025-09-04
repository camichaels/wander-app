import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the mate reset function
    const { data: mateData, error: mateError } = await supabase.rpc('reset_completed_mate_relationships')
    
    if (mateError) {
      console.error('Mate reset function error:', mateError)
    }

    // Call the daily prompt advance function
    const { data: promptData, error: promptError } = await supabase.rpc('advance_daily_prompt')
    
    if (promptError) {
      console.error('Daily prompt advance error:', promptError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mateResets: mateData,
        dailyPromptAdvance: promptData,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    )
  }
})