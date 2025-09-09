// services/dailyAPI.js - SIMPLIFIED VERSION
import { supabase } from './supabase'

export const DailyAPI = {
  // Helper function to get current date in Pacific Time
  getCurrentDailyDate: () => {
    const now = new Date()
    
    // Create a date in PT (Pacific Time)
    const ptTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    
    // Return YYYY-MM-DD format
    return ptTime.toISOString().split('T')[0]
  },

  // Get today's prompt - now just a simple lookup!
  getTodaysPrompt: async (userId = null) => {
    try {
      const today = DailyAPI.getCurrentDailyDate()
      
      // Simple lookup from pre-populated assignments table
      const { data: assignment, error: assignError } = await supabase
        .from('daily_prompt_assignments')
        .select(`
          assignment_date,
          prompt_id,
          daily_prompts!inner(
            prompt_id,
            prompt_text,
            created_at
          )
        `)
        .eq('assignment_date', today)
        .single()

      if (assignError) {
        console.error('Assignment lookup error:', assignError)
        
        // If no assignment found for today, return a helpful error
        if (assignError.code === 'PGRST116') {
          return { 
            data: null, 
            error: new Error(`No daily prompt assigned for ${today}. Please contact admin.`) 
          }
        }
        
        throw assignError
      }

      if (!assignment) {
        return { 
          data: null, 
          error: new Error('No prompt assignment found for today') 
        }
      }

      console.log('Found prompt for', today, ':', assignment.daily_prompts.prompt_text)
      return { data: assignment.daily_prompts, error: null }

    } catch (error) {
      console.error('Error in getTodaysPrompt:', error)
      return { data: null, error }
    }
  },

  // Check if user has responded today
  getUserTodaysResponse: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const today = DailyAPI.getCurrentDailyDate()
      
      const { data, error } = await supabase
        .from('user_daily_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('assignment_date', today)
        .maybeSingle()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Submit daily response
submitDailyResponse: async (userId, promptId, responseText, isShared = false) => {
  try {
    if (!userId || !promptId || !responseText?.trim()) {
      throw new Error('User ID, prompt ID, and response text are required')
    }

    // FIXED: Use the assignment date that corresponds to this prompt_id
    // instead of calculating "today" at submission time
    const { data: assignment, error: assignmentError } = await supabase
      .from('daily_prompt_assignments')
      .select('assignment_date')
      .eq('prompt_id', promptId)
      .order('assignment_date', { ascending: false })
      .limit(1)
      .single()

    if (assignmentError || !assignment) {
      throw new Error('Could not find assignment date for this prompt')
    }

    const { data, error } = await supabase
      .from('user_daily_responses')
      .insert({
        user_id: userId,
        assignment_date: assignment.assignment_date, // Use the actual assignment date
        prompt_id: promptId,
        response_text: responseText.trim(),
        is_shared_publicly: isShared
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
},

  // Get shared responses for today
  getTodaysSharedResponses: async () => {
    try {
      const today = DailyAPI.getCurrentDailyDate()

      const { data, error } = await supabase
        .from('user_daily_responses')
        .select(`
          response_text,
          created_at,
          users!inner(display_name, username)
        `)
        .eq('assignment_date', today)
        .eq('is_shared_publicly', true)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}