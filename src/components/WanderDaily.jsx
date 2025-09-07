import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'
import { DailyAPI } from '../services/dailyAPI'

const WanderDaily = ({ navigate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState('loading')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [promptId, setPromptId] = useState('')
  const [userResponse, setUserResponse] = useState('')
  const [responseType, setResponseType] = useState('')
  const [showOthers, setShowOthers] = useState(false)
  const [showYesterdayResults, setShowYesterdayResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promptTimer, setPromptTimer] = useState(30)
  const [responseTimer, setResponseTimer] = useState(300)
  const [showPromptTimer, setShowPromptTimer] = useState(true)
  const [showResponseTimer, setShowResponseTimer] = useState(true)
  const [error, setError] = useState(null)
  const [sharedResponses, setSharedResponses] = useState([])
  const [existingResponse, setExistingResponse] = useState(null)

  const affirmations = [
    "Your thoughts have their own gravity",
    "That landed beautifully", 
    "Pure brain magic right there",
    "Your mind wandered perfectly",
    "Beautiful strange thinking",
    "You just gave your brain a gift",
    "That's the kind of thinking the world needs"
  ]

  // Yesterday's synthesis data (hardcoded for now as requested)
  const yesterdaySynthesis = {
    prompt: "What's something only aliens would eat on Earth?",
    wordCloud: ["dreamy", "crunchy", "melted", "bitter", "sweet", "fuzzy", "warm"],
    mashup: "Yesterday, we all tasted Tuesday differently—some bitter, some sweet, most somewhere beautifully in between.",
    pulse: "2,847 people wandered for 8,341 minutes yesterday. That's like skipping 12,000 notification pings."
  }

  useEffect(() => {
    loadTodaysData()
  }, [currentUser])

  // Check for day changes to handle users who leave the app open overnight
  useEffect(() => {
    const checkForNewDay = () => {
      const currentDailyDate = DailyAPI.getCurrentDailyDate()
      const lastCheckedDate = localStorage.getItem('lastDailyCheck')
      
      if (lastCheckedDate !== currentDailyDate) {
        localStorage.setItem('lastDailyCheck', currentDailyDate)
        console.log('New day detected, refreshing data:', currentDailyDate)
        setCurrentStep('loading')
        setExistingResponse(null)
        setUserResponse('')
        setResponseType('')
        setError(null)
        loadTodaysData()
      }
    }
    
    // Check immediately
    checkForNewDay()
    
    // Check every minute in case user leaves app open overnight
    const interval = setInterval(checkForNewDay, 60000)
    return () => clearInterval(interval)
  }, [currentUser])

  useEffect(() => {
    if (currentStep === 'prompt' && promptTimer <= 0) {
      startWander()
    }
  }, [promptTimer, currentStep])

  useEffect(() => {
    if (currentStep === 'prompt' && promptTimer > 0 && showPromptTimer) {
      const timer = setTimeout(() => setPromptTimer(promptTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [promptTimer, currentStep, showPromptTimer])

  useEffect(() => {
    if (currentStep === 'respond' && responseTimer > 0 && showResponseTimer) {
      const timer = setTimeout(() => setResponseTimer(responseTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [responseTimer, currentStep, showResponseTimer])

  // Auto-hide response timer after it reaches 0
  useEffect(() => {
    if (currentStep === 'respond' && responseTimer <= 0 && showResponseTimer) {
      setShowResponseTimer(false)
    }
  }, [responseTimer, currentStep, showResponseTimer])

  const loadTodaysData = async () => {
    try {
      setError(null)
      setCurrentStep('loading')

      // Get today's prompt
      const promptResult = await DailyAPI.getTodaysPrompt()
      if (promptResult.error) {
        throw new Error('Failed to load today\'s prompt')
      }

      if (!promptResult.data) {
        setError('No more Daily prompts in database')
        return
      }

      setCurrentPrompt(promptResult.data.prompt_text)
      setPromptId(promptResult.data.prompt_id)

      // Check if user has already responded today
      if (currentUser?.id) {
        const responseResult = await DailyAPI.getUserTodaysResponse(currentUser.id)
        if (responseResult.data) {
          // User has already responded - show completed state
          setExistingResponse(responseResult.data)
          setUserResponse(responseResult.data.response_text)
          setResponseType(responseResult.data.is_shared_publicly ? 'shared' : 'private')
          setCurrentStep('complete')
          return
        }
      }

      // User hasn't responded yet - show prompt
      setCurrentStep('prompt')

    } catch (err) {
      console.error('Error loading today\'s data:', err)
      setError(err.message)
    }
  }

  const skipTimer = () => {
    setShowPromptTimer(false)
    startWander()
  }

  const startWander = () => {
    setCurrentStep('cleanse')
    setTimeout(() => setCurrentStep('respond'), 3000)
  }

  const skipForNow = () => {
    // Skip directly to complete state showing the "see you tomorrow" message
    handleSubmit('skipped')
  }

  const handleSubmit = async (type) => {
    if (!userResponse.trim() && type !== 'skipped') return
    
    setIsSubmitting(true)
    setResponseType(type)
    
    try {
      if (type !== 'skipped' && userResponse.trim() && currentUser?.id) {
        // Submit to daily responses
        const dailyResult = await DailyAPI.submitDailyResponse(
          currentUser.id,
          promptId,
          userResponse,
          type === 'shared'
        )
        
        if (dailyResult.error) {
          throw new Error('Failed to save daily response')
        }

        // Save to prompt history for Lost & Found
        await PromptHistoryAPI.createPromptHistory(currentUser.id, {
          prompt_text: currentPrompt,
          response_text: userResponse,
          prompt_type: 'daily',
          title: currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? '...' : '')
        })
        
        setExistingResponse(dailyResult.data)
      }
      
      setTimeout(() => {
        setIsSubmitting(false)
        if (type !== 'skipped') {
          setCurrentStep('celebration')
          setTimeout(() => setCurrentStep('complete'), 3000)
        } else {
          setCurrentStep('complete')
        }
      }, 1000)
    } catch (error) {
      console.error('Error saving response:', error)
      setError('Failed to save response')
      setIsSubmitting(false)
    }
  }

  const loadSharedResponses = async () => {
    try {
      const result = await DailyAPI.getTodaysSharedResponses()
      if (result.error) {
        throw new Error('Failed to load shared responses')
      }
      setSharedResponses(result.data || [])
    } catch (err) {
      console.error('Error loading shared responses:', err)
      setError('Failed to load shared responses')
    }
  }

  const handleShowOthers = async () => {
    if (!showOthers) {
      await loadSharedResponses()
    }
    setShowOthers(!showOthers)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleShowYesterdayResults = () => {
    setShowYesterdayResults(true)
  }

  const handleCloseYesterdayResults = () => {
    setShowYesterdayResults(false)
  }

  const canShowOthers = () => {
    return existingResponse && existingResponse.is_shared_publicly
  }

  if (error === 'No more Daily prompts in database') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#92400e', marginBottom: '16px' }}>No More Daily Prompts</h2>
          <p style={{ color: '#a16207', marginBottom: '24px' }}>
            No more Daily prompts in database. Please add more prompts to continue.
          </p>
          <button 
            onClick={() => navigate('home')}
            style={{
              backgroundColor: '#d97706',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
      paddingBottom: '100px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center' }}>
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
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#92400E',
          marginBottom: '8px',
          fontFamily: 'SF Pro Display, -apple-system, sans-serif'
        }}>
          Daily Wander
        </h1>
        <p style={{ 
          color: '#D97706', 
          opacity: 0.7, 
          fontSize: '14px',
          fontFamily: 'SF Pro Text, -apple-system, sans-serif'
        }}>
          Today's drift • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {error && error !== 'No more Daily prompts in database' && (
          <div style={{
            backgroundColor: '#fecaca',
            border: '1px solid #f87171',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {currentStep === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '2px solid #d97706',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#a16207' }}>Loading today's wander...</p>
            </div>
          </div>
        )}
        
        {currentStep === 'prompt' && (
          <div>
            {/* Enhanced prompt card with gradient and shadow */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.3)',
              marginBottom: '32px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
            }}>
              <p style={{ 
                color: '#7C2D12', 
                fontSize: '20px', 
                fontWeight: '500', 
                lineHeight: '1.4', 
                margin: 0,
                fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                textAlign: 'center'
              }}>
                {currentPrompt}
              </p>
            </div>

            {showPromptTimer && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ 
                  color: '#d97706', 
                  fontSize: '12px', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>Take a moment to let it settle</span>
                  <span>•</span>
                  <span style={{ 
                    backgroundColor: 'rgba(161,98,7,0.15)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontWeight: '500',
                    opacity: Math.max(0.3, promptTimer / 30)
                  }}>
                    {promptTimer}s
                  </span>
                  <span>•</span>
                  <button 
                    onClick={skipTimer}
                    style={{ 
                      color: '#d97706', 
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Skip timer
                  </button>
                </p>
              </div>
            )}
            
            {/* Secondary action - just text link */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleShowYesterdayResults}
                style={{ 
                  color: '#B45309', 
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                  opacity: 0.8
                }}
              >
                See yesterday's results
              </button>
            </div>
          </div>
        )}

        {currentStep === 'cleanse' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '96px',
                height: '96px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                opacity: '0.7',
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
              <p style={{ color: '#a16207', fontWeight: '300' }}>
                Let other thoughts drift away...
              </p>
            </div>
          </div>
        )}

        {currentStep === 'celebration' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div style={{ 
              textAlign: 'center', 
              animation: 'celebrationBounce 0.6s ease-out'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                animation: 'confettiPop 0.8s ease-out'
              }}>
                ✨
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)',
                maxWidth: '400px'
              }}>
                <p style={{ 
                  color: '#92400e', 
                  fontWeight: '400', 
                  fontSize: '18px', 
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {affirmations[Math.floor(Math.random() * affirmations.length)]}
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'respond' && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: '300', lineHeight: '1.5', marginBottom: '24px', marginTop: 0 }}>
              {currentPrompt}
            </p>

            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Let your mind wander..."
              style={{
                width: '100%',
                height: '128px',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '1px solid #f59e0b',
                borderRadius: '16px',
                resize: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#4b5563',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />

            {showResponseTimer && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ 
                  color: '#d97706', 
                  fontSize: '12px', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>No rush, just wander</span>
                  <span>•</span>
                  <span style={{ 
                    backgroundColor: 'rgba(161,98,7,0.15)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontWeight: '500',
                    opacity: Math.max(0.3, responseTimer / 300)
                  }}>
                    {formatTime(responseTimer)}
                  </span>
                  <span>•</span>
                  <button 
                    onClick={() => setShowResponseTimer(false)}
                    style={{ 
                      color: '#d97706', 
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Hide timer
                  </button>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => handleSubmit('shared')}
                disabled={!userResponse.trim() || isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#d97706',
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
                {isSubmitting && responseType === 'shared' ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  'Share with world'
                )}
              </button>

              <button
                onClick={() => handleSubmit('private')}
                disabled={!userResponse.trim() || isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#a16207',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid #f59e0b',
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
                {isSubmitting && responseType === 'private' ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #a16207', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  'Keep private'
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {userResponse && responseType !== 'skipped' && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', marginBottom: '16px' }}>{currentPrompt}</p>
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <p style={{ color: '#4b5563', fontStyle: 'italic', margin: 0 }}>{userResponse}</p>
                </div>
                <p style={{ color: '#d97706', fontSize: '12px', textAlign: 'center' }}>
                  {responseType === 'shared' ? 'Shared with the world • Saved to Lost & Found' : 'Saved to your Lost & Found'}
                </p>
              </div>
            )}

            {responseType === 'skipped' && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <p style={{ color: '#a16207' }}>See you tomorrow for a new drift</p>
              </div>
            )}

            {canShowOthers() && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={handleShowOthers}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    color: '#a16207',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: '1px solid #f59e0b',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showOthers ? 'Hide others' : 'See how others drifted'}
                </button>
              </div>
            )}

            {showOthers && canShowOthers() && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '384px', overflowY: 'auto' }}>
                {sharedResponses.length === 0 ? (
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No other shared responses yet today</p>
                  </div>
                ) : (
                  sharedResponses.map((response, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.4)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      <p style={{ color: '#4b5563', fontSize: '14px', fontStyle: 'italic', marginBottom: '8px' }}>
                        {response.response_text}
                      </p>
                      <p style={{ color: '#a16207', fontSize: '12px', opacity: 0.75 }}>
                        — {response.users?.display_name || response.users?.username || 'Anonymous'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Yesterday's Results Modal */}
      {showYesterdayResults && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 30
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
              <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#92400e', margin: 0 }}>
                Yesterday's Wander
              </h2>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#92400e', fontSize: '16px', fontWeight: '300', textAlign: 'center', margin: 0 }}>
                {yesterdaySynthesis.prompt}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#92400e', marginBottom: '12px' }}>
                Words that wandered through minds:
              </h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                justifyContent: 'center'
              }}>
                {yesterdaySynthesis.wordCloud.map((word, index) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: '#fed7aa',
                      color: '#ea580c',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#92400e', marginBottom: '12px' }}>
                The collective drift:
              </h3>
              <p style={{ color: '#4b5563', fontSize: '16px', fontStyle: 'italic', lineHeight: '1.5', margin: 0 }}>
                {yesterdaySynthesis.mashup}
              </p>
            </div>

            <div style={{
              backgroundColor: '#fecaca',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                {yesterdaySynthesis.pulse}
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={handleCloseYesterdayResults}
                style={{
                  backgroundColor: '#d97706',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back to today's drift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bottom Navigation */}
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
            
            {/* Daily - Active */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#D97706" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#D97706',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                Daily
              </span>
            </div>
            
            {/* Mates */}
            <div 
              onClick={() => navigate('mates')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '500', 
                color: '#9CA3AF',
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
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes celebrationBounce {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes confettiPop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default WanderDaily