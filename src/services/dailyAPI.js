// services/dailyAPI.js
import { supabase } from './supabase'

export const DailyAPI = {
  // Get today's prompt - consistent daily prompt for all users
  getTodaysPrompt: async (userId = null) => {
    try {
      // Get today's date and create a more robust daily seed
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1 // getMonth() returns 0-11
      const day = today.getDate()
      
      // Create a more varied seed using year + month + day
      const dateSeed = year * 10000 + month * 100 + day // e.g., 20250905
      
      // Get all active prompts
      const { data: allPrompts, error } = await supabase
        .from('daily_prompts')
        .select('prompt_id, prompt_text, created_at')
        .eq('is_active', true)
        .order('prompt_id')

      if (error) throw error

      if (!allPrompts || allPrompts.length === 0) {
        return { data: null, error: new Error('No daily prompts available in database') }
      }

      // Use date seed to pick the same prompt for everyone today
      const todayIndex = dateSeed % allPrompts.length
      
      return { data: allPrompts[todayIndex], error: null }

    } catch (error) {
      return { data: null, error }
    }
  },

  // Check if user has responded today
  getUserTodaysResponse: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const today = new Date().toISOString().split('T')[0]
      
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

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('user_daily_responses')
        .insert({
          user_id: userId,
          assignment_date: today,
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
      const today = new Date().toISOString().split('T')[0]

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
  },

  // Get available daily prompts count (for debugging)
  getAvailablePromptsCount: async (userId = null) => {
    try {
      let query = supabase
        .from('daily_prompts')
        .select('prompt_id', { count: 'exact' })
        .eq('is_active', true)

      if (userId) {
        // This is a simplified count - for exact filtering, use getTodaysPrompt logic
        const { data: usedCount, error: usedError } = await supabase
          .from('prompt_history')
          .select('prompt_text', { count: 'exact' })
          .eq('user_id', userId)
          .eq('prompt_type', 'daily')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (usedError) {
          console.warn('Error counting used prompts:', usedError)
        }

        const { count: totalCount, error } = await query
        const usedCountNumber = usedCount || 0

        return {
          data: {
            total: totalCount,
            used_recently: usedCountNumber,
            available: Math.max(0, totalCount - usedCountNumber)
          },
          error
        }
      }

      const { count, error } = await query
      return { data: { total: count, available: count }, error }

    } catch (error) {
      return { data: null, error }
    }
  }
}