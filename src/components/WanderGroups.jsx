import React, { useState, useEffect } from 'react'

const WanderGroups = ({ navigate }) => {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [mode, setMode] = useState('party')
  const [isGenerating, setIsGenerating] = useState(false)

  const groupPrompts = {
    party: [
      "What's the best fake rumor you could start about someone in this room?",
      "If everyone here was a snack food, who would be what and why?",
      "What's the most unexpected thing that could happen right now?",
      "Invent a drinking game based on something everyone here does.",
      "What's a conspiracy theory about this party that would actually be believable?",
      "If this group formed a band, what would we be called and what's our hit song?",
      "What's something everyone here is probably thinking but not saying?",
      "Describe the energy of this room using only weather terms.",
      "What's a superpower everyone here secretly wishes they had tonight?",
      "If we had to elect a king/queen of this gathering, who and why?"
    ],
    work: [
      "What's a fake job title that best describes what you really do?",
      "Invent an office holiday we should celebrate every year. What's it for?",
      "If our team was a kitchen, who would be which appliance?",
      "What's the most ridiculous meeting we could schedule right now?",
      "Describe our project using only movie genres.",
      "What's a skill everyone here has that's not on their resume?",
      "If we started a food truck, what would we serve and what's our slogan?",
      "What's something that would make Mondays actually exciting?",
      "Invent a new department our company desperately needs.",
      "What's the weirdest thing about our industry that outsiders wouldn't understand?"
    ]
  }

  useEffect(() => {
    loadRandomPrompt()
  }, [mode])

  const loadRandomPrompt = () => {
    const prompts = groupPrompts[mode]
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    setCurrentPrompt(randomPrompt)
  }

  const generateNewPrompt = () => {
    setIsGenerating(true)
    setTimeout(() => {
      loadRandomPrompt()
      setIsGenerating(false)
    }, 500)
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
        
        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button
            onClick={() => setMode('party')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: mode === 'party' ? '#ea580c' : 'transparent',
              color: mode === 'party' ? 'white' : '#ea580c'
            }}
          >
            Party Mode
          </button>
          <button
            onClick={() => setMode('work')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: mode === 'work' ? '#ea580c' : 'transparent',
              color: mode === 'work' ? 'white' : '#ea580c'
            }}
          >
            Work Mode
          </button>
        </div>

        {/* Usage Tips - Moved between toggle and prompt box */}
        <div style={{
          backgroundColor: 'transparent',
          padding: '16px 0',
          marginBottom: '16px'
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

        {/* Prompt Display */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#4b5563',
            fontSize: '20px',
            fontWeight: '300',
            lineHeight: '1.5',
            textAlign: 'center',
            margin: 0
          }}>
            {currentPrompt}
          </p>
        </div>

        {/* Generate Button - Moved below prompt box */}
        <button
          onClick={generateNewPrompt}
          disabled={isGenerating}
          style={{
            width: '100%',
            backgroundColor: '#ea580c',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isGenerating ? (
            <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            'Generate new prompt'
          )}
        </button>
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