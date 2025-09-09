import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'
import { MatesAPI, SharedWandersAPI, MatePromptsAPI } from '../services/matesAPI'
import { supabase } from '../services/supabase'

const WanderMates = ({ navigate, currentUser }) => {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedMate, setSelectedMate] = useState(null)
  const [userResponse, setUserResponse] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [selectedExistingUser, setSelectedExistingUser] = useState('')
  const [showMateMenu, setShowMateMenu] = useState(null)
  const [showStopConfirm, setShowStopConfirm] = useState(null)
  const [reactionText, setReactionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real data state
  const [availableUsers, setAvailableUsers] = useState([])
  const [mates, setMates] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [currentUser])

  // Track when users view the reveal page
  useEffect(() => {
    if (currentView === 'reveal' && selectedMate?.currentSharedWanderId && currentUser?.id) {
      // Mark that this user has viewed the reveal
      SharedWandersAPI.markUserViewedReveal(currentUser.id, selectedMate.currentSharedWanderId)
    }
  }, [currentView, selectedMate?.currentSharedWanderId, currentUser?.id])

  // SIMPLIFIED: Basic polling for active conversations only
  useEffect(() => {
    if (!currentUser?.id) return

    let interval
    
    if ((currentView === 'reveal' || currentView === 'waiting') && selectedMate) {
      // Poll for updates in active conversations
      interval = setInterval(async () => {
        try {
          const matesResult = await MatesAPI.getActiveMates(currentUser.id)
          if (!matesResult.error && matesResult.data) {
            const updatedMate = matesResult.data.find(m => m.id === selectedMate.id)
            if (updatedMate) {
              const hasChanges = updatedMate.status !== selectedMate.status ||
                                updatedMate.sharedReactions?.length !== selectedMate.sharedReactions?.length ||
                                updatedMate.theirResponse !== selectedMate.theirResponse
              
              if (hasChanges) {
                setSelectedMate(updatedMate)
                setMates(prev => prev.map(m => 
                  m.id === selectedMate.id ? updatedMate : m
                ))
                
                if (updatedMate.status === 'reacting' && currentView === 'waiting') {
                  setCurrentView('reveal')
                }
              }
            }
            setMates(matesResult.data)
          }
        } catch (error) {
          console.warn('Background polling error:', error)
        }
      }, 20000) // Poll every 20 seconds
      
    } else if (currentView === 'dashboard') {
      // Less frequent polling for dashboard updates
      interval = setInterval(async () => {
        try {
          const [matesResult, invitesResult, usersResult] = await Promise.all([
            MatesAPI.getActiveMates(currentUser.id),
            MatesAPI.getPendingInvitations(currentUser.id),
            MatesAPI.getAvailableUsers(currentUser.id)
          ])
          
          if (!matesResult.error && matesResult.data) {
            setMates(matesResult.data)
          }
          
          if (!invitesResult.error && invitesResult.data) {
            setPendingInvites(invitesResult.data.all || [])
          }

          if (!usersResult.error && usersResult.data) {
            setAvailableUsers(usersResult.data)
          }
        } catch (error) {
          console.warn('Dashboard polling error:', error)
        }
      }, 30000) // Poll every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentView, selectedMate, currentUser, mates])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!currentUser?.id) {
        setError('Please sign in to view your mates')
        setLoading(false)
        return
      }

      // Load all data in parallel
      const [matesResult, invitesResult, usersResult] = await Promise.all([
        MatesAPI.getActiveMates(currentUser.id),
        MatesAPI.getPendingInvitations(currentUser.id),
        MatesAPI.getAvailableUsers(currentUser.id)
      ])

      if (matesResult.error) throw new Error('Failed to load mates: ' + matesResult.error.message)
      if (invitesResult.error) throw new Error('Failed to load invites: ' + invitesResult.error.message)
      if (usersResult.error) throw new Error('Failed to load users: ' + usersResult.error.message)

      setMates(matesResult.data || [])
      setPendingInvites(invitesResult.data?.all || [])
      setAvailableUsers(usersResult.data || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'waiting_for_you': return { text: 'Your turn to wander', color: '#059669', bg: '#ecfdf5' }
      case 'waiting_for_them': return { text: 'Waiting for their response', color: '#d97706', bg: '#fef3c7' }
      case 'ready_to_reveal': 
      case 'reacting': return { text: 'Share a reaction', color: '#7c3aed', bg: '#f3e8ff' }
      case 'ready': return { text: 'New wander available', color: '#2563eb', bg: '#dbeafe' }
      default: return { text: 'New wander available', color: '#6b7280', bg: '#f9fafb' }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Today'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const handleMateClick = async (mate) => {
    setSelectedMate(mate)
    setShowMateMenu(null)
    
    if (mate.status === 'waiting_for_you') {
      // If no current shared wander, create a new one
      if (!mate.currentSharedWanderId) {
        try {
          const wanderResult = await SharedWandersAPI.createSharedWander(mate.id)
          
          if (wanderResult.error) {
            throw new Error('Failed to create shared wander: ' + wanderResult.error.message)
          }
          
          // Get the prompt from the created shared wander
          const { data: sharedWander, error: fetchError } = await supabase
            .from('shared_wanders')
            .select(`
              shared_wander_id,
              prompt_id,
              mate_prompts!inner(prompt_text)
            `)
            .eq('shared_wander_id', wanderResult.data.shared_wander_id)
            .single()
          
          if (fetchError) {
            throw new Error('Failed to load prompt details: ' + fetchError.message)
          }
          
          // Update mate with new prompt and shared wander ID
          const updatedMate = {
            ...mate,
            prompt: sharedWander.mate_prompts?.prompt_text || 'Prompt not available',
            currentSharedWanderId: sharedWander.shared_wander_id
          }
          
          setSelectedMate(updatedMate)
        } catch (err) {
          setError('Failed to start new wander: ' + err.message)
          return
        }
      }
      setCurrentView('prompt')
    } else if (mate.status === 'ready_to_reveal' || mate.status === 'reacting') {
      setCurrentView('reveal')
    } else if (mate.status === 'waiting_for_them') {
      setCurrentView('waiting')
    } else if (mate.status === 'ready') {
      // Start a new wander
      await handleMateClick({ ...mate, status: 'waiting_for_you' })
    }
  }

  const submitResponse = async () => {
    if (!userResponse.trim() || !selectedMate?.currentSharedWanderId || !currentUser?.id) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Submit response to shared wander
      const responseResult = await SharedWandersAPI.submitResponse(
        currentUser.id,
        selectedMate.currentSharedWanderId,
        userResponse
      )
      
      if (responseResult.error) {
        throw new Error('Failed to submit response: ' + responseResult.error.message)
      }

      // Save to prompt history for Lost & Found
      if (selectedMate.prompt && selectedMate.prompt !== 'Prompt not available' && selectedMate.prompt !== 'Unable to load prompt') {
        try {
          await PromptHistoryAPI.createPromptHistory(currentUser.id, {
            prompt_text: selectedMate.prompt,
            response_text: userResponse,
            prompt_type: 'mate',
            title: selectedMate.prompt.substring(0, 50) + (selectedMate.prompt.length > 50 ? '...' : '')
          })
        } catch (historyError) {
          // Don't fail the whole operation for this
        }
      }

      // Reload the mate data to get updated status
      const matesResult = await MatesAPI.getActiveMates(currentUser.id)
      if (!matesResult.error) {
        const updatedMate = matesResult.data?.find(m => m.id === selectedMate.id)
        if (updatedMate) {
          setSelectedMate(updatedMate)
          
          // Navigate based on updated status
          if (updatedMate.status === 'reacting') {
            setCurrentView('reveal')
          } else {
            setCurrentView('waiting')
          }
          
          // Update local mates list
          setMates(prev => prev.map(m => 
            m.id === selectedMate.id ? updatedMate : m
          ))
        }
      }
      
      setUserResponse('')

    } catch (error) {
      // Check if the response actually saved despite the error
      try {
        const matesResult = await MatesAPI.getActiveMates(currentUser.id)
        if (!matesResult.error) {
          const updatedMate = matesResult.data?.find(m => m.id === selectedMate.id)
          if (updatedMate && updatedMate.yourResponse) {
            // It actually saved, update the UI
            setSelectedMate(updatedMate)
            setCurrentView('waiting')
            setUserResponse('')
            setMates(prev => prev.map(m => 
              m.id === selectedMate.id ? updatedMate : m
            ))
          } else {
            setError('Failed to save response: ' + error.message)
          }
        } else {
          setError('Failed to save response: ' + error.message)
        }
      } catch (checkError) {
        setError('Failed to save response: ' + error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendReaction = async () => {
    if (!reactionText.trim() || !selectedMate?.currentSharedWanderId || !currentUser?.id) return

    try {
      const reactionResult = await SharedWandersAPI.addReaction(
        currentUser.id,
        selectedMate.currentSharedWanderId,
        reactionText
      )
      
      if (reactionResult.error) throw reactionResult.error

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const newReaction = {
        author: "You",
        content: reactionText,
        timestamp: timestamp
      }
      
      // Update local state
      const updatedMate = {
        ...selectedMate,
        sharedReactions: [...(selectedMate.sharedReactions || []), newReaction]
      }
      
      setMates(prev => prev.map(m => 
        m.id === selectedMate.id ? updatedMate : m
      ))
      
      setSelectedMate(updatedMate)
      setReactionText('')

    } catch (error) {
      setError('Failed to send reaction')
    }
  }

  const sendInvite = async () => {
    if (!selectedExistingUser || !currentUser?.id) return
    
    try {
      setIsSubmitting(true)
      const result = await MatesAPI.sendMateInvitation(currentUser.id, selectedExistingUser)
      
      if (result.error) throw result.error

      // Refresh pending invites and available users
      const [invitesResult, usersResult] = await Promise.all([
        MatesAPI.getPendingInvitations(currentUser.id),
        MatesAPI.getAvailableUsers(currentUser.id)
      ])
      
      if (!invitesResult.error) setPendingInvites(invitesResult.data?.all || [])
      if (!usersResult.error) setAvailableUsers(usersResult.data || [])

      // Close modal and reset form
      setShowInviteModal(false)
      setSelectedExistingUser('')

    } catch (error) {
      setError('Failed to send invitation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInviteResponse = async (inviteId, accept) => {
    if (!currentUser?.id) return

    try {
      if (accept) {
        const result = await MatesAPI.acceptMateInvitation(currentUser.id, inviteId)
        if (result.error) throw result.error
      } else {
        const result = await MatesAPI.rejectMateInvitation(currentUser.id, inviteId)
        if (result.error) throw result.error
      }

      // Refresh all data
      await loadInitialData()

    } catch (error) {
      setError('Failed to respond to invitation')
    }
  }

  const handleEndRelationship = async (mateId) => {
    if (!currentUser?.id) return

    try {
      const result = await MatesAPI.endMateRelationship(currentUser.id, mateId)
      if (result.error) throw result.error

      // Remove from local state
      setMates(prev => prev.filter(m => m.id !== mateId))
      setShowStopConfirm(null)

    } catch (error) {
      setError('Failed to end relationship')
    }
  }

  const canSendInvite = () => {
    return selectedExistingUser && availableUsers.length > 0
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid #059669', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#059669' }}>Loading your mates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => {
              setError(null)
              loadInitialData()
            }}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser?.id) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#059669', marginBottom: '16px' }}>Please sign in to view your mates</p>
          <button 
            onClick={() => navigate('profile')}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Go to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)',
      paddingBottom: '100px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
        <button 
          onClick={() => navigate('home')}
          style={{ 
            position: 'absolute', 
            left: '24px', 
            top: '24px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        
        {/* Info button */}
        <button 
          onClick={() => setShowInfo(true)}
          style={{ 
            position: 'absolute', 
            right: '24px', 
            top: '24px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
        >
          ℹ️
        </button>

        {/* Logo replacing text title */}
        <img 
          src="/mates-logo.png" 
          alt="Wander Mates" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('Mates logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 24px; font-weight: 300; color: #047857; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">Wander Mates</h1>';
          }}
          onLoad={(e) => {
            console.log('Mates logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 40
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#047857', margin: '0 0 16px 0' }}>
                Wander Mates
              </h2>
            </div>

            <div style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                Some things are better shared. Mates are your paired space to drift with a friend—no audience, no pressure. Just two minds reacting to the same prompt, side by side, in your own time. It's part inside joke, part thoughtful check-in, part surprise reveal.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                Here's how it works: you invite a friend to be your Wander Mate. Once you're paired, you'll both get the same prompt. You each answer privately, at your own pace. Your response is saved for you, but it stays hidden until your Mate replies. Then—ta da!—you both get to see what the other came up with, revealed together.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                From there, you can add a quick reaction—an emoji, a short note, a laugh. The moment resets when the next day begins. No backlog, no pressure to keep up—just a rhythm of small, shared detours.
              </p>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#047857' }}>
                Mates are your space to drift with friends and loved ones—closer, sillier, and more connected. A safe place to be weird, thoughtful, playful, or all of the above—knowing your friend will meet you on the other side.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {currentView === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Active Mates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#047857' }}>Your Mates</h2>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    color: '#059669',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  + Invite
                </button>
              </div>
              
              {mates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: '#059669', opacity: 0.75 }}>
                    No mates yet. Invite someone to start wandering together!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mates.map((mate) => {
                    const statusInfo = getStatusDisplay(mate.status)
                    return (
                      <div 
                        key={mate.id}
                        onClick={() => handleMateClick(mate)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          borderRadius: '24px',
                          padding: '24px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#047857' }}>{mate.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '12px',
                              padding: '4px 12px',
                              borderRadius: '50px',
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color
                            }}>
                              {statusInfo.text}
                            </span>
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowMateMenu(showMateMenu === mate.id ? null : mate.id)
                                }}
                                style={{
                                  padding: '4px',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  borderRadius: '4px'
                                }}
                              >
                                ⋯
                              </button>
                              
                              {showMateMenu === mate.id && (
                                <div style={{
                                  position: 'absolute',
                                  right: '0',
                                  top: '100%',
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  borderRadius: '16px',
                                  padding: '8px',
                                  border: '1px solid rgba(255,255,255,0.3)',
                                  zIndex: 10,
                                  minWidth: '120px',
                                  marginTop: '4px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowMateMenu(null)
                                      setShowStopConfirm(mate.id)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '8px 12px',
                                      fontSize: '12px',
                                      color: '#dc2626',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '8px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Stop wandering
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {mate.prompt && mate.prompt !== 'Unable to load prompt' && mate.prompt !== 'Prompt not available' && (
                          <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', lineHeight: '1.4', marginBottom: '12px' }}>
                            {mate.prompt}
                          </p>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div></div>
                          <div style={{ fontSize: '12px', color: '#059669', opacity: 0.6 }}>
                            {formatDate(mate.lastActivity)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#047857', marginBottom: '16px' }}>Pending</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingInvites.map((invite, index) => (
                    <div key={invite.id || index} style={{
                      backgroundColor: 'rgba(255,255,255,0.4)',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#047857' }}>{invite.name}</p>
                          <p style={{ fontSize: '12px', color: '#059669', opacity: 0.75 }}>
                            {invite.type === 'incoming' && 'Invited you to be Mates'}
                            {invite.type === 'outgoing' && 'Invitation sent'}
                          </p>
                        </div>
                        
                        {invite.type === 'incoming' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleInviteResponse(invite.id, true)}
                              style={{
                                fontSize: '12px',
                                backgroundColor: '#059669',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleInviteResponse(invite.id, false)}
                              style={{
                                fontSize: '12px',
                                color: '#059669',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'prompt' && selectedMate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#047857', marginBottom: '4px' }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#059669', opacity: 0.75 }}>
                They're waiting for your response
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: '300', lineHeight: '1.5', marginBottom: '24px' }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>

              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Share your wandering thoughts..."
                style={{
                  width: '100%',
                  height: '128px',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid #10b981',
                  borderRadius: '16px',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  color: '#4b5563',
                  marginBottom: '24px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isSubmitting}
                  style={{
                    flex: 1,
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: (!userResponse.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                    opacity: (!userResponse.trim() || isSubmitting) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  ) : (
                    `Send to ${selectedMate.name}`
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentView('dashboard')}
                  style={{ 
                    padding: '12px 24px', 
                    color: '#059669', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'waiting' && selectedMate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#047857', marginBottom: '4px' }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#059669', opacity: 0.75 }}>
                Waiting for {selectedMate.name} to respond
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                backgroundColor: '#a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #059669', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
              </div>
              
              <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', marginBottom: '16px', lineHeight: '1.4' }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>
              
              <div style={{
                backgroundColor: '#ecfdf5',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>Your response:</p>
                <p style={{ color: '#4b5563', fontStyle: 'italic' }}>{selectedMate.yourResponse}</p>
              </div>
              
              <p style={{ fontSize: '12px', color: '#059669', opacity: 0.75 }}>
                You'll both see responses when they complete theirs
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{
                  fontSize: '14px',
                  color: '#059669',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Back to Mates
              </button>
            </div>
          </div>
        )}

        {currentView === 'reveal' && selectedMate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#047857', marginBottom: '4px' }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#059669', opacity: 0.75 }}>
                Share your reaction
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', marginBottom: '16px' }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>
              
              {/* Your Response */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>Your response:</p>
                <div style={{ backgroundColor: '#ecfdf5', borderRadius: '16px', padding: '16px' }}>
                  <p style={{ color: '#4b5563', fontStyle: 'italic' }}>{selectedMate.yourResponse}</p>
                </div>
              </div>

              {/* Their Response */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>{selectedMate.name}'s response:</p>
                <div style={{ backgroundColor: '#dbeafe', borderRadius: '16px', padding: '16px' }}>
                  <p style={{ color: '#4b5563', fontStyle: 'italic' }}>{selectedMate.theirResponse}</p>
                </div>
              </div>

              {/* Shared Reactions */}
              {selectedMate.sharedReactions && selectedMate.sharedReactions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>Reactions:</p>
                  <div style={{ backgroundColor: '#fef3c7', borderRadius: '16px', padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedMate.sharedReactions.map((reaction, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                            {reaction.author}:
                          </span>
                          <span style={{ fontSize: '14px' }}>{reaction.content}</span>
                          <span style={{ fontSize: '12px', color: '#059669', opacity: 0.5, marginLeft: 'auto' }}>
                            {reaction.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reaction Interface */}
              <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#059669', marginBottom: '12px' }}>Add a reaction:</p>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={reactionText}
                    onChange={(e) => setReactionText(e.target.value)}
                    placeholder="Type a few words..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    maxLength="50"
                  />
                  <button
                    onClick={sendReaction}
                    disabled={!reactionText.trim()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#059669',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      cursor: !reactionText.trim() ? 'not-allowed' : 'pointer',
                      opacity: !reactionText.trim() ? 0.5 : 1
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{
                  fontSize: '14px',
                  color: '#059669',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Back to Mates
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#047857', marginBottom: '8px' }}>
                Invite a Mate
              </h3>
              <p style={{ fontSize: '14px', color: '#059669', opacity: 0.75 }}>
                Choose someone already on Wander
              </p>
            </div>
            
            {availableUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  No available users to invite right now.
                </p>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    padding: '8px 16px',
                    color: '#059669',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <select
                    value={selectedExistingUser}
                    onChange={(e) => setSelectedExistingUser(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      border: '1px solid #10b981',
                      borderRadius: '16px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select a friend...</option>
                    {availableUsers.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.display_name || user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={sendInvite}
                    disabled={!canSendInvite() || isSubmitting}
                    style={{
                      flex: 1,
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '14px',
                      cursor: (canSendInvite() && !isSubmitting) ? 'pointer' : 'not-allowed',
                      opacity: (canSendInvite() && !isSubmitting) ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting ? (
                      <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    ) : (
                      'Send Invite'
                    )}
                  </button>
                  <button
                    onClick={() => { 
                      setShowInviteModal(false)
                      setSelectedExistingUser('')
                    }}
                    style={{ 
                      padding: '12px 16px', 
                      color: '#059669', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stop Confirmation Modal */}
      {showStopConfirm && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#4b5563', marginBottom: '8px' }}>
              Stop wandering with {mates.find(m => m.id === showStopConfirm)?.name}?
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              You can always invite them again later
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleEndRelationship(showStopConfirm)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Stop wandering
              </button>
              <button
                onClick={() => setShowStopConfirm(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Keep wandering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
            {/* Home */}
            <div 
              onClick={() => navigate('home')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m3 0a1 1 0 001-1V10m0 0l2 2"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                color: '#9CA3AF',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Home
              </span>
            </div>
            
            {/* Daily */}
            <div 
              onClick={() => navigate('daily')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                color: '#9CA3AF',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Daily
              </span>
            </div>
            
            {/* Mates - Active */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#059669" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#059669',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Mates
              </span>
            </div>
            
            {/* Solo */}
            <div 
              onClick={() => navigate('solo')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                color: '#9CA3AF',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Solo
              </span>
            </div>
            
            {/* L&F */}
            <div 
              onClick={() => navigate('lost-found')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                color: '#9CA3AF',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                L&F
              </span>
            </div>
            
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default WanderMates