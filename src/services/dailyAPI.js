// services/dailyAPI.js
import { supabase } from './supabase'

export const DailyAPI = {
  // Get today's prompt
  getTodaysPrompt: async () => {
    try {
      const { data, error } = await supabase.rpc('get_todays_daily_prompt')
      return { data: data?.[0] || null, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Check if user has responded today
  getUserTodaysResponse: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_daily_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('assignment_date', new Date().toISOString().split('T')[0])
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Submit daily response
  submitDailyResponse: async (userId, promptId, responseText, isShared) => {
    try {
      const { data, error } = await supabase
        .from('user_daily_responses')
        .insert({
          user_id: userId,
          assignment_date: new Date().toISOString().split('T')[0],
          prompt_id: promptId,
          response_text: responseText,
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
      const { data, error } = await supabase
        .from('user_daily_responses')
        .select(`
          response_text,
          created_at,
          users(display_name, username)
        `)
        .eq('assignment_date', new Date().toISOString().split('T')[0])
        .eq('is_shared_publicly', true)
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}