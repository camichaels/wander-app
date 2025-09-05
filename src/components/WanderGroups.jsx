import React, { useState, useEffect } from 'react'
import { GroupPromptsAPI } from '../services/groupPromptsAPI'

const WanderGroups = ({ navigate }) => {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentPromptId, setCurrentPromptId] = useState(null)
  const [mode, setMode] = useState('party')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionExcludeIds, setSessionExcludeIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRandomPrompt()
  }, [mode])

  const loadRandomPrompt = async () => {
    try {
      setIsGenerating(true)
      
      const { data: prompt, error } = await GroupPromptsAPI.getRandomPrompt(
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
        await GroupPromptsAPI.incrementUsageCount(prompt.prompt_id)
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

  const sharePrompt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Wander Group Prompt',
        text: currentPrompt + '\n\nTry Wander for more group fun!',
        url: window.location.origin
      })
    } else {
      navigator.clipboard.writeText(currentPrompt + '\n\nTry Wander for more group fun!')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fed7aa, #fdba74, #fb923c)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#c2410c', fontSize: '18px' }}>Loading prompts...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fed7aa, #fdba74, #fb923c)',
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
          color: '#c2410c',
          marginBottom: '8px'
        }}>
          Group Wanders
        </h1>
        <p style={{ color: '#ea580c', opacity: 0.75, fontSize: '14px' }}>
          Spark conversation out loud
        </p>
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Mode Toggle - softened styling */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '16px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button
            onClick={() => handleModeChange('party')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              backgroundColor: mode === 'party' ? 'rgba(255,255,255,0.4)' : 'transparent',
              color: mode === 'party' ? '#d97706' : '#92400e',
              border: mode === 'party' ? '1px solid rgba(217,119,6,0.3)' : '1px solid transparent'
            }}
          >
            Party Mode
          </button>
          <button
            onClick={() => handleModeChange('work')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              backgroundColor: mode === 'work' ? 'rgba(255,255,255,0.4)' : 'transparent',
              color: mode === 'work' ? '#d97706' : '#92400e',
              border: mode === 'work' ? '1px solid rgba(217,119,6,0.3)' : '1px solid transparent'
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
            color: '#ea580c',
            opacity: 0.8,
            fontSize: '14px',
            textAlign: 'center',
            lineHeight: '1.5',
            margin: 0
          }}>
            {mode === 'party' 
              ? 'Read the prompt out loud and let everyone respond spontaneously. No rules, just fun!'
              : 'Use this to kickoff meetings, break tension, or spark creative brainstorming sessions.'
            }
          </p>
        </div>

        {/* Prompt Display - enhanced to be the hero */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '24px',
          padding: '36px',
          border: '2px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#4b5563',
            fontSize: '22px',
            fontWeight: '400',
            lineHeight: '1.4',
            textAlign: 'center',
            margin: 0
          }}>
            {currentPrompt}
          </p>
        </div>

        {/* Generate Button - de-emphasized */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={generateNewPrompt}
            disabled={isGenerating}
            style={{
              backgroundColor: 'transparent',
              color: '#d97706',
              border: 'none',
              fontSize: '14px',
              textDecoration: 'underline',
              opacity: 0.7,
              fontWeight: '400',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto',
              padding: '8px'
            }}
          >
            {isGenerating ? (
              <>
                <div style={{ width: '12px', height: '12px', border: '2px solid #d97706', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Loading...
              </>
            ) : (
              'Try a different prompt'
            )}
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '50px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#ea580c' }}>
            <button 
              onClick={() => navigate('home')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('daily')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Daily
            </button>
            <button 
              onClick={() => navigate('solo')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Solos
            </button>
            <button 
              onClick={() => navigate('mates')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mates
            </button>
            <button 
              onClick={() => navigate('groups')}
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Groups
            </button>
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