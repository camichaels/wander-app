// services/matesAPI.js - DEBUG VERSION with console logs
import { supabase } from './supabase'

export const MatesAPI = {
  // Get all users for invitations (excluding current mates)
  getAvailableUsers: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      // Get users who aren't already mates (removed is_demo_user filter)
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

      console.log('🔍 DEBUG: Getting active mates for user:', userId)

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

      console.log('🔍 DEBUG: Found relationships:', relationships?.length || 0)

      // For each relationship, get the current shared wander status
      const matesWithStatus = await Promise.all(
        (relationships || []).map(async (relationship) => {
          try {
            const isUser1 = relationship.user1_id === userId
            const mate = isUser1 ? { ...relationship.user2 } : { ...relationship.user1 }

            console.log('🔍 DEBUG: Processing mate relationship:', relationship.relationship_id, 'with mate:', mate.username)

            // Get latest shared wander for this relationship (not reset)
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
              .is('reset_scheduled_for', null) // Only get active (non-reset) wanders
              .order('created_at', { ascending: false })
              .limit(1)

            if (wanderError) {
              console.warn('❌ DEBUG: Error fetching shared wanders:', wanderError)
              return null
            }

            console.log('🔍 DEBUG: Found shared wanders:', sharedWanders?.length || 0)

            const latestWander = sharedWanders?.[0]
            let status = 'ready' // Default status when no active wanders
            let prompt = null
            let yourResponse = null
            let theirResponse = null
            let sharedReactions = []

            if (latestWander) {
              console.log('🔍 DEBUG: Latest wander ID:', latestWander.shared_wander_id, 'Prompt ID:', latestWander.prompt_id)

              // Get the prompt text separately with better error handling
              if (latestWander.prompt_id) {
                try {
                  console.log('🔍 DEBUG: Fetching prompt text for ID:', latestWander.prompt_id)
                  
                  const { data: promptData, error: promptError } = await supabase
                    .from('mate_prompts')
                    .select('prompt_text')
                    .eq('prompt_id', latestWander.prompt_id)
                    .single()
                  
                  console.log('🔍 DEBUG: Prompt fetch result:', { promptData, promptError })
                  
                  if (!promptError && promptData) {
                    prompt = promptData.prompt_text
                    console.log('✅ DEBUG: Successfully got prompt:', prompt)
                  } else {
                    console.warn('❌ DEBUG: Error fetching prompt:', promptError)
                    prompt = 'Unable to load prompt'
                  }
                } catch (promptFetchError) {
                  console.warn('❌ DEBUG: Exception in prompt fetch:', promptFetchError)
                  prompt = 'Unable to load prompt'
                }
              } else {
                console.warn('❌ DEBUG: No prompt_id found in shared wander')
                prompt = 'No prompt ID available'
              }
              
              // Find responses
              const responses = latestWander.responses || []
              const myResponse = responses.find(r => r.user_id === userId)
              const theirResponseObj = responses.find(r => r.user_id !== userId)
              
              yourResponse = myResponse?.response_text || null
              theirResponse = theirResponseObj?.response_text || null

              console.log('🔍 DEBUG: Response status - Mine:', !!myResponse, 'Theirs:', !!theirResponseObj)

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

              console.log('🔍 DEBUG: Final status:', status)
            } else {
              console.log('🔍 DEBUG: No shared wanders found - status will be "ready"')
            }

            const mateResult = {
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

            console.log('✅ DEBUG: Final mate object:', JSON.stringify(mateResult, null, 2))
            return mateResult

          } catch (error) {
            console.error('❌ DEBUG: Error processing mate relationship:', error)
            return null
          }
        })
      )

      // Filter out any null results from errors
      const validMates = matesWithStatus.filter(mate => mate !== null)

      console.log('✅ DEBUG: Final valid mates count:', validMates.length)
      return { data: validMates, error: null }
    } catch (error) {
      console.error('❌ DEBUG: Error in getActiveMates:', error)
      return { data: null, error }
    }
  },

  // End mate relationship - COMPREHENSIVE DATA PURGING
  endMateRelationship: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('🧹 Starting comprehensive data purge for relationship:', relationshipId)

      // Step 1: Get all shared wanders for this relationship
      const { data: sharedWanders, error: wandersQueryError } = await supabase
        .from('shared_wanders')
        .select('shared_wander_id')
        .eq('mate_relationship_id', relationshipId)

      if (wandersQueryError) {
        console.warn('Error querying shared wanders:', wandersQueryError)
      }

      const sharedWanderIds = sharedWanders?.map(w => w.shared_wander_id) || []
      console.log('🔍 Found shared wanders to delete:', sharedWanderIds.length)

      // Step 2: Delete all chat messages for these shared wanders
      if (sharedWanderIds.length > 0) {
        const { error: messagesError } = await supabase
          .from('mate_chat_messages')
          .delete()
          .in('shared_wander_id', sharedWanderIds)

        if (messagesError) {
          console.warn('Error deleting chat messages:', messagesError)
        } else {
          console.log('💬 Deleted all chat messages')
        }

        // Step 3: Delete all responses for these shared wanders
        const { error: responsesError } = await supabase
          .from('mate_responses')
          .delete()
          .in('shared_wander_id', sharedWanderIds)

        if (responsesError) {
          console.warn('Error deleting responses:', responsesError)
        } else {
          console.log('📝 Deleted all responses')
        }
      }

      // Step 4: Delete prompt usage tracking
      const { error: promptTrackingError } = await supabase
        .from('mate_relationship_prompts')
        .delete()
        .eq('relationship_id', relationshipId)

      if (promptTrackingError) {
        console.warn('Error deleting prompt tracking:', promptTrackingError)
      } else {
        console.log('📊 Deleted prompt usage tracking')
      }

      // Step 5: Delete all shared wanders
      const { error: wandersError } = await supabase
        .from('shared_wanders')
        .delete()
        .eq('mate_relationship_id', relationshipId)

      if (wandersError) {
        console.warn('Error deleting shared wanders:', wandersError)
      } else {
        console.log('🎯 Deleted all shared wanders')
      }

      // Step 6: Delete any notifications related to this relationship
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('related_id', relationshipId)

      if (notificationError) {
        console.warn('Error deleting notifications:', notificationError)
      } else {
        console.log('🔔 Deleted related notifications')
      }

      // Step 7: Finally, delete the mate relationship itself
      const { data, error } = await supabase
        .from('wander_mates')
        .delete()
        .eq('relationship_id', relationshipId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      if (error) {
        console.error('❌ Error deleting mate relationship:', error)
        throw error
      }

      console.log('✅ Complete data purge successful - clean slate for future reconnection')
      return { data, error: null }
    } catch (error) {
      console.error('💥 Error in comprehensive data purge:', error)
      return { data: null, error }
    }
  }
}

export const SharedWandersAPI = {
  // Create a new shared wander (start a new prompt exchange)
  createSharedWander: async (mateRelationshipId, promptId = null) => {
    try {
      console.log('🔍 DEBUG: Creating shared wander for relationship:', mateRelationshipId)

      // If no prompt provided, get an available one
      if (!promptId) {
        console.log('🔍 DEBUG: No prompt ID provided, getting available prompt')
        const promptResult = await MatePromptsAPI.getAvailablePrompt(mateRelationshipId)
        console.log('🔍 DEBUG: Available prompt result:', promptResult)
        
        if (promptResult.error || !promptResult.data) {
          throw new Error('No available prompts for this relationship')
        }
        promptId = promptResult.data.prompt_id
        console.log('🔍 DEBUG: Got prompt ID:', promptId)
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

      console.log('🔍 DEBUG: Shared wander creation result:', { data, error })

      if (error) throw error

      // Track prompt usage
      await MatePromptsAPI.trackPromptUsage(mateRelationshipId, promptId)

      return { data, error: null }
    } catch (error) {
      console.error('❌ DEBUG: Error creating shared wander:', error)
      return { data: null, error }
    }
  },

  // Submit response to a shared wander
  submitResponse: async (userId, sharedWanderId, responseText) => {
    try {
      if (!userId) throw new Error('User ID required')

      const { data, error } = await supabase
        .from('mate_responses')
        .insert({
          shared_wander_id: sharedWanderId,
          user_id: userId,
          response_text: responseText
        })
        .select()
        .single()

      if (error) throw error

      // Check if both users have now responded
      const { data: responses, error: checkError } = await supabase
        .from('mate_responses')
        .select('user_id')
        .eq('shared_wander_id', sharedWanderId)

      if (checkError) throw checkError

      // If we now have 2 responses (both users responded), mark the timestamp
      if (responses && responses.length === 2) {
        await SharedWandersAPI.markBothResponded(sharedWanderId)
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

      const { data, error } = await supabase
        .from('mate_chat_messages')
        .insert({
          shared_wander_id: sharedWanderId,
          user_id: userId,
          message_text: messageText,
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
      console.log('🔍 DEBUG: Getting available prompt for relationship:', relationshipId)
      const { data, error } = await supabase
        .rpc('get_available_mate_prompt', { rel_id: relationshipId })

      console.log('🔍 DEBUG: Available prompt RPC result:', { data, error })
      return { data, error }
    } catch (error) {
      console.error('❌ DEBUG: Error in getAvailablePrompt:', error)
      return { data: null, error }
    }
  },

  // Track that a prompt has been used by a relationship
  trackPromptUsage: async (relationshipId, promptId) => {
    try {
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