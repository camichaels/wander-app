// services/matesAPI.js - COMPLETE VERSION WITH VIEW TRACKING
import { supabase } from './supabase'

export const MatesAPI = {
  // Helper function to get current date in Pacific Time
  getCurrentDailyDate: () => {
    const now = new Date()
    const ptTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    return ptTime.toISOString().split('T')[0]
  },

  // Get all users for invitations (excluding current mates)
  getAvailableUsers: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Getting available users for:', userId)

      // Get users who aren't already mates
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('user_id, username, display_name, email')
        .neq('user_id', userId)
        .order('username')

      if (usersError) {
        console.error('=== Users query error:', usersError)
        throw usersError
      }

      // Get existing mate relationships to filter out
      const { data: existingMates, error: matesError } = await supabase
        .from('wander_mates')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .in('status', ['active', 'pending'])

      if (matesError) {
        console.error('=== Mates query error:', matesError)
        throw matesError
      }

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

      console.log('=== Available users result:', availableUsers.length)
      return { data: availableUsers, error: null }
    } catch (error) {
      console.error('=== getAvailableUsers error:', error)
      return { data: null, error }
    }
  },

  // Send mate invitation
  sendMateInvitation: async (userId, inviteeId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Sending mate invitation from:', userId, 'to:', inviteeId)

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

      if (relationshipError) {
        console.error('=== Invitation creation error:', relationshipError)
        throw relationshipError
      }

      console.log('=== Invitation created:', relationship)
      return { data: relationship, error: null }
    } catch (error) {
      console.error('=== sendMateInvitation error:', error)
      return { data: null, error }
    }
  },

  // Get pending invitations (sent and received)
  getPendingInvitations: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Getting pending invitations for:', userId)

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

      if (sentError) {
        console.error('=== Sent invites query error:', sentError)
        throw sentError
      }

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

      if (receivedError) {
        console.error('=== Received invites query error:', receivedError)
        throw receivedError
      }

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

      console.log('=== Pending invitations result:', { sent: sent.length, received: received.length })
      return { 
        data: { sent, received, all: [...sent, ...received] }, 
        error: null 
      }
    } catch (error) {
      console.error('=== getPendingInvitations error:', error)
      return { data: null, error }
    }
  },

  // Accept mate invitation
  acceptMateInvitation: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Accepting mate invitation:', relationshipId, 'by user:', userId)

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

      if (error) {
        console.error('=== Accept invitation error:', error)
      } else {
        console.log('=== Invitation accepted:', data)
      }

      return { data, error }
    } catch (error) {
      console.error('=== acceptMateInvitation error:', error)
      return { data: null, error }
    }
  },

  // Reject mate invitation
  rejectMateInvitation: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Rejecting mate invitation:', relationshipId, 'by user:', userId)

      const { data, error } = await supabase
        .from('wander_mates')
        .delete()
        .eq('relationship_id', relationshipId)
        .eq('user2_id', userId) // Only the invitee can reject

      if (error) {
        console.error('=== Reject invitation error:', error)
      } else {
        console.log('=== Invitation rejected')
      }

      return { data, error }
    } catch (error) {
      console.error('=== rejectMateInvitation error:', error)
      return { data: null, error }
    }
  },

  // Get active mates and handle resets per relationship - prevent duplicates
  getActiveMates: async (userId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Getting active mates for user:', userId)

      const { data: relationships, error: relationshipsError } = await supabase
        .from('wander_mates')
        .select(`
          relationship_id,
          user1_id,
          user2_id,
          status,
          last_activity_at,
          user1:users!wander_mates_user1_id_fkey(user_id, username, display_name, email),
          user2:users!wander_mates_user2_id_fkey(user_id, username, display_name, email)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false })

      if (relationshipsError) {
        console.error('=== Relationships query error:', relationshipsError)
        throw relationshipsError
      }

      console.log('=== Found relationships:', relationships?.length || 0)

      // Check for resets first, ONCE per relationship
      if (relationships && relationships.length > 0) {
        console.log('=== Checking for resets on', relationships.length, 'relationships')
        
        // Process resets sequentially to avoid race conditions
        for (const relationship of relationships) {
          try {
            const resetResult = await MatesAPI.checkAndResetRelationship(relationship.relationship_id)
            if (resetResult.resetCount > 0) {
              console.log(`=== Reset ${resetResult.resetCount} wanders for relationship ${relationship.relationship_id}`)
            }
          } catch (resetError) {
            console.warn('Reset failed for relationship', relationship.relationship_id, ':', resetError)
          }
        }
      }

      // For each relationship, get the current status
      const matesWithStatus = await Promise.all(
        (relationships || []).map(async (relationship) => {
          try {
            console.log('=== Processing relationship:', relationship.relationship_id)
            
            const isUser1 = relationship.user1_id === userId
            const mate = isUser1 ? { ...relationship.user2 } : { ...relationship.user1 }
            
            // Get latest active shared wander for this relationship
            console.log('=== Fetching shared wanders for relationship:', relationship.relationship_id)
            
            const { data: sharedWanders, error: wanderError } = await supabase
              .from('shared_wanders')
              .select(`
                shared_wander_id,
                status,
                created_at,
                both_responded_at,
                prompt_id
              `)
              .eq('mate_relationship_id', relationship.relationship_id)
              .neq('status', 'reset')
              .is('reset_scheduled_for', null)
              .order('created_at', { ascending: false })
              .limit(1)

            console.log('=== Shared wanders query result:', { data: sharedWanders, error: wanderError })

            if (wanderError) {
              console.error('=== Shared wanders query error details:', wanderError)
              return null
            }

            const latestWander = sharedWanders?.[0]
            let status = 'ready' // Default status when no active wanders
            let prompt = null
            let yourResponse = null
            let theirResponse = null
            let sharedReactions = []

            if (latestWander) {
              console.log('=== Processing latest wander:', latestWander.shared_wander_id)
              
              // Get the prompt text
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
                    console.error('=== Prompt fetch error:', promptError)
                    prompt = 'Unable to load prompt'
                  }
                } catch (promptFetchError) {
                  console.error('=== Prompt fetch exception:', promptFetchError)
                  prompt = 'Unable to load prompt'
                }
              }
              
              // Get responses separately to avoid join issues
              const { data: responses, error: responsesError } = await supabase
                .from('mate_responses')
                .select('mate_response_id, user_id, response_text, created_at')
                .eq('shared_wander_id', latestWander.shared_wander_id)

              console.log('=== Responses query result:', { data: responses, error: responsesError })

              if (responsesError) {
                console.error('=== Responses query error:', responsesError)
              }

              // Get messages separately to avoid join issues
              const { data: messages, error: messagesError } = await supabase
                .from('mate_chat_messages')
                .select('message_id, user_id, message_text, created_at')
                .eq('shared_wander_id', latestWander.shared_wander_id)

              console.log('=== Messages query result:', { data: messages, error: messagesError })

              if (messagesError) {
                console.error('=== Messages query error:', messagesError)
              }
              
              // Find responses
              const myResponse = responses?.find(r => r.user_id === userId)
              const theirResponseObj = responses?.find(r => r.user_id !== userId)
              
              yourResponse = myResponse?.response_text || null
              theirResponse = theirResponseObj?.response_text || null

              // Transform chat messages to reactions
              sharedReactions = (messages || []).map(msg => ({
                author: msg.user_id === userId ? 'You' : (mate.display_name || mate.username),
                content: msg.message_text,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }))

              // Determine status
              if (!myResponse && !theirResponseObj) {
                status = 'waiting_for_you'
              } else if (myResponse && !theirResponseObj) {
                status = 'waiting_for_them'
              } else if (!myResponse && theirResponseObj) {
                status = 'waiting_for_you'
              } else if (myResponse && theirResponseObj) {
                status = 'reacting'
                
                // FIXED: Mark as completed with correct status
                if (!latestWander.both_responded_at) {
                  try {
                    await SharedWandersAPI.markCompleted(latestWander.shared_wander_id)
                  } catch (markError) {
                    console.warn('Failed to mark completed:', markError)
                  }
                }
              }
            }

            const result = {
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
              currentSharedWanderId: latestWander?.shared_wander_id || null
            }

            console.log('=== Processed mate result:', result)
            return result
          } catch (error) {
            console.error('=== Error processing mate relationship:', relationship.relationship_id, error)
            return null
          }
        })
      )

      // Filter out any null results from errors
      const validMates = matesWithStatus.filter(mate => mate !== null)

      console.log('=== Final mates result:', validMates.length, 'valid mates')
      return { data: validMates, error: null }
    } catch (error) {
      console.error('=== getActiveMates error:', error)
      return { data: null, error }
    }
  },

  // Check and reset relationships based on view tracking
  checkAndResetRelationship: async (relationshipId) => {
    try {
      const currentDate = MatesAPI.getCurrentDailyDate()
      
      console.log('=== Checking reset for relationship:', relationshipId, 'current date:', currentDate)
      
      // FIRST: Let's see ALL shared wanders for this relationship to debug
      const { data: allWanders, error: allWandersError } = await supabase
        .from('shared_wanders')
        .select(`
          shared_wander_id,
          both_responded_at,
          user1_viewed_reveal_at,
          user2_viewed_reveal_at,
          status,
          created_at,
          reset_scheduled_for
        `)
        .eq('mate_relationship_id', relationshipId)
        .order('created_at', { ascending: false })

      if (allWandersError) {
        console.warn('Error getting all wanders:', allWandersError)
      } else {
        console.log('=== ALL wanders for relationship:', allWanders?.length || 0)
        allWanders?.forEach(wander => {
          console.log('=== Wander:', {
            id: wander.shared_wander_id,
            status: wander.status,
            both_responded_at: wander.both_responded_at,
            user1_viewed_reveal_at: wander.user1_viewed_reveal_at,
            user2_viewed_reveal_at: wander.user2_viewed_reveal_at,
            reset_scheduled_for: wander.reset_scheduled_for,
            created_at: wander.created_at
          })
        })
      }
      
      // Find wanders where both users have viewed the reveal (not just responded)
      const { data: respondedWanders, error: respondedError } = await supabase
        .from('shared_wanders')
        .select(`
          shared_wander_id,
          both_responded_at,
          user1_viewed_reveal_at,
          user2_viewed_reveal_at,
          status,
          created_at
        `)
        .eq('mate_relationship_id', relationshipId)
        .not('both_responded_at', 'is', null)
        .not('user1_viewed_reveal_at', 'is', null)
        .not('user2_viewed_reveal_at', 'is', null)
        .is('reset_scheduled_for', null)

      if (respondedError) {
        console.warn('Error checking for responded wanders:', respondedError)
        return { resetCount: 0 }
      }

      console.log('=== Found wanders with both viewed reveal:', respondedWanders?.length || 0)
      
      // Log details of found wanders for debugging
      if (respondedWanders && respondedWanders.length > 0) {
        respondedWanders.forEach(wander => {
          console.log('=== Both-viewed wander details:', {
            id: wander.shared_wander_id,
            status: wander.status,
            both_responded_at: wander.both_responded_at,
            user1_viewed_reveal_at: wander.user1_viewed_reveal_at,
            user2_viewed_reveal_at: wander.user2_viewed_reveal_at,
            created_at: wander.created_at
          })
        })
      }

      let resetCount = 0

      // Reset wanders that were viewed by both users yesterday or earlier (daily reset after both have seen)
      for (const wander of respondedWanders || []) {
        // Use the later of the two view timestamps to determine when both had seen it
        const user1ViewDate = new Date(wander.user1_viewed_reveal_at)
        const user2ViewDate = new Date(wander.user2_viewed_reveal_at)
        const bothViewedDate = user1ViewDate > user2ViewDate ? user1ViewDate : user2ViewDate
        const bothViewedDateStr = bothViewedDate.toISOString().split('T')[0]
        
        console.log('=== Wander', wander.shared_wander_id, 'both viewed by:', bothViewedDateStr, 'vs current:', currentDate)
        
        if (bothViewedDateStr < currentDate) {
          console.log(`=== Resetting wander ${wander.shared_wander_id} (both users viewed on ${bothViewedDateStr})`)
          
          // Clear old data first
          const deleteResponses = await supabase.from('mate_responses').delete().eq('shared_wander_id', wander.shared_wander_id)
          const deleteMessages = await supabase.from('mate_chat_messages').delete().eq('shared_wander_id', wander.shared_wander_id)
          
          if (deleteResponses.error) console.warn('Error deleting responses:', deleteResponses.error)
          if (deleteMessages.error) console.warn('Error deleting messages:', deleteMessages.error)
          
          // Delete the wander itself
          const deleteWander = await supabase
            .from('shared_wanders')
            .delete()
            .eq('shared_wander_id', wander.shared_wander_id)
          
          if (deleteWander.error) {
            console.error('=== Delete wander error:', deleteWander.error)
            continue
          }
          
          console.log(`=== Successfully reset (deleted) wander ${wander.shared_wander_id}`)
          resetCount++
        } else {
          console.log(`=== Wander ${wander.shared_wander_id} both viewed today (${bothViewedDateStr}), keeping until tomorrow`)
        }
      }
      
      console.log('=== Reset completed, count:', resetCount)
      return { resetCount }
    } catch (error) {
      console.error('Error in checkAndResetRelationship:', error)
      return { resetCount: 0 }
    }
  },

  // End mate relationship - comprehensive cleanup
  endMateRelationship: async (userId, relationshipId) => {
    try {
      if (!userId) throw new Error('User ID required')

      console.log('=== Ending mate relationship:', relationshipId, 'by user:', userId)

      // Get all shared wanders for this relationship
      const { data: sharedWanders, error: wandersQueryError } = await supabase
        .from('shared_wanders')
        .select('shared_wander_id')
        .eq('mate_relationship_id', relationshipId)

      if (wandersQueryError) {
        console.warn('Error querying shared wanders:', wandersQueryError)
      }

      const sharedWanderIds = sharedWanders?.map(w => w.shared_wander_id) || []

      // Delete all chat messages for these shared wanders
      if (sharedWanderIds.length > 0) {
        await supabase
          .from('mate_chat_messages')
          .delete()
          .in('shared_wander_id', sharedWanderIds)

        // Delete all responses for these shared wanders
        await supabase
          .from('mate_responses')
          .delete()
          .in('shared_wander_id', sharedWanderIds)
      }

      // Delete prompt usage tracking
      await supabase
        .from('mate_relationship_prompts')
        .delete()
        .eq('relationship_id', relationshipId)

      // Delete all shared wanders
      await supabase
        .from('shared_wanders')
        .delete()
        .eq('mate_relationship_id', relationshipId)

      // Finally, delete the mate relationship itself
      const { data, error } = await supabase
        .from('wander_mates')
        .delete()
        .eq('relationship_id', relationshipId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      if (error) {
        console.error('=== End relationship error:', error)
        throw error
      }

      console.log('=== Relationship ended successfully')
      return { data, error: null }
    } catch (error) {
      console.error('=== endMateRelationship error:', error)
      return { data: null, error }
    }
  }
}

export const SharedWandersAPI = {
  // Create a new shared wander with simplified prompt selection
  createSharedWander: async (mateRelationshipId) => {
    try {
      if (!mateRelationshipId) {
        throw new Error('Mate relationship ID is required')
      }

      console.log('=== Creating shared wander for relationship:', mateRelationshipId)

    // ADD THIS CHECK HERE:
    const { data: existingWander } = await supabase
      .from('shared_wanders')
      .select('shared_wander_id')
      .eq('mate_relationship_id', mateRelationshipId)
      .neq('status', 'reset')
      .is('reset_scheduled_for', null)
      .single()

    if (existingWander) {
      console.log('=== Found existing wander, returning:', existingWander.shared_wander_id)
      return { data: existingWander, error: null }
    }
    // END OF NEW CODE

      // Get a random available prompt (simplified approach)
      const promptResult = await MatePromptsAPI.getRandomPrompt(mateRelationshipId)
      
      if (promptResult.error || !promptResult.data) {
        console.error('=== No available prompts found:', promptResult.error)
        throw new Error('No available prompts found')
      }

      const promptId = promptResult.data.prompt_id

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
        console.error('=== Create shared wander error:', error)
        throw error
      }

      // Track prompt usage
      try {
        await MatePromptsAPI.trackPromptUsage(mateRelationshipId, promptId)
      } catch (trackingError) {
        console.warn('Failed to track prompt usage:', trackingError)
      }

      console.log('=== Shared wander created:', data)
      return { data, error: null }
    } catch (error) {
      console.error('=== createSharedWander error:', error)
      return { data: null, error }
    }
  },

  // Submit response to a shared wander
  submitResponse: async (userId, sharedWanderId, responseText) => {
    try {
      if (!userId) throw new Error('User ID required')
      if (!sharedWanderId) throw new Error('Shared wander ID required')
      if (!responseText?.trim()) throw new Error('Response text required')

      console.log('=== Submitting response for user:', userId, 'to wander:', sharedWanderId)

      // Insert the response
      const { data: responseData, error: insertError } = await supabase
        .from('mate_responses')
        .insert({
          shared_wander_id: sharedWanderId,
          user_id: userId,
          response_text: responseText.trim()
        })
        .select()
        .single()

      if (insertError) {
        console.error('=== Submit response error:', insertError)
        throw insertError
      }

      console.log('=== Response submitted:', responseData)

      // Check if both users have now responded
      const { data: allResponses, error: checkError } = await supabase
        .from('mate_responses')
        .select('user_id, mate_response_id')
        .eq('shared_wander_id', sharedWanderId)

      if (checkError) {
        console.warn('Failed to check response count:', checkError)
      } else if (allResponses && allResponses.length >= 2) {
        const uniqueUsers = new Set(allResponses.map(r => r.user_id))
        
        if (uniqueUsers.size >= 2) {
          console.log('=== Both users responded, marking as complete')
          try {
            await SharedWandersAPI.markCompleted(sharedWanderId)
          } catch (markError) {
            console.error('Error marking completed:', markError)
          }
        }
      }

      return { data: responseData, error: null }
    } catch (error) {
      console.error('=== submitResponse error:', error)
      return { data: null, error }
    }
  },

  // Mark when both users have responded - use correct "complete" status
  markCompleted: async (sharedWanderId) => {
    try {
      console.log('=== Marking completed for wander:', sharedWanderId)
      
      const { data, error } = await supabase
        .from('shared_wanders')
        .update({ 
          both_responded_at: new Date().toISOString(),
          status: 'complete' // Fixed: use 'complete' not 'completed'
        })
        .eq('shared_wander_id', sharedWanderId)
        .select()
        .single()

      if (error) {
        console.error('=== Mark completed error:', error)
      } else {
        console.log('=== Completed marked successfully')
      }

      return { data, error }
    } catch (error) {
      console.error('=== markCompleted error:', error)
      return { data: null, error }
    }
  },

  // Add reaction/message to shared wander
  addReaction: async (userId, sharedWanderId, messageText) => {
    try {
      if (!userId) throw new Error('User ID required')
      if (!sharedWanderId) throw new Error('Shared wander ID required')
      if (!messageText?.trim()) throw new Error('Message text required')

      console.log('=== Adding reaction for user:', userId, 'to wander:', sharedWanderId)

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

      if (error) {
        console.error('=== Add reaction error:', error)
      } else {
        console.log('=== Reaction added successfully')
      }

      return { data, error }
    } catch (error) {
      console.error('=== addReaction error:', error)
      return { data: null, error }
    }
  },

  // Mark when a user has viewed the reveal page
  markUserViewedReveal: async (userId, sharedWanderId) => {
    try {
      if (!userId) throw new Error('User ID required')
      if (!sharedWanderId) throw new Error('Shared wander ID required')

      console.log('=== Marking user viewed reveal:', userId, 'for wander:', sharedWanderId)
      
      // Get the relationship to determine if user is user1 or user2
      const { data: wanderData, error: wanderError } = await supabase
        .from('shared_wanders')
        .select(`
          mate_relationship_id,
          wander_mates!inner(user1_id, user2_id)
        `)
        .eq('shared_wander_id', sharedWanderId)
        .single()
      
      if (wanderError || !wanderData) {
        console.error('=== Error getting wander relationship:', wanderError)
        return { data: null, error: wanderError || new Error('Wander not found') }
      }
      
      const relationship = wanderData.wander_mates
      const isUser1 = relationship.user1_id === userId
      const fieldToUpdate = isUser1 ? 'user1_viewed_reveal_at' : 'user2_viewed_reveal_at'
      
      // Only update if not already set (avoid unnecessary updates)
      const { data: currentData } = await supabase
        .from('shared_wanders')
        .select(fieldToUpdate)
        .eq('shared_wander_id', sharedWanderId)
        .single()
      
      if (currentData && currentData[fieldToUpdate]) {
        console.log('=== User already viewed reveal, skipping update')
        return { data: currentData, error: null }
      }
      
      const { data, error } = await supabase
        .from('shared_wanders')
        .update({ [fieldToUpdate]: new Date().toISOString() })
        .eq('shared_wander_id', sharedWanderId)
        .select()
        .single()
      
      if (error) {
        console.error('=== Mark viewed reveal error:', error)
      } else {
        console.log('=== User viewed reveal marked successfully')
      }

      return { data, error }
    } catch (error) {
      console.error('=== markUserViewedReveal error:', error)
      return { data: null, error }
    }
  }
}

export const MatePromptsAPI = {
  // SIMPLIFIED: Get random prompt avoiding recent repeats
  getRandomPrompt: async (relationshipId) => {
    try {
      if (!relationshipId) {
        throw new Error('Relationship ID is required')
      }

      console.log('=== Getting random prompt for relationship:', relationshipId)

      // Get prompts used by this relationship in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: usedPrompts, error: usedError } = await supabase
        .from('mate_relationship_prompts')
        .select('prompt_id')
        .eq('relationship_id', relationshipId)
        .gte('created_at', thirtyDaysAgo)
      
      if (usedError) {
        console.warn('Error getting used prompts:', usedError)
      }

      const usedIds = usedPrompts?.map(p => p.prompt_id) || []
      console.log('=== Used prompt IDs in last 30 days:', usedIds.length)
      
      // Get available prompts (excluding recently used)
      let query = supabase
        .from('mate_prompts')
        .select('prompt_id, prompt_text')
        .eq('is_active', true)
      
      if (usedIds.length > 0) {
        query = query.not('prompt_id', 'in', `(${usedIds.join(',')})`)
      }
      
      const { data: availablePrompts, error } = await query
      
      if (error) {
        console.error('=== Available prompts query error:', error)
        throw error
      }
      
      // If no unused prompts, use any active prompt
      if (!availablePrompts || availablePrompts.length === 0) {
        console.log('=== No unused prompts, getting any active prompt')
        const { data: allPrompts, error: allError } = await supabase
          .from('mate_prompts')
          .select('prompt_id, prompt_text')
          .eq('is_active', true)
        
        if (allError) {
          console.error('=== All prompts query error:', allError)
          throw allError
        }
        
        if (!allPrompts || allPrompts.length === 0) {
          throw new Error('No mate prompts available')
        }
        
        const randomPrompt = allPrompts[Math.floor(Math.random() * allPrompts.length)]
        console.log('=== Selected random prompt (from all):', randomPrompt.prompt_id)
        return { data: randomPrompt, error: null }
      }
      
      // Return random available prompt
      const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
      console.log('=== Selected random prompt (unused):', randomPrompt.prompt_id)
      return { data: randomPrompt, error: null }

    } catch (error) {
      console.error('=== getRandomPrompt error:', error)
      return { data: null, error }
    }
  },

  // Track that a prompt has been used by a relationship
  trackPromptUsage: async (relationshipId, promptId) => {
    try {
      if (!relationshipId) throw new Error('Relationship ID required')
      if (!promptId) throw new Error('Prompt ID required')

      console.log('=== Tracking prompt usage:', promptId, 'for relationship:', relationshipId)

      const { data, error } = await supabase
        .from('mate_relationship_prompts')
        .insert({
          relationship_id: relationshipId,
          prompt_id: promptId
        })

      if (error) {
        console.error('=== Track prompt usage error:', error)
      } else {
        console.log('=== Prompt usage tracked successfully')
      }

      return { data, error }
    } catch (error) {
      console.error('=== trackPromptUsage error:', error)
      return { data: null, error }
    }
  }
}