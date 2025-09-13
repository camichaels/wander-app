import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'
import { SoloAPI } from '../services/soloAPI'

const WanderSolo = ({ navigate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState('prompt')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentPromptId, setCurrentPromptId] = useState(null)
  const [userResponse, setUserResponse] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [promptTimer, setPromptTimer] = useState(30)
  const [responseTimer, setResponseTimer] = useState(300)
  const [showPromptTimer, setShowPromptTimer] = useState(true)
  const [showResponseTimer, setShowResponseTimer] = useState(true)
  const [availablePrompts, setAvailablePrompts] = useState([])
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)

  const affirmations = [
    "Your mind just stretched in a beautiful way",
    "That's the kind of thinking that changes things",
    "You gave your brain exactly what it needed",
    "Pure wandering magic right there",
    "Your thoughts have their own unique gravity",
    "That's some beautiful mental roaming",
    "You just reclaimed a piece of your mind"
  ]

  useEffect(() => {
    loadAvailablePrompts()
  }, [])

  useEffect(() => {
    if (currentStep === 'prompt' && promptTimer <= 0) {
      setCurrentStep('respond')
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

  const loadAvailablePrompts = async () => {
    try {
      const result = await SoloAPI.getAllActivePrompts()
      const { data: prompts, error } = result

      if (error) {
        console.error('Error loading prompts:', error)
        return
      }

      if (prompts && prompts.length > 0) {
        setAvailablePrompts(prompts)
        // Load initial prompt
        loadRandomPrompt(prompts)
      } else {
        console.warn('No active solo prompts found in database')
        // Fallback to a simple prompt if database is empty
        setCurrentPrompt("What's on your mind right now?")
        setCurrentPromptId(null)
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
      // Fallback prompt
      setCurrentPrompt("What's on your mind right now?")
      setCurrentPromptId(null)
    }
  }

  const loadRandomPrompt = (promptsArray = availablePrompts) => {
    if (!promptsArray || promptsArray.length === 0) {
      console.warn('No prompts available to load')
      return
    }

    const randomPrompt = promptsArray[Math.floor(Math.random() * promptsArray.length)]
    setCurrentPrompt(randomPrompt.prompt_text)
    setCurrentPromptId(randomPrompt.prompt_id)
  }

  const loadNewPrompt = async () => {
    setIsLoadingPrompt(true)
    
    // If we have prompts cached, use them
    if (availablePrompts.length > 0) {
      loadRandomPrompt()
      setIsLoadingPrompt(false)
    } else {
      // Otherwise, reload from database
      await loadAvailablePrompts()
      setIsLoadingPrompt(false)
    }
  }

  const skipTimer = () => {
    setShowPromptTimer(false)
    setCurrentStep('respond')
  }

  const resetTimers = () => {
    setPromptTimer(30)
    setResponseTimer(300)
    setShowPromptTimer(true)
    setShowResponseTimer(true)
  }

  const handleSubmit = async () => {
    console.log('=== DATE DEBUG - SOLO ===')
    console.log('Local time:', new Date())
    console.log('UTC time:', new Date().toISOString())
    console.log('User timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)
    console.log('Timezone offset (minutes):', new Date().getTimezoneOffset())
    console.log('==================')
    
    if (!userResponse.trim()) return
    
    setIsSubmitting(true)
    
    try {
      if (currentUser?.id) {
        await PromptHistoryAPI.createPromptHistory(currentUser.id, {
          prompt_text: currentPrompt,
          response_text: userResponse,
          prompt_type: 'solo',
          title: currentPrompt.substring(0, 50) + (currentPrompt.length > 50 ? '...' : '')
        })

        // Update usage count for this prompt
        if (currentPromptId) {
          await SoloAPI.incrementUsageCount(currentPromptId)
        }
      }
      
      setTimeout(() => {
        setIsSubmitting(false)
        setCurrentStep('complete')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }, 1000)
    } catch (error) {
      console.error('Error saving response:', error)
      setIsSubmitting(false)
      setCurrentStep('complete')
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }

  const startNewWander = async () => {
    setUserResponse('')
    setCurrentStep('prompt')
    setShowCelebration(false)
    resetTimers()
    await loadNewPrompt()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      
      {/* Background overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        pointerEvents: 'none'
      }}></div>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <button 
          onClick={() => navigate('home')}
          style={{ 
            position: 'absolute', 
            left: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)'
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
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)'
          }}
        >
          ℹ︎
        </button>

        {/* Logo replacing text title */}
        <img 
          src="/solo-logo.png" 
          alt="Solo Wanders" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            console.log('Solo logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 48px; font-weight: 300; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Solo Wanders</h1>';
          }}
          onLoad={(e) => {
            console.log('Solo logo loaded successfully from:', e.target.src);
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
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#3B82F6', margin: '0 0 16px 0' }}>
                Solo Wanders
              </h2>
            </div>

            <div style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                These are your personal spaces to drift—no audience, no pressure. You take a prompt, let it sink in, and respond however you like. A few words, a sketch, a ramble… whatever feels right in the moment. A soft timer floats in the background, but it's only a gentle nudge.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                Solo Wanders can be reflective or imaginative, quiet or wild. They're a place to be as weird, deep, or playful as you want—because they're just for you. Every response is saved to your Lost & Found, so you can revisit ideas later or notice patterns in your wandering.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                Sometimes you'll uncover something personal. Other times, a prompt may spark a completely unexpected idea—something new to follow or carry into the rest of your day. When you finish, you can start another with a fresh prompt that takes you somewhere entirely different.
              </p>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#3B82F6' }}>
                Solo Wanders aren't about performance. They're about giving your mind space to explore—and discovering where they might take you.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {currentStep === 'prompt' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '32px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
              }}></div>
              
              {isLoadingPrompt ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '2px solid #3B82F6', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                  <p style={{ color: '#3B82F6', marginTop: '16px', fontSize: '16px' }}>
                    Finding your next prompt...
                  </p>
                </div>
              ) : (
                <p style={{ 
                  color: '#374151', 
                  fontSize: '20px', 
                  fontWeight: '500', 
                  lineHeight: '1.4', 
                  margin: 0,
                  fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                  textAlign: 'center'
                }}>
                  {currentPrompt}
                </p>
              )}
            </div>

            {showPromptTimer && !isLoadingPrompt && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                  color: '#3B82F6',
                  fontSize: '14px'
                }}>
                  <span>Take a moment to let it settle</span>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    color: 'white',
                    animation: promptTimer <= 10 ? 'gentlePulse 1s ease-in-out infinite' : 'none'
                  }}>
                    {promptTimer}s
                  </div>
                  <button 
                    onClick={skipTimer}
                    style={{ 
                      color: '#3B82F6', 
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Skip timer
                  </button>
                </div>
              </div>
            )}
            
            {!isLoadingPrompt && (
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={startNewWander}
                  disabled={isLoadingPrompt}
                  style={{ 
                    color: '#60A5FA', 
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: isLoadingPrompt ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                    opacity: isLoadingPrompt ? 0.5 : 0.8
                  }}
                >
                  Try a different prompt
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'respond' && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            }}></div>
            
            <p style={{ color: '#374151', fontSize: '18px', fontWeight: '500', lineHeight: '1.5', marginBottom: '24px', marginTop: 0 }}>
              {currentPrompt}
            </p>

            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Let your thoughts roam freely..."
              style={{
                width: '100%',
                height: '128px',
                padding: '20px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                border: '2px solid #BFDBFE',
                borderRadius: '16px',
                resize: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#374151',
                marginBottom: '16px',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 8px rgba(59, 130, 246, 0.05), 0 2px 4px rgba(59, 130, 246, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(59, 130, 246, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#BFDBFE'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(59, 130, 246, 0.05), 0 2px 4px rgba(59, 130, 246, 0.05)'
              }}
              autoFocus
            />

            {showResponseTimer && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                  color: '#3B82F6',
                  fontSize: '14px'
                }}>
                  <span>No rush, just wander</span>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    color: 'white'
                  }}>
                    {formatTime(responseTimer)}
                  </div>
                  <button 
                    onClick={() => setShowResponseTimer(false)}
                    style={{ 
                      color: '#3B82F6', 
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Hide timer
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={handleSubmit}
                disabled={!userResponse.trim() || isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '18px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (!userResponse.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                  opacity: (!userResponse.trim() || isSubmitting) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(37, 99, 235, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!(!userResponse.trim() || isSubmitting)) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4), 0 4px 8px rgba(37, 99, 235, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
              >
                {isSubmitting ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  "Capture this wander"
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={startNewWander}
                  disabled={isLoadingPrompt}
                  style={{
                    color: '#60A5FA',
                    border: 'none',
                    fontSize: '14px',
                    cursor: isLoadingPrompt ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    opacity: isLoadingPrompt ? 0.5 : 0.7,
                    padding: '8px',
                    background: 'none'
                  }}
                >
                  Try a different prompt
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Celebration moment */}
            {showCelebration && (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px 0',
                animation: 'celebrationBounce 0.6s ease-out'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  animation: 'confettiPop 0.8s ease-out'
                }}>
                  ✨
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
                }}>
                  <p style={{ 
                    color: '#3B82F6', 
                    fontWeight: '400', 
                    fontSize: '18px', 
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {affirmations[Math.floor(Math.random() * affirmations.length)]}
                  </p>
                </div>
              </div>
            )}

            {/* Show content after celebration */}
            {!showCelebration && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
                  }}></div>
                  
                  <p style={{ color: '#374151', fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>{currentPrompt}</p>
                  <div style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '16px',
                    boxShadow: 'inset 0 2px 8px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <p style={{ color: '#1E40AF', fontStyle: 'italic', margin: 0 }}>{userResponse}</p>
                  </div>
                  <p style={{ color: '#3B82F6', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                    Saved to your Lost & Found
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <p style={{ color: '#60A5FA', fontSize: '16px', marginBottom: '20px' }}>
                      Keep wandering?
                    </p>
                    
                    <button
                      onClick={startNewWander}
                      disabled={isLoadingPrompt}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                        color: '#3B82F6',
                        border: '2px solid #3B82F6',
                        borderRadius: '15px',
                        padding: '16px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: isLoadingPrompt ? 'not-allowed' : 'pointer',
                        opacity: isLoadingPrompt ? 0.5 : 1,
                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15), 0 2px 4px rgba(59, 130, 246, 0.1)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoadingPrompt) {
                          e.target.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                          e.target.style.color = 'white'
                          e.target.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoadingPrompt) {
                          e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
                          e.target.style.color = '#3B82F6'
                          e.target.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {isLoadingPrompt ? (
                        <>
                          <div style={{ width: '16px', height: '16px', border: '2px solid #3B82F6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Loading new prompt...
                        </>
                      ) : (
                        "Start a new wander"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 4px 16px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
            {/* Home */}
            <div 
              onClick={() => navigate('home')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            {/* Mates */}
            <div 
              onClick={() => navigate('mates')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            {/* Solo - Active */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#3B82F6',
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
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
        
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
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

export default WanderSolo