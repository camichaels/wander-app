// services/matesAPI.js - Enhanced version with comprehensive data purging and daily reset support
import { supabase } from './supabase'

export const MatesAPI = {
  // Helper function to get the current "daily date" based on 3 AM PT boundary (same as DailyAPI)
  getCurrentDailyDate: () => {
    const now = new Date()
    
    // Create a date in PT (Pacific Time)
    // PT is UTC-8 in standard time, UTC-7 in daylight time
    const ptTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    
    // If it's before 3 AM PT, use yesterday's date
    if (ptTime.getHours() < 3) {
      ptTime.setDate(ptTime.getDate() - 1)
    }
    
    // Return YYYY-MM-DD format
    return ptTime.toISOString().split('T')[0]
  },

  // Auto-reset mate relationships that completed yesterday (should be called on app load)
  checkAndResetCompletedMates: async () => {
    try {
      const currentDailyDate = MatesAPI.getCurrentDailyDate()
      
      // Find all shared wanders where both users responded and it's time to reset
      const { data: completedWanders, error: wandersError } = await supabase
        .from('shared_wanders')
        .select(`
          shared_wander_id,
          mate_relationship_id,
          both_responded_at,
          status
        `)
        .eq('status', 'both_responded')
        .not('both_responded_at', 'is', null)
        .is('reset_scheduled_for', null)

      if (wandersError) throw wandersError

      const wandersToReset = []
      
      // Check each completed wander to see if it should be reset
      for (const wander of completedWanders || []) {
        const bothRespondedDate = new Date(wander.both_responded_at).toISOString().split('T')[0]
        
        // If they both responded on a previous daily date, it's time to reset
        if (bothRespondedDate < currentDailyDate) {
          wandersToReset.push(wander)
        }
      }

      // Reset each qualifying relationship
      for (const wander of wandersToReset) {
        try {
          await MatesAPI.resetMateRelationship(wander.mate_relationship_id, wander.shared_wander_id)
        } catch (resetError) {
          console.error(`Failed to reset mate relationship ${wander.mate_relationship_id}:`, resetError)
        }
      }

      return { data: { resetCount: wandersToReset.length }, error: null }
    } catch (error) {
      console.error('Error in checkAndResetCompletedMates:', error)
      return { data: null, error }
    }
  },

  // Reset a specific mate relationship (create new shared wander, clear old data)
  resetMateRelationship: async (relationshipId, oldSharedWanderId) => {
    try {
      // Step 1: Mark the old shared wander as reset
      const { error: markResetError } = await supabase
        .from('shared_wanders')
        .update({ 
          reset_scheduled_for: new Date().toISOString(),
          status: 'reset'
        })
        .eq('shared_wander_id', oldSharedWanderId)

      if (markResetError) throw markResetError

      // Step 2: Clear chat messages for the old wander
      const { error: messagesError } = await supabase
        .from('mate_chat_messages')
        .delete()
        .eq('shared_wander_id', oldSharedWanderId)

      if (messagesError) console.warn('Error clearing chat messages:', messagesError)

      // Step 3: Clear responses for the old wander  
      const { error: responsesError } = await supabase
        .from('mate_responses')
        .delete()
        .eq('shared_wander_id', oldSharedWanderId)

      if (responsesError) console.warn('Error clearing responses:', responsesError)

      // Step 4: Create a new shared wander with a fresh prompt
      const newWanderResult = await SharedWandersAPI.createSharedWander(relationshipId)
      
      if (newWanderResult.error) {
        throw new Error(`Failed to create new shared wander: ${newWanderResult.error.message}`)
      }

      // Step 5: Update the mate relationship's activity timestamp and increment reset count
      const { error: updateRelationshipError } = await supabase
        .from('wander_mates')
        .update({
          last_activity_at: new Date().toISOString(),
          current_cycle_started_at: new Date().toISOString(),
          reset_count: supabase.raw('reset_count + 1')
        })
        .eq('relationship_id', relationshipId)

      if (updateRelationshipError) console.warn('Error updating relationship:', updateRelationshipError)

      return { data: { newSharedWanderId: newWanderResult.data.shared_wander_id }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get all users for invitations (excluding current mates)
  getAvailableUsers: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Get users who aren't already mates
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('user_id, username, display_name, email')
        .neq('user_id', userId)
        .order('username')

      if (usersError) throw usersError

      // Get existing mate relationships to filter out
      const { data: existingMates, error: matesError } = await supabase
        .from('wander_mates')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .in('status', ['active', 'pending'])

      if (matesError) throw matesError

      // Filter out existing mates
      const existingMateIds = new Set()
      existingMates?.forEach(mate => {
        if (mate.user1_id === userId) {
          existingMateIds.add(mate.user2_id)
        } else {
          existingMateIds.add(mate.user1_id)
        }
      })

      const availableUsers = allUsers?.filter(user => 
        !existingMateIds.has(user.user_id)
      ) || []

      return { data: availableUsers, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Send mate invitation
  sendMateInvitation: async (userId, inviteeId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Create the wander_mates relationship with pending status
      const { data: relationship, error: relationshipError } = await supabase
        .from('wander_mates')
        .insert({
          user1_id: userId,
          user2_id: inviteeId,
          status: 'pending'
        })
        .select(`
          relationship_id,
          status,
          user2:users!wander_mates_user2_id_fkey(user_id, username, display_name, email)
        `)
        .single()

      if (relationshipError) throw relationshipError

      // Create notification for the invitee
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: inviteeId,
          type: 'mate_invitation',
          title: 'New Mate Invitation',
          message: `New mate invitation received!`,
          related_id: relationship.relationship_id
        })

      if (notificationError) console.warn('Failed to create notification:', notificationError)

      return { data: relationship, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get pending invitations (sent and received)
  getPendingInvitations: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Get invitations I sent
      const { data: sentInvites, error: sentError } = await supabase
        .from('wander_mates')
        .select(`
          relationship_id,
          status,
          created_at,
          user2:users!wander_mates_user2_id_fkey(user_id, username, display_name, email)
        `)
        .eq('user1_id', userId)
        .eq('status', 'pending')

      if (sentError) throw sentError

      // Get invitations I received
      const { data: receivedInvites, error: receivedError } = await supabase
        .from('wander_mates')
        .select(`
          relationship_id,
          status,
          created_at,
          user1:users!wander_mates_user1_id_fkey(user_id, username, display_name, email)
        `)
        .eq('user2_id', userId)
        .eq('status', 'pending')

      if (receivedError) throw receivedError

      // Transform data for UI
      const sent = sentInvites?.map(invite => ({
        id: invite.relationship_id,
        name: invite.user2.display_name || invite.user2.username,
        email: invite.user2.email,
        type: 'outgoing',
        created_at: invite.created_at
      })) || []

      const received = receivedInvites?.map(invite => ({
        id: invite.relationship_id,
        name: invite.user1.display_name || invite.user1.username,
        email: invite.user1.email,
        type: 'incoming',
        created_at: invite.created_at
      })) || []

      return { 
        data: { sent, received, all: [...sent, ...received] }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Accept mate invitation
  acceptMateInvitation: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('wander_mates')
        .update({ 
          status: 'active',
          last_activity_at: new Date().toISOString(),
          current_cycle_started_at: new Date().toISOString()
        })
        .eq('relationship_id', relationshipId)
        .eq('user2_id', userId) // Only the invitee can accept
        .select(`
          relationship_id,
          status,
          user1:users!wander_mates_user1_id_fkey(user_id, username, display_name, email)
        `)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Reject mate invitation
  rejectMateInvitation: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('wander_mates')
        .delete()
        .eq('relationship_id', relationshipId)
        .eq('user2_id', userId) // Only the invitee can reject

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get active mates with their current status
  getActiveMates: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // First, check for any relationships that need to be reset
      await MatesAPI.checkAndResetCompletedMates()

      const { data: relationships, error: relationshipsError } = await supabase
        .from('wander_mates')
        .select(`
          relationship_id,
          user1_id,
          user2_id,
          status,
          current_prompt_id,
          last_activity_at,
          reset_count,
          current_cycle_started_at,
          user1:users!wander_mates_user1_id_fkey(user_id, username, display_name, email),
          user2:users!wander_mates_user2_id_fkey(user_id, username, display_name, email)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })

      if (relationshipsError) throw relationshipsError

      // For each relationship, get the current shared wander status
      const matesWithStatus = await Promise.all(
        (relationships || []).map(async (relationship) => {
          try {
            const isUser1 = relationship.user1_id === userId
            const mate = isUser1 ? { ...relationship.user2 } : { ...relationship.user1 }

            // Get latest active shared wander for this relationship (not reset)
            const { data: sharedWanders, error: wanderError } = await supabase
              .from('shared_wanders')
              .select(`
                shared_wander_id,
                status,
                created_at,
                reveal_date,
                both_responded_at,
                reset_scheduled_for,
                prompt_id,
                responses:mate_responses(mate_response_id, user_id, response_text, created_at, is_revealed),
                messages:mate_chat_messages(message_id, user_id, message_text, created_at)
              `)
              .eq('mate_relationship_id', relationship.relationship_id)
              .neq('status', 'reset') // Exclude reset wanders
              .is('reset_scheduled_for', null) // Only get active (non-reset) wanders
              .order('created_at', { ascending: false })
              .limit(1)

            if (wanderError) {
              console.warn('Error fetching shared wanders:', wanderError)
              return null
            }

            const latestWander = sharedWanders?.[0]
            let status = 'ready' // Default status when no active wanders
            let prompt = null
            let yourResponse = null
            let theirResponse = null
            let sharedReactions = []

            if (latestWander) {
              // Get the prompt text with better error handling
              if (latestWander.prompt_id) {
                try {
                  const { data: promptData, error: promptError } = await supabase
                    .from('mate_prompts')
                    .select('prompt_text')
                    .eq('prompt_id', latestWander.prompt_id)
                    .single()
                  
                  if (!promptError && promptData) {
                    prompt = promptData.prompt_text
                  } else {
                    prompt = 'Unable to load prompt'
                  }
                } catch (promptFetchError) {
                  prompt = 'Unable to load prompt'
                }
              }
              
              // Find responses
              const responses = latestWander.responses || []
              const myResponse = responses.find(r => r.user_id === userId)
              const theirResponseObj = responses.find(r => r.user_id !== userId)
              
              yourResponse = myResponse?.response_text || null
              theirResponse = theirResponseObj?.response_text || null

              // Transform chat messages to reactions
              const messages = latestWander.messages || []
              sharedReactions = messages.map(msg => ({
                author: msg.user_id === userId ? 'You' : (mate.display_name || mate.username),
                content: msg.message_text,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }))

              // Determine status based on responses
              if (!myResponse && !theirResponseObj) {
                status = 'waiting_for_you' // New prompt, waiting for first response
              } else if (myResponse && !theirResponseObj) {
                status = 'waiting_for_them' // I responded, waiting for them
              } else if (!myResponse && theirResponseObj) {
                status = 'waiting_for_you' // They responded, waiting for me
              } else if (myResponse && theirResponseObj) {
                status = 'reacting' // Both responded, can now react
              }
            }

            return {
              id: relationship.relationship_id,
              name: mate.display_name || mate.username,
              email: mate.email,
              mate_id: mate.user_id,
              status,
              prompt,
              yourResponse,
              theirResponse,
              sharedReactions,
              lastActivity: relationship.last_activity_at,
              currentSharedWanderId: latestWander?.shared_wander_id || null,
              resetCount: relationship.reset_count || 0
            }
          } catch (error) {
            console.error('Error processing mate relationship:', error)
            return null
          }
        })
      )

      // Filter out any null results from errors
      const validMates = matesWithStatus.filter(mate => mate !== null)

      return { data: validMates, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // End mate relationship - COMPREHENSIVE DATA PURGING
  endMateRelationship: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Step 1: Get all shared wanders for this relationship
      const { data: sharedWanders, error: wandersQueryError } = await supabase
        .from('shared_wanders')
        .select('shared_wander_id')
        .eq('mate_relationship_id', relationshipId)

      if (wandersQueryError) {
        console.warn('Error querying shared wanders:', wandersQueryError)
      }

      const sharedWanderIds = sharedWanders?.map(w => w.shared_wander_id) || []

      // Step 2: Delete all chat messages for these shared wanders
      if (sharedWanderIds.length > 0) {
        const { error: messagesError } = await supabase
          .from('mate_chat_messages')
          .delete()
          .in('shared_wander_id', sharedWanderIds)

        if (messagesError) {
          console.warn('Error deleting chat messages:', messagesError)
        }

        // Step 3: Delete all responses for these shared wanders
        const { error: responsesError } = await supabase
          .from('mate_responses')
          .delete()
          .in('shared_wander_id', sharedWanderIds)

        if (responsesError) {
          console.warn('Error deleting responses:', responsesError)
        }
      }

      // Step 4: Delete prompt usage tracking
      const { error: promptTrackingError } = await supabase
        .from('mate_relationship_prompts')
        .delete()
        .eq('relationship_id', relationshipId)

      if (promptTrackingError) {
        console.warn('Error deleting prompt tracking:', promptTrackingError)
      }

      // Step 5: Delete all shared wanders
      const { error: wandersError } = await supabase
        .from('shared_wanders')
        .delete()
        .eq('mate_relationship_id', relationshipId)

      if (wandersError) {
        console.warn('Error deleting shared wanders:', wandersError)
      }

      // Step 6: Delete any notifications related to this relationship
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('related_id', relationshipId)

      if (notificationError) {
        console.warn('Error deleting notifications:', notificationError)
      }

      // Step 7: Finally, delete the mate relationship itself
      const { data, error } = await supabase
        .from('wander_mates')
        .delete()
        .eq('relationship_id', relationshipId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const SharedWandersAPI = {
  // Create a new shared wander (start a new prompt exchange)
  createSharedWander: async (mateRelationshipId, promptId = null) => {
    try {
      if (!mateRelationshipId) {
        throw new Error('Mate relationship ID is required')
      }

      // If no prompt provided, get an available one
      if (!promptId) {
        const promptResult = await MatePromptsAPI.getAvailablePrompt(mateRelationshipId)
        
        // Enhanced error checking
        if (promptResult.error) {
          throw new Error(`Failed to get prompt: ${promptResult.error.message}`)
        }
        
        if (!promptResult.data || !Array.isArray(promptResult.data) || promptResult.data.length === 0) {
          throw new Error('No available prompts returned from database')
        }

        const promptData = promptResult.data[0]
        if (!promptData || !promptData.prompt_id) {
          throw new Error('Invalid prompt data structure')
        }

        promptId = promptData.prompt_id
      }

      if (!promptId) {
        throw new Error('Could not determine prompt ID')
      }

      // Create the shared wander
      const { data, error } = await supabase
        .from('shared_wanders')
        .insert({
          mate_relationship_id: mateRelationshipId,
          prompt_id: promptId,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create shared wander: ${error.message}`)
      }

      // Track prompt usage
      try {
        await MatePromptsAPI.trackPromptUsage(mateRelationshipId, promptId)
      } catch (trackingError) {
        console.warn('Failed to track prompt usage:', trackingError)
        // Don't fail the whole operation for tracking
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Submit response to a shared wander
  submitResponse: async (userId, sharedWanderId, responseText) => {
    try {
      if (!userId) throw new Error('User ID required')
      if (!sharedWanderId) throw new Error('Shared wander ID required')
      if (!responseText?.trim()) throw new Error('Response text required')

      const { data, error } = await supabase
        .from('mate_responses')
        .insert({
          shared_wander_id: sharedWanderId,
          user_id: userId,
          response_text: responseText.trim()
        })
        .select()
        .single()

      if (error) throw error

      // Check if both users have now responded
      const { data: responses, error: checkError } = await supabase
        .from('mate_responses')
        .select('user_id')
        .eq('shared_wander_id', sharedWanderId)

      if (checkError) {
        console.warn('Failed to check response count:', checkError)
      } else if (responses && responses.length === 2) {
        // If we now have 2 responses (both users responded), mark the timestamp
        try {
          await SharedWandersAPI.markBothResponded(sharedWanderId)
        } catch (markError) {
          console.warn('Failed to mark both responded:', markError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark when both users have responded (triggers reset countdown)
  markBothResponded: async (sharedWanderId) => {
    try {
      const { data, error } = await supabase
        .from('shared_wanders')
        .update({ 
          both_responded_at: new Date().toISOString(),
          status: 'both_responded' 
        })
        .eq('shared_wander_id', sharedWanderId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Add reaction/message to shared wander
  addReaction: async (userId, sharedWanderId, messageText) => {
    try {
      if (!userId) throw new Error('User ID required')
      if (!sharedWanderId) throw new Error('Shared wander ID required')
      if (!messageText?.trim()) throw new Error('Message text required')

      const { data, error } = await supabase
        .from('mate_chat_messages')
        .insert({
          shared_wander_id: sharedWanderId,
          user_id: userId,
          message_text: messageText.trim(),
          message_type: 'text'
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const MatePromptsAPI = {
  // Get available prompt for a relationship (respecting 30-day cooldown)
  getAvailablePrompt: async (relationshipId) => {
    try {
      if (!relationshipId) {
        throw new Error('Relationship ID is required')
      }

      const { data, error } = await supabase
        .rpc('get_available_mate_prompt', { rel_id: relationshipId })

      if (error) {
        throw new Error(`RPC call failed: ${error.message}`)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Track that a prompt has been used by a relationship
  trackPromptUsage: async (relationshipId, promptId) => {
    try {
      if (!relationshipId) throw new Error('Relationship ID required')
      if (!promptId) throw new Error('Prompt ID required')

      const { data, error } = await supabase
        .from('mate_relationship_prompts')
        .insert({
          relationship_id: relationshipId,
          prompt_id: promptId
        })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}