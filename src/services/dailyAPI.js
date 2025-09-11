// services/dailyAPI.js - FIXED VERSION with consistent date handling
import { supabase } from './supabase'

export const DailyAPI = {
  // Helper function to get current date in Pacific Time with 3 AM boundary
  getCurrentDailyDate: () => {
    try {
      // Use Intl.DateTimeFormat for reliable timezone conversion
      const now = new Date()
      
      // Get current time in PT timezone
      const ptFormatter = new Intl.DateTimeFormat('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        hour12: false
      })
      
      const ptParts = ptFormatter.formatToParts(now)
      const ptHour = parseInt(ptParts.find(part => part.type === 'hour').value)
      const ptYear = ptParts.find(part => part.type === 'year').value
      const ptMonth = ptParts.find(part => part.type === 'month').value
      const ptDay = ptParts.find(part => part.type === 'day').value
      
      console.log('PT Hour:', ptHour)
      console.log('Is before 3 AM PT?', ptHour < 3)
      
      // Start with today's PT date
      let targetDate = new Date(`${ptYear}-${ptMonth}-${ptDay}`)
      
      // If before 3 AM PT, use yesterday
      if (ptHour < 3) {
        console.log('Before 3 AM PT: using yesterday for daily prompt')
        targetDate.setDate(targetDate.getDate() - 1)
      } else {
        console.log('After 3 AM PT: using today for daily prompt')
      }
      
      // Return in YYYY-MM-DD format
      const result = targetDate.toISOString().split('T')[0]
      console.log('Final date result:', result)
      
      return result
    } catch (error) {
      console.error('Error in getCurrentDailyDate:', error)
      // Fallback to simple date if timezone logic fails
      return new Date().toISOString().split('T')[0]
    }
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

  // Submit daily response - FIXED to use consistent date calculation
  submitDailyResponse: async (userId, promptId, responseText, isShared = false) => {
    try {
      if (!userId || !promptId || !responseText?.trim()) {
        throw new Error('User ID, prompt ID, and response text are required')
      }

      // Use consistent date calculation instead of prompt assignment lookup
      const today = DailyAPI.getCurrentDailyDate()

      const { data, error } = await supabase
        .from('user_daily_responses')
        .insert({
          user_id: userId,
          assignment_date: today, // Use calculated date, not prompt assignment date
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