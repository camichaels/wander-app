// services/brainDistanceAPI.js
import { supabase } from './supabase'

export const BrainDistanceAPI = {
  // Get brain distance data for a user
  getBrainDistance: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Get current week start (Sunday)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      weekStart.setHours(0, 0, 0, 0)

      // Count this week's wanders - FIXED: Use prompt_history for all response types
      const weeklyQueries = [
        // Solo responses are in prompt_history table with prompt_type = 'solo'
        supabase.from('prompt_history').select('created_at').eq('user_id', userId).eq('prompt_type', 'solo').gte('created_at', weekStart.toISOString()),
        // Daily responses are in user_daily_responses table
        supabase.from('user_daily_responses').select('created_at').eq('user_id', userId).gte('created_at', weekStart.toISOString()),
        // Mate responses are ALSO in prompt_history table with prompt_type = 'mate'
        supabase.from('prompt_history').select('created_at').eq('user_id', userId).eq('prompt_type', 'mate').gte('created_at', weekStart.toISOString())
      ]

      // Count all-time wanders - FIXED: Use prompt_history for all response types
      const allTimeQueries = [
        // Solo responses are in prompt_history table with prompt_type = 'solo'
        supabase.from('prompt_history').select('created_at').eq('user_id', userId).eq('prompt_type', 'solo'),
        // Daily responses are in user_daily_responses table
        supabase.from('user_daily_responses').select('created_at').eq('user_id', userId),
        // Mate responses are ALSO in prompt_history table with prompt_type = 'mate'
        supabase.from('prompt_history').select('created_at').eq('user_id', userId).eq('prompt_type', 'mate')
      ]

      const [weeklyResults, allTimeResults] = await Promise.all([
        Promise.all(weeklyQueries),
        Promise.all(allTimeQueries)
      ])

      // Calculate counts
      const weeklyCounts = {
        solo: weeklyResults[0].data?.length || 0,
        daily: weeklyResults[1].data?.length || 0,
        mates: weeklyResults[2].data?.length || 0
      }

      const allTimeCounts = {
        solo: allTimeResults[0].data?.length || 0,
        daily: allTimeResults[1].data?.length || 0,
        mates: allTimeResults[2].data?.length || 0
      }

      // Debug logging to help troubleshoot
      console.log('Weekly counts:', weeklyCounts)
      console.log('All-time counts:', allTimeCounts)

      // Calculate distances (minutes * 100mph/60min)
      const weeklyMinutes = (weeklyCounts.daily * 2) + (weeklyCounts.solo * 3) + (weeklyCounts.mates * 4)
      const weeklyMiles = (weeklyMinutes * 100) / 60

      const allTimeMinutes = (allTimeCounts.daily * 2) + (allTimeCounts.solo * 3) + (allTimeCounts.mates * 4)
      const allTimeMiles = (allTimeMinutes * 100) / 60

      // Randomly choose weekly or all-time
      const showWeekly = Math.random() < 0.5
      const distance = showWeekly ? weeklyMiles : allTimeMiles
      const period = showWeekly ? 'weekly' : 'total'

      console.log('Brain distance calculation:', {
        weeklyMinutes,
        weeklyMiles,
        allTimeMinutes,
        allTimeMiles,
        showing: period,
        finalDistance: distance
      })

      return {
        data: {
          distance: Math.round(distance * 10) / 10, // One decimal place
          period,
          weeklyMiles,
          totalMiles: allTimeMiles
        },
        error: null
      }
    } catch (error) {
      console.error('Error calculating brain distance:', error)
      return { data: null, error }
    }
  }
}