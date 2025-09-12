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

      // Count this week's wanders
      const weeklyQueries = [
        supabase.from('user_responses').select('created_at').eq('user_id', userId).gte('created_at', weekStart.toISOString()),
        supabase.from('user_daily_responses').select('created_at').eq('user_id', userId).gte('created_at', weekStart.toISOString()),
        supabase.from('mate_responses').select('created_at').eq('user_id', userId).gte('created_at', weekStart.toISOString())
      ]

      // Count all-time wanders
      const allTimeQueries = [
        supabase.from('user_responses').select('created_at').eq('user_id', userId),
        supabase.from('user_daily_responses').select('created_at').eq('user_id', userId),
        supabase.from('mate_responses').select('created_at').eq('user_id', userId)
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

      // Calculate distances (minutes * 100mph/60min)
      const weeklyMinutes = (weeklyCounts.daily * 2) + (weeklyCounts.solo * 3) + (weeklyCounts.mates * 4)
      const weeklyMiles = (weeklyMinutes * 100) / 60

      const allTimeMinutes = (allTimeCounts.daily * 2) + (allTimeCounts.solo * 3) + (allTimeCounts.mates * 4)
      const allTimeMiles = (allTimeMinutes * 100) / 60

      // Randomly choose weekly or all-time
      const showWeekly = Math.random() < 0.5
      const distance = showWeekly ? weeklyMiles : allTimeMiles
      const period = showWeekly ? 'weekly' : 'total'

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