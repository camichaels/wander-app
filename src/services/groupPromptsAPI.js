// src/services/groupPromptsAPI.js
import { supabase } from './supabase'

export class GroupPromptsAPI {
  // Get random group prompt with weighted selection to avoid overused prompts
  static async getRandomPrompt(mode = null, excludeIds = []) {
    try {
      let query = supabase
        .from('group_prompts')
        .select('prompt_id, prompt_text, mode, usage_count')
        .eq('is_active', true)
        
      // Filter by mode if specified
      if (mode) {
        query = query.eq('mode', mode)
      }
      
      // Exclude recently shown prompts if provided
      if (excludeIds.length > 0) {
        query = query.not('prompt_id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data: prompts, error } = await query

      if (error) throw error
      if (!prompts || prompts.length === 0) {
        throw new Error('No prompts available')
      }

      // Weighted selection - bias toward lower usage_count
      const weightedPrompts = prompts.map(prompt => ({
        ...prompt,
        weight: Math.max(1, 100 - (prompt.usage_count || 0))
      }))

      const totalWeight = weightedPrompts.reduce((sum, p) => sum + p.weight, 0)
      let random = Math.random() * totalWeight
      
      for (const prompt of weightedPrompts) {
        random -= prompt.weight
        if (random <= 0) {
          return { data: prompt, error: null }
        }
      }

      // Fallback to first prompt if something goes wrong
      return { data: weightedPrompts[0], error: null }
    } catch (error) {
      console.error('Error fetching random group prompt:', error)
      return { data: null, error }
    }
  }

  // Increment usage count when prompt is generated
  static async incrementUsageCount(promptId) {
    try {
      const { data, error } = await supabase
        .from('group_prompts')
        .update({ 
          usage_count: supabase.raw('usage_count + 1')
        })
        .eq('prompt_id', promptId)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error incrementing usage count:', error)
      return { data: null, error }
    }
  }

  // Get all prompts for a specific mode (useful for debugging/admin)
  static async getPromptsByMode(mode) {
    try {
      const { data, error } = await supabase
        .from('group_prompts')
        .select('prompt_id, prompt_text, usage_count')
        .eq('mode', mode)
        .eq('is_active', true)
        .order('usage_count', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching prompts by mode:', error)
      return { data: null, error }
    }
  }
}