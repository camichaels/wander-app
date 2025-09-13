import React, { useState, useEffect } from 'react'
import { groupPromptsAPI } from '../services/groupPromptsAPI'

const WanderGroups = ({ navigate }) => {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentPromptId, setCurrentPromptId] = useState(null)
  const [mode, setMode] = useState('party')
  const [showInfo, setShowInfo] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionExcludeIds, setSessionExcludeIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRandomPrompt()
  }, [mode])

  const loadRandomPrompt = async () => {
    try {
      setIsGenerating(true)
      
      const { data: prompt, error } = await groupPromptsAPI.getRandomPrompt(
        mode, 
        sessionExcludeIds
      )
      
      if (error) {
        console.error('Error loading prompt:', error)
        setCurrentPrompt('Unable to load prompt. Please try again.')
        return
      }
      
      if (prompt) {
        setCurrentPrompt(prompt.prompt_text)
        setCurrentPromptId(prompt.prompt_id)
        
        // Add to session exclude list to avoid immediate repeats
        setSessionExcludeIds(prev => [...prev, prompt.prompt_id])
        
        // Increment usage count
        await groupPromptsAPI.incrementUsageCount(prompt.prompt_id)
      }
    } catch (error) {
      console.error('Error in loadRandomPrompt:', error)
      setCurrentPrompt('Unable to load prompt. Please try again.')
    } finally {
      setIsGenerating(false)
      setLoading(false)
    }
  }

  const generateNewPrompt = async () => {
    await loadRandomPrompt()
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setSessionExcludeIds([]) // Clear session history when switching modes
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{ 
          color: '#DC2626', 
          fontSize: '18px',
          position: 'relative',
          zIndex: 1 
        }}>
          Loading prompts...
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
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
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.1)'
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
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.1)'
          }}
        >
          ℹ️
        </button>

        {/* Logo replacing text title */}
        <img 
          src="/groups-logo.png" 
          alt="Group Wanders" 
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
            console.log('Groups logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 48px; font-weight: 600; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Group Wanders</h1>';
          }}
          onLoad={(e) => {
            console.log('Groups logo loaded successfully from:', e.target.src);
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
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#DC2626', margin: '0 0 16px 0' }}>
                Group Wanders
              </h2>
            </div>

            <div style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                Sometimes wandering is better out loud. Group Wanders are designed for gatherings of all kinds—your shuffle button for playful connection. They bring out spontaneity while making it easy for everyone to show a little creativity. No prep required. Just tap to get a prompt and see where the conversation flows.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                In Party Mode, the focus is laughs and surprises. Prompts are quick and playful, meant to get everyone reacting in the moment: "What's the best fake rumor you could start about each other?" or "What's the most unexpected thing that could happen right now?" Nothing's saved—you just enjoy it together.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                In Work Mode, prompts lean toward light team-building. They're breezy icebreakers and creative twists that help people connect and think differently: "What's a fake job title that best describes what you really do?" or "Invent an office holiday we should celebrate every year."
              </p>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#DC2626' }}>
                Group Wanders aren't about recording responses—they're about shared energy. The kind of quick detour that makes a room feel lighter, more playful, and more connected.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Enhanced Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => handleModeChange('party')}
            style={{
              flex: 1,
              background: mode === 'party' 
                ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' 
                : 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)',
              border: `2px solid ${mode === 'party' ? '#B91C1C' : 'rgba(220, 38, 38, 0.3)'}`,
              borderRadius: '15px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              color: mode === 'party' ? 'white' : '#DC2626',
              boxShadow: mode === 'party' 
                ? '0 8px 24px rgba(220, 38, 38, 0.3)' 
                : '0 4px 16px rgba(220, 38, 38, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'party') {
                e.target.style.background = 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)'
                e.target.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'party') {
                e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            Party Mode
          </button>
          
          <button
            onClick={() => handleModeChange('work')}
            style={{
              flex: 1,
              background: mode === 'work' 
                ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' 
                : 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)',
              border: `2px solid ${mode === 'work' ? '#B91C1C' : 'rgba(220, 38, 38, 0.3)'}`,
              borderRadius: '15px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              color: mode === 'work' ? 'white' : '#DC2626',
              boxShadow: mode === 'work' 
                ? '0 8px 24px rgba(220, 38, 38, 0.3)' 
                : '0 4px 16px rgba(220, 38, 38, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (mode !== 'work') {
                e.target.style.background = 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)'
                e.target.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (mode !== 'work') {
                e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #FEF2F2 100%)'
                e.target.style.transform = 'translateY(0)'
              }
            }}
          >
            Work Mode
          </button>
        </div>

        {/* Usage Tips */}
        <div style={{
          backgroundColor: 'transparent',
          padding: '16px 0',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#B91C1C',
            opacity: 0.9,
            fontSize: '16px',
            textAlign: 'center',
            lineHeight: '1.4',
            margin: 0
          }}>
            {mode === 'party' 
              ? 'Read the prompt out loud and let everyone respond spontaneously. No rules, just fun!'
              : 'Use this to kickoff meetings, break tension, or spark creative brainstorming sessions.'
            }
          </p>
        </div>

        {/* Enhanced Prompt Display */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.15), 0 2px 8px rgba(220, 38, 38, 0.1)',
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
          
          <p style={{
            color: '#374151',
            fontSize: '20px',
            fontWeight: '500',
            lineHeight: '1.4',
            textAlign: 'center',
            margin: 0,
            fontFamily: 'SF Pro Text, -apple-system, sans-serif'
          }}>
            {currentPrompt}
          </p>
        </div>

        {/* Enhanced Generate Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={generateNewPrompt}
            disabled={isGenerating}
            style={{
              backgroundColor: 'transparent',
              color: '#B91C1C',
              border: 'none',
              fontSize: '14px',
              textDecoration: 'underline',
              opacity: 0.8,
              fontWeight: '400',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto',
              padding: '8px',
              fontFamily: 'SF Pro Text, -apple-system, sans-serif',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) {
                e.target.style.opacity = '1'
                e.target.style.color = '#DC2626'
              }
            }}
            onMouseLeave={(e) => {
              if (!isGenerating) {
                e.target.style.opacity = '0.8'
                e.target.style.color = '#B91C1C'
              }
            }}
          >
            {isGenerating ? (
              <>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  border: '2px solid #B91C1C', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Loading...
              </>
            ) : (
              'Try a different prompt'
            )}
          </button>
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.15), 0 4px 16px rgba(220, 38, 38, 0.1)'
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
            
            {/* Solo */}
            <div 
              onClick={() => navigate('solo')}
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
      `}</style>
    </div>
  )
}

export default WanderGroups