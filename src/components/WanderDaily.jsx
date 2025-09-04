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
  const [showAffirmation, setShowAffirmation] = useState(false)
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

  const skipForToday = () => {
    setCurrentStep('prompt') // Allow re-entry as per requirements
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
        setCurrentStep('complete')
        if (type !== 'skipped') {
          setShowAffirmation(true)
          setTimeout(() => setShowAffirmation(false), 4000)
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
          fontSize: '1.5rem', 
          fontWeight: '300', 
          color: '#92400e',
          marginBottom: '8px'
        }}>
          Daily Wander
        </h1>
        <p style={{ color: '#a16207', opacity: 0.75, fontSize: '14px' }}>
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
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px 32px 24px 32px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '12px'
            }}>
              <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: '300', lineHeight: '1.5', margin: 0 }}>
                {currentPrompt}
              </p>
            </div>

            {showPromptTimer && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
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
                  <span style={{ opacity: Math.max(0.3, promptTimer / 30) }}>{promptTimer}s</span>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={skipForToday}
                style={{ 
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#a16207',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid #f59e0b',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Skip for now
              </button>

              <button 
                onClick={handleShowYesterdayResults}
                style={{ 
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  color: '#a16207',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(249,115,22,0.3)',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer'
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
                  <span style={{ opacity: Math.max(0.3, responseTimer / 300) }}>{formatTime(responseTimer)}</span>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleSubmit('private')}
                  disabled={!userResponse.trim() || isSubmitting}
                  style={{
                    flex: 1,
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
                
                <button
                  onClick={() => handleSubmit('skipped')}
                  style={{ 
                    padding: '12px 24px', 
                    color: '#a16207', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Skip for today
                </button>
              </div>
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

            {showAffirmation && responseType !== 'skipped' && (
              <div style={{ textAlign: 'center', padding: '0' }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <p style={{ color: '#a16207', fontWeight: '300', fontSize: '18px', margin: 0 }}>
                    {affirmations[Math.floor(Math.random() * affirmations.length)]}
                  </p>
                </div>
              </div>
            )}

            {canShowOthers() && !showAffirmation && (
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

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '50px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#a16207' }}>
            <button 
              onClick={() => navigate('home')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#a16207', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('daily')}
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#a16207', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Daily
            </button>
            <button 
              onClick={() => navigate('solo')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#a16207', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Solos
            </button>
            <button 
              onClick={() => navigate('mates')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#a16207', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mates
            </button>
            <button 
              onClick={() => navigate('groups')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#a16207', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Groups
            </button>
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
      `}</style>
    </div>
  )
}

export default WanderDaily