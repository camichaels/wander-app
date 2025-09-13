// soloAPI.js - Service for handling solo prompts and responses
// Place this file in your services folder alongside promptHistoryAPI.js and dailyAPI.js

import { supabase } from './supabase'

export const SoloAPI = {
  
  /**
   * Get all active solo prompts from the database
   * @returns {Object} { data: prompts[], error: null } or { data: null, error: Error }
   */
  async getAllActivePrompts() {
    try {
      const { data, error } = await supabase
        .from('solo_prompts')
        .select('prompt_id, prompt_text, preview_text, hint_text, difficulty_level, usage_count')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching solo prompts:', error)
        return { data: null, error }
      }

      return { data: data || [], error: null }
    } catch (err) {
      console.error('Error in getAllActivePrompts:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Update usage count for a specific prompt
   * @param {string} promptId - UUID of the prompt
   * @returns {Object} { data: updated_prompt, error: null } or { data: null, error: Error }
   */
  async incrementUsageCount(promptId) {
    try {
      // First get current usage count
      const { data: currentPrompt, error: fetchError } = await supabase
        .from('solo_prompts')
        .select('usage_count')
        .eq('prompt_id', promptId)
        .single()

      if (fetchError) {
        console.error('Error fetching current usage count:', fetchError)
        return { data: null, error: fetchError }
      }

      const newUsageCount = (currentPrompt?.usage_count || 0) + 1

      // Update with new count
      const { data, error } = await supabase
        .from('solo_prompts')
        .update({ usage_count: newUsageCount })
        .eq('prompt_id', promptId)
        .select()
        .single()

      if (error) {
        console.error('Error updating usage count:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error in incrementUsageCount:', err)
      return { data: null, error: err }
    }
  }
}