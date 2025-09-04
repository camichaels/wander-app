// services/userAPI.js - User profile and authentication management
import { supabase } from './supabase'

export const UserAPI = {
  // Get all users for selection dropdown
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, username, display_name, email')
        .order('display_name')

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get current user profile
  getCurrentUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          display_name: userData.displayName,
          email: userData.email,
          phone: userData.phone || null,
          auth_method: 'demo',
          is_demo_user: false,
          onboarding_completed: true
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          username: userData.username,
          display_name: userData.displayName,
          email: userData.email,
          phone: userData.phone || null
        })
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete user and all related data
  deleteUser: async (userId) => {
    try {
      // Note: This will cascade delete related data due to foreign key constraints
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Check if username is available
  checkUsernameAvailable: async (username, excludeUserId = null) => {
    try {
      let query = supabase
        .from('users')
        .select('user_id')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error
      
      return { available: data.length === 0, error: null }
    } catch (error) {
      return { available: false, error }
    }
  },

  // Check if email is available
  checkEmailAvailable: async (email, excludeUserId = null) => {
    try {
      let query = supabase
        .from('users')
        .select('user_id')
        .eq('email', email)

      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error
      
      return { available: data.length === 0, error: null }
    } catch (error) {
      return { available: false, error }
    }
  }
}