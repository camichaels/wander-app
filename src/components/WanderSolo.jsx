import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'

const WanderSolo = ({ navigate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState('prompt')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [promptCategory, setPromptCategory] = useState('')
  const [userResponse, setUserResponse] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [promptTimer, setPromptTimer] = useState(30)
  const [responseTimer, setResponseTimer] = useState(300)
  const [showPromptTimer, setShowPromptTimer] = useState(true)
  const [showResponseTimer, setShowResponseTimer] = useState(true)

  const soloPrompts = {
    reflective: [
      "What's a belief you held as a child that you secretly still find comforting?",
      "If you could have a conversation with your past self, what would you warn them about?",
      "What's something you pretend to understand but actually find mysterious?",
      "Describe a moment when you felt most like yourself.",
      "What's a question you're afraid to know the answer to?"
    ],
    creative: [
      "Invent a holiday that celebrates something completely ordinary.",
      "What would happen if gravity worked differently on Tuesdays?",
      "Design a job that doesn't exist but should.",
      "What's a color that doesn't exist but you can almost imagine?",
      "Create a new emotion and describe when you'd feel it."
    ],
    absurd: [
      "What do you think trees gossip about?",
      "If your socks could talk, what complaints would they have?",
      "What's the most ridiculous superpower you'd actually want?",
      "Invent a conspiracy theory about why we have eyebrows.",
      "What would aliens find weird about human sleeping habits?"
    ],
    personal: [
      "What's your current relationship status with mornings?",
      "Describe your ideal day using only weather terms.",
      "What's something you're surprisingly good at that no one knows?",
      "If your energy had a flavor today, what would it taste like?",
      "What's a tiny thing that made you feel human recently?"
    ]
  }

  const affirmations = [
    "Your mind just stretched in a beautiful way",
    "That's the kind of thinking that changes things",
    "You gave your brain exactly what it needed",
    "Pure wandering magic right there",
    "Your thoughts have their own unique gravity",
    "That's some beautiful mental roaming",
    "You just reclaimed a piece of your mind"
  ]

  const categories = ['reflective', 'creative', 'absurd', 'personal']

  useEffect(() => {
    loadRandomPrompt()
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

  const loadRandomPrompt = () => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const categoryPrompts = soloPrompts[randomCategory]
    const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)]
    setCurrentPrompt(randomPrompt)
    setPromptCategory(randomCategory)
  }

  const loadRelatedPrompt = () => {
    const categoryPrompts = soloPrompts[promptCategory]
    const otherPrompts = categoryPrompts.filter(p => p !== currentPrompt)
    const relatedPrompt = otherPrompts[Math.floor(Math.random() * otherPrompts.length)]
    setCurrentPrompt(relatedPrompt)
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

  const startNewWander = (type) => {
    setUserResponse('')
    setCurrentStep('prompt')
    setShowCelebration(false)
    resetTimers()
    
    if (type === 'related') {
      loadRelatedPrompt()
    } else {
      loadRandomPrompt()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe, #a5b4fc)',
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
          ⓘ
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
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('Solo logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 24px; font-weight: 300; color: #1e40af; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">Solo Wanders</h1>';
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
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e40af', margin: '0 0 16px 0' }}>
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
                Sometimes you'll uncover something personal. Other times, a prompt may spark a completely unexpected idea—something new to follow or carry into the rest of your day. When you finish, you can start another: either drift into a new prompt that loosely follows the last, or leap to one that takes you somewhere entirely different.
              </p>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#1e40af' }}>
                Solo Wanders aren't about performance. They're about giving your mind space to explore—and discovering where they might take you.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  backgroundColor: '#2563eb',
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

            {/* Timer info - consistent visibility, no fading */}
            {showPromptTimer && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <p style={{ 
                  color: '#2563eb', 
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
                    padding: '2px 6px', 
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                    borderRadius: '8px',
                    animation: promptTimer <= 10 ? 'gentlePulse 1s ease-in-out infinite' : 'none'
                  }}>
                    {promptTimer}s
                  </span>
                  <span>•</span>
                  <button 
                    onClick={skipTimer}
                    style={{ 
                      color: '#2563eb', 
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
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => startNewWander('random')}
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.7
                }}
              >
                Try a different prompt
              </button>
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
              placeholder="Let your thoughts roam freely..."
              style={{
                width: '100%',
                height: '128px',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.5)',
                border: '1px solid #3b82f6',
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

            {/* Timer info - consistent visibility, no fading */}
            {showResponseTimer && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ 
                  color: '#2563eb', 
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
                    padding: '2px 6px', 
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                    borderRadius: '8px'
                  }}>
                    {formatTime(responseTimer)}
                  </span>
                  <span>•</span>
                  <button 
                    onClick={() => setShowResponseTimer(false)}
                    style={{ 
                      color: '#2563eb', 
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
                onClick={handleSubmit}
                disabled={!userResponse.trim() || isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
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
                  "Capture this wander"
                )}
              </button>

              <button
                onClick={() => startNewWander('random')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.7,
                  padding: '8px'
                }}
              >
                Try a different prompt
              </button>
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
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{ 
                    color: '#1e40af', 
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
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', marginBottom: '16px' }}>{currentPrompt}</p>
                  <div style={{
                    backgroundColor: '#dbeafe',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ color: '#4b5563', fontStyle: 'italic', margin: 0 }}>{userResponse}</p>
                  </div>
                  <p style={{ color: '#2563eb', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                    Saved to your Lost & Found
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <p style={{ color: '#2563eb', fontSize: '14px', opacity: 0.75, marginBottom: '16px' }}>
                      Keep wandering?
                    </p>
                    
                    {/* Two-column layout for follow-up actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button
                        onClick={() => startNewWander('related')}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          color: '#1e40af',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          border: '1px solid #3b82f6',
                          fontSize: '15px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Follow that thought
                      </button>
                      
                      <button
                        onClick={() => startNewWander('random')}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          color: '#1e40af',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          border: '1px solid #3b82f6',
                          fontSize: '15px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Surprise me
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

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
            
            {/* Solo - Active */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#2563eb',
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