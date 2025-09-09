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
      SharedWandersAPI.markUserViewedReveal(currentUser.id, selectedMate.currentSharedWanderId)
    }
  }, [currentView, selectedMate?.currentSharedWanderId, currentUser?.id])

  // SIMPLIFIED: Basic polling for active conversations only
  useEffect(() => {
    if (!currentUser?.id) return

    let interval
    
    if ((currentView === 'reveal' || currentView === 'waiting') && selectedMate) {
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
      }, 20000)
      
    } else if (currentView === 'dashboard') {
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
      }, 30000)
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
      case 'waiting_for_you': return { text: 'Your turn to wander', color: '#047857', bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' }
      case 'waiting_for_them': return { text: 'Waiting for their response', color: '#92400E', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }
      case 'ready_to_reveal': 
      case 'reacting': return { text: 'Share a reaction', color: '#7C3AED', bg: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)' }
      case 'ready': return { text: 'New wander available', color: '#1E40AF', bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' }
      default: return { text: 'New wander available', color: '#6b7280', bg: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)' }
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
      if (!mate.currentSharedWanderId) {
        try {
          const wanderResult = await SharedWandersAPI.createSharedWander(mate.id)
          
          if (wanderResult.error) {
            throw new Error('Failed to create shared wander: ' + wanderResult.error.message)
          }
          
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
      await handleMateClick({ ...mate, status: 'waiting_for_you' })
    }
  }

  const submitResponse = async () => {
    if (!userResponse.trim() || !selectedMate?.currentSharedWanderId || !currentUser?.id) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const responseResult = await SharedWandersAPI.submitResponse(
        currentUser.id,
        selectedMate.currentSharedWanderId,
        userResponse
      )
      
      if (responseResult.error) {
        throw new Error('Failed to submit response: ' + responseResult.error.message)
      }

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

      const matesResult = await MatesAPI.getActiveMates(currentUser.id)
      if (!matesResult.error) {
        const updatedMate = matesResult.data?.find(m => m.id === selectedMate.id)
        if (updatedMate) {
          setSelectedMate(updatedMate)
          
          if (updatedMate.status === 'reacting') {
            setCurrentView('reveal')
          } else {
            setCurrentView('waiting')
          }
          
          setMates(prev => prev.map(m => 
            m.id === selectedMate.id ? updatedMate : m
          ))
        }
      }
      
      setUserResponse('')

    } catch (error) {
      try {
        const matesResult = await MatesAPI.getActiveMates(currentUser.id)
        if (!matesResult.error) {
          const updatedMate = matesResult.data?.find(m => m.id === selectedMate.id)
          if (updatedMate && updatedMate.yourResponse) {
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

      const [invitesResult, usersResult] = await Promise.all([
        MatesAPI.getPendingInvitations(currentUser.id),
        MatesAPI.getAvailableUsers(currentUser.id)
      ])
      
      if (!invitesResult.error) setPendingInvites(invitesResult.data?.all || [])
      if (!usersResult.error) setAvailableUsers(usersResult.data || [])

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
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #A7F3D0', 
            borderTop: '3px solid #10B981', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 16px' 
          }}></div>
          <p style={{ color: '#10B981' }}>Loading your mates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
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
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
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
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#10B981', marginBottom: '16px' }}>Please sign in to view your mates</p>
          <button 
            onClick={() => navigate('profile')}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              color: 'white',
              padding: '18px 32px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
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
      background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
      paddingBottom: '100px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
        <button 
          onClick={() => navigate('home')}
          style={{ 
            position: 'absolute', 
            left: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            fontSize: '16px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ←
        </button>
        
        <button 
          onClick={() => setShowInfo(true)}
          style={{ 
            position: 'absolute', 
            right: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500',
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'
          }}
        >
          i
        </button>

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
            e.target.outerHTML = '<h1 style="font-size: 24px; font-weight: 300; color: #047857; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">Wander Mates</h1>';
          }}
          onLoad={(e) => {
            console.log('Mates logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

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
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.2)',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 32px rgba(4, 120, 87, 0.15)'
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
                  background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  color: 'white',
                  padding: '18px 32px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
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
            
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '20px' 
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#047857',
                  margin: 0
                }}>Your Mates</h2>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  style={{ 
                    background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  + Invite
                </button>
              </div>
              
              {mates.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px 24px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(4, 120, 87, 0.15)'
                }}>
                  <p style={{ color: '#10B981', opacity: 0.75 }}>
                    No mates yet. Invite someone to start wandering together!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {mates.map((mate) => {
                    const statusInfo = getStatusDisplay(mate.status)
                    return (
                      <div 
                        key={mate.id}
                        onClick={() => handleMateClick(mate)}
                        style={{
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                          borderRadius: '20px',
                          padding: '24px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          boxShadow: '0 8px 32px rgba(4, 120, 87, 0.15), 0 2px 8px rgba(4, 120, 87, 0.1)',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          marginBottom: '16px' 
                        }}>
                          <h3 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#047857',
                            margin: 0
                          }}>{mate.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '12px',
                              padding: '6px 12px',
                              borderRadius: '16px',
                              background: statusInfo.bg,
                              color: statusInfo.color,
                              fontWeight: '500',
                              border: `1px solid ${statusInfo.color}20`
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
                                  borderRadius: '4px',
                                  color: '#6B7280'
                                }}
                              >
                                ⋯
                              </button>
                              
                              {showMateMenu === mate.id && (
                                <div style={{
                                  position: 'absolute',
                                  right: '0',
                                  top: '100%',
                                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                                  borderRadius: '16px',
                                  padding: '8px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  zIndex: 10,
                                  minWidth: '120px',
                                  marginTop: '4px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
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
                          <p style={{ 
                            color: '#374151', 
                            fontSize: '16px', 
                            lineHeight: '1.4', 
                            margin: '0 0 16px 0'
                          }}>
                            {mate.prompt}
                          </p>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between' 
                        }}>
                          <div></div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#10B981', 
                            opacity: 0.8
                          }}>
                            {formatDate(mate.lastActivity)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {pendingInvites.length > 0 && (
              <div>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#047857', 
                  marginBottom: '20px' 
                }}>Pending</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingInvites.map((invite, index) => (
                    <div key={invite.id || index} style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                      borderRadius: '20px',
                      padding: '20px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 16px rgba(4, 120, 87, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#047857',
                            margin: '0 0 4px 0'
                          }}>{invite.name}</p>
                          <p style={{ 
                            fontSize: '14px', 
                            color: '#10B981', 
                            opacity: 0.75,
                            margin: 0
                          }}>
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
                                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleInviteResponse(invite.id, false)}
                              style={{
                                fontSize: '12px',
                                color: '#10B981',
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
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#047857', 
                margin: '0 0 8px 0'
              }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#10B981', 
                opacity: 0.8,
                margin: 0
              }}>
                They're waiting for your response
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(4, 120, 87, 0.15), 0 2px 8px rgba(4, 120, 87, 0.1)'
            }}>
              <p style={{ 
                color: '#374151', 
                fontSize: '18px', 
                lineHeight: '1.5', 
                margin: '0 0 32px 0'
              }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>

              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Share your wandering thoughts..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                  border: '2px solid #A7F3D0',
                  borderRadius: '16px',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  color: '#374151',
                  marginBottom: '24px',
                  boxSizing: 'border-box',
                  boxShadow: 'inset 0 2px 8px rgba(4, 120, 87, 0.05), 0 2px 4px rgba(4, 120, 87, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10B981'
                  e.target.style.boxShadow = 'inset 0 2px 8px rgba(4, 120, 87, 0.1), 0 0 0 3px rgba(16, 185, 129, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#A7F3D0'
                  e.target.style.boxShadow = 'inset 0 2px 8px rgba(4, 120, 87, 0.05), 0 2px 4px rgba(4, 120, 87, 0.05)'
                }}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isSubmitting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                    color: 'white',
                    padding: '18px 24px',
                    borderRadius: '15px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (!userResponse.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                    opacity: (!userResponse.trim() || isSubmitting) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3), 0 2px 4px rgba(4, 120, 87, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid white', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></div>
                  ) : (
                    `Send to ${selectedMate.name}`
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentView('dashboard')}
                  style={{ 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                    color: '#10B981',
                    border: '2px solid #10B981',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.3s ease'
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
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#047857', 
                margin: '0 0 8px 0'
              }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#10B981', 
                opacity: 0.8,
                margin: 0
              }}>
                Waiting for {selectedMate.name} to respond
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(4, 120, 87, 0.15), 0 2px 8px rgba(4, 120, 87, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                margin: '0 auto 24px',
                border: '3px solid #A7F3D0',
                borderTop: '3px solid #10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              
              <p style={{ 
                color: '#374151', 
                fontSize: '16px', 
                margin: '0 0 24px 0',
                lineHeight: '1.4'
              }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>
              
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: 'inset 0 2px 8px rgba(4, 120, 87, 0.1)'
              }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#047857', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>Your response:</p>
                <p style={{ 
                  color: '#065F46', 
                  fontStyle: 'italic',
                  margin: 0
                }}>{selectedMate.yourResponse}</p>
              </div>
              
              <p style={{ 
                fontSize: '12px', 
                color: '#10B981', 
                opacity: 0.8,
                margin: 0
              }}>
                You'll both see responses when they complete theirs
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{
                  fontSize: '14px',
                  color: '#10B981',
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
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#047857', 
                margin: '0 0 8px 0'
              }}>
                Wander with {selectedMate.name}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#10B981', 
                opacity: 0.8,
                margin: 0
              }}>
                Share your reaction
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(4, 120, 87, 0.15), 0 2px 8px rgba(4, 120, 87, 0.1)'
            }}>
              <p style={{ 
                color: '#374151', 
                fontSize: '16px', 
                margin: '0 0 16px 0'
              }}>
                {selectedMate.prompt || 'Loading prompt...'}
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#047857', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>Your response:</p>
                <div style={{ 
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: 'inset 0 2px 8px rgba(4, 120, 87, 0.1)'
                }}>
                  <p style={{ 
                    color: '#065F46', 
                    fontStyle: 'italic',
                    margin: 0
                  }}>{selectedMate.yourResponse}</p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#047857', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>{selectedMate.name}'s response:</p>
                <div style={{ 
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', 
                  borderRadius: '16px', 
                  padding: '16px',
                  border: '1px solid rgba(67, 56, 202, 0.2)'
                }}>
                  <p style={{ 
                    color: '#4338CA', 
                    fontStyle: 'italic',
                    margin: 0
                  }}>{selectedMate.theirResponse}</p>
                </div>
              </div>

              {selectedMate.sharedReactions && selectedMate.sharedReactions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#92400E', 
                    margin: '0 0 8px 0',
                    fontWeight: '600'
                  }}>Reactions:</p>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
                    borderRadius: '16px', 
                    padding: '16px' 
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedMate.sharedReactions.map((reaction, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '14px',
                            color: '#374151'
                          }}>
                            <strong>{reaction.author}:</strong> {reaction.content}
                          </span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#6B7280'
                          }}>
                            {reaction.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '16px' }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#047857', 
                  margin: '0 0 12px 0',
                  fontWeight: '600'
                }}>Add a reaction:</p>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={reactionText}
                    onChange={(e) => setReactionText(e.target.value)}
                    placeholder="Type a few words..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                      border: '2px solid #A7F3D0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      color: '#374151',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10B981'
                      e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#A7F3D0'
                      e.target.style.boxShadow = 'none'
                    }}
                    maxLength={50}
                  />
                  <button
                    onClick={sendReaction}
                    disabled={!reactionText.trim()}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: !reactionText.trim() ? 'not-allowed' : 'pointer',
                      opacity: !reactionText.trim() ? 0.5 : 1,
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease'
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
                  color: '#10B981',
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
{showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 32px rgba(4, 120, 87, 0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#047857', 
                margin: '0 0 8px 0'
              }}>
                Invite a Mate
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#10B981', 
                opacity: 0.8,
                margin: 0
              }}>
                Choose someone already on Wander
              </p>
            </div>
            
            {availableUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <p style={{ 
                  color: '#6b7280', 
                  margin: '0 0 16px 0'
                }}>
                  No available users to invite right now.
                </p>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    padding: '12px 24px',
                    color: '#10B981',
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
                <div style={{ marginBottom: '24px' }}>
                  <select
                    value={selectedExistingUser}
                    onChange={(e) => setSelectedExistingUser(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                      border: '2px solid #A7F3D0',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#374151',
                      boxShadow: 'inset 0 2px 8px rgba(4, 120, 87, 0.05), 0 2px 4px rgba(4, 120, 87, 0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10B981'
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(4, 120, 87, 0.1), 0 0 0 3px rgba(16, 185, 129, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#A7F3D0'
                      e.target.style.boxShadow = 'inset 0 2px 8px rgba(4, 120, 87, 0.05), 0 2px 4px rgba(4, 120, 87, 0.05)'
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
                      background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                      color: 'white',
                      padding: '18px 24px',
                      borderRadius: '15px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: (canSendInvite() && !isSubmitting) ? 'pointer' : 'not-allowed',
                      opacity: (canSendInvite() && !isSubmitting) ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3), 0 2px 4px rgba(4, 120, 87, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isSubmitting ? (
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid white', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }}></div>
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
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                      color: '#10B981',
                      border: '2px solid #10B981',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
                      transition: 'all 0.3s ease'
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

      {showStopConfirm && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 32px rgba(4, 120, 87, 0.15)'
          }}>
            <p style={{ 
              color: '#4b5563', 
              margin: '0 0 8px 0'
            }}>
              Stop wandering with {mates.find(m => m.id === showStopConfirm)?.name}?
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: '0 0 24px 0'
            }}>
              You can always invite them again later
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleEndRelationship(showStopConfirm)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)'
                }}
              >
                Stop wandering
              </button>
              <button
                onClick={() => setShowStopConfirm(null)}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                  color: '#4b5563',
                  border: '2px solid #10B981',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'
                }}
              >
                Keep wandering
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
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
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#10B981',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Mates
              </span>
            </div>
            
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