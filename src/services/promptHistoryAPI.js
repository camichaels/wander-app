// src/services/promptHistoryAPI.js - Updated with expansion functionality
import { supabase } from './supabase'

export class PromptHistoryAPI {
  // Search and retrieve prompt history with expansions
  static async searchPromptHistory({
    userId,
    searchText = null,
    favoritesOnly = false,
    categoryId = null,
    promptType = null,
    sortBy = 'created_at',
    sortDirection = 'DESC',
    limit = 50,
    offset = 0
  } = {}) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase.rpc('search_prompt_history', {
        p_user_id: userId,
        p_search_text: searchText,
        p_favorites_only: favoritesOnly,
        p_category_id: categoryId,
        p_prompt_type: promptType,
        p_sort_by: sortBy,
        p_sort_direction: sortDirection,
        p_limit: limit,
        p_offset: offset
      })

      if (error) throw error

      // Get expansions for each history item
      const historyWithExpansions = await Promise.all((data || []).map(async (item) => {
        const expansion = await this.getExpansionForHistory(item.id)
        return {
          ...item,
          expansion: expansion.data
        }
      }))

      return { data: historyWithExpansions, error: null }
    } catch (error) {
      console.error('Error searching prompt history:', error)
      return { data: null, error }
    }
  }

  // Get expansion types
  static async getExpansionTypes() {
    try {
      const { data, error } = await supabase
        .from('expansion_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching expansion types:', error)
      return { data: null, error }
    }
  }

  // Get random prompts for an expansion type
  static async getRandomExpansionPrompts(expansionTypeId) {
    try {
      const { data, error } = await supabase.rpc('get_random_expansion_prompts', {
        p_expansion_type_id: expansionTypeId
      })

      if (error) throw error
      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Error fetching random expansion prompts:', error)
      return { data: null, error }
    }
  }

  // Create a new expansion
  static async createExpansion(userId, expansionData) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('prompt_expansions')
        .insert({
          user_id: userId,
          ...expansionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating expansion:', error)
      return { data: null, error }
    }
  }

  // Update an existing expansion
  static async updateExpansion(expansionId, userId, updates) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('prompt_expansions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('expansion_id', expansionId)
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating expansion:', error)
      return { data: null, error }
    }
  }

  // Get expansion for a specific history item
  static async getExpansionForHistory(historyId) {
    try {
      const { data, error } = await supabase
        .from('prompt_expansions')
        .select(`
          *,
          expansion_type:expansion_types(type_name, display_name),
          initial_prompt:expansion_prompts!initial_prompt_id(prompt_text),
          tieup_prompt:expansion_prompts!tieup_prompt_id(prompt_text)
        `)
        .eq('prompt_history_id', historyId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data: error?.code === 'PGRST116' ? null : data, error: null }
    } catch (error) {
      console.error('Error fetching expansion for history:', error)
      return { data: null, error }
    }
  }

  // Toggle favorite status
  static async toggleFavorite(historyId, userId) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase.rpc('toggle_prompt_favorite', {
        p_history_id: historyId,
        p_user_id: userId
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { data: null, error }
    }
  }

  // Update a prompt history entry
  static async updatePromptHistory(historyId, userId, updates) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('prompt_history')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', historyId)
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating prompt history:', error)
      return { data: null, error }
    }
  }

  // Delete a prompt history entry (expansions will be deleted via CASCADE)
  static async deletePromptHistory(historyId, userId) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deleting prompt history:', error)
      return { data: null, error }
    }
  }

  // Get available categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, category_name, display_name, color_theme')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { data: null, error }
    }
  }

  // Manually create a prompt history entry (for cases where trigger doesn't catch it)
  static async createPromptHistory(userId, promptData) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('prompt_history')
        .insert({
          user_id: userId,
          ...promptData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating prompt history:', error)
      return { data: null, error }
    }
  }

  // Create a user response (which will trigger the prompt_history creation automatically)
  static async createUserResponse(userId, responseData) {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('user_responses')
        .insert({
          user_id: userId,
          ...responseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating user response:', error)
      return { data: null, error }
    }
  }
}