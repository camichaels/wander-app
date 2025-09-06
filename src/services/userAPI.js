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
      if (!userId) {
        throw new Error('User ID is required')
      }

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
      if (!userData || !userData.username || !userData.displayName || !userData.email) {
        throw new Error('Username, display name, and email are required')
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username.trim(),
          display_name: userData.displayName.trim(),
          email: userData.email.trim().toLowerCase(),
          phone: userData.phone?.trim() || null,
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
      if (!userId) {
        throw new Error('User ID is required')
      }

      if (!userData || !userData.username || !userData.displayName || !userData.email) {
        throw new Error('Username, display name, and email are required')
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          username: userData.username.trim(),
          display_name: userData.displayName.trim(),
          email: userData.email.trim().toLowerCase(),
          phone: userData.phone?.trim() || null
        })
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete user and all related data (CASCADE handles related records)
  deleteUser: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      // CASCADE delete will handle related records, so don't expect single row back
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Check if username is available
  checkUsernameAvailable: async (username, excludeUserId = null) => {
    try {
      if (!username || !username.trim()) {
        return { available: false, error: new Error('Username is required') }
      }

      let query = supabase
        .from('users')
        .select('user_id')
        .eq('username', username.trim())

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
      if (!email || !email.trim()) {
        return { available: false, error: new Error('Email is required') }
      }

      let query = supabase
        .from('users')
        .select('user_id')
        .eq('email', email.trim().toLowerCase())

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

  // Utility function to validate user data
  validateUserData: (userData) => {
    const errors = {}

    if (!userData.username || userData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username.trim())) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!userData.displayName || userData.displayName.trim().length < 1) {
      errors.displayName = 'Display name is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!userData.email || !emailRegex.test(userData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (userData.phone && userData.phone.trim() && !/^[\d\s\-\(\)]{10,}$/.test(userData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}