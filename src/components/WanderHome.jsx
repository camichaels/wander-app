import React, { useState, useEffect } from 'react'

const WanderHome = ({ navigate, currentUser }) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [randomText, setRandomText] = useState('')

  // Array of random text lines
  const wanderTexts = [
    "Take time to wander. A playful mind is never empty.",
    "Wanderers don't get lost. They find ideas others miss.",
    "Every wander says something about you. Especially the weird ones.",
    "When you spend time to wander, you're not missing out. You're tuning in.",
    "Wander delivers less doom, and more bloom.",
    "A single wander clears more brain clutter than an hour of scrolling.",
    "A wander takes less time than a coffee break, but energizes just as much.",
    "Five playful minutes now is often worth hours of focus later.",
    "Wander gives your thoughts a playground, not a checklist.",
    "Try The Daily each morning. It's like coffee for your imagination.",
    "Do The Daily. Because a wander a day keeps the doomscroll away.",
    "The Daily takes less time than brushing your teeth. And is way more fun.",
    "The Daily is like a morning stretch for your mind.",
    "The Daily is the spark that can reset your whole day.",
    "Invite your bestie to be a Wander Mate for double the giggles.",
    "Wander Mates: Two minds, one prompt, endless jokes.",
    "Try Wander Mates. Because drifting together beats scrolling alone.",
    "Nothing's more fun than seeing what your Wander Mate came up with.",
    "The best part of Wander Mates? You never know what your buddy will say.",
    "Stuck for that spark? Try a Solo and see what surfaces.",
    "Solos: the world's most playful five-minute break.",
    "Go as weird or deep as you like in Solos. Nobody's watching.",
    "Solos are your private playground for ideas.",
    "Solos = guilt-free me-time for your brain.",
    "Solos are phone breaks that actually refresh you.",
    "There are no wrong answers when you Solo.",
    "Stuck? Solos are the reset button you didn't know you needed.",
    "Need a quick icebreaker? Groups have you covered.",
    "Party Mode in Groups: less small talk, more big laughs.",
    "Work Mode in Groups: icebreakers that don't make you cringe.",
    "Tap Groups and awkward silences will vanish away.",
    "Got five minutes and five friends? Groups are made for that.",
    "Next time the room goes quiet, tap Groups.",
    "Try Groups. Nothing says \"team bonding\" like inventing fake job titles together.",
    "Check out Lost & Found. Yesterday's stray thought might be today's big idea.",
    "Lost & Found is where your best surprises hide.",
    "Go to Lost & Found and expand a wander. You never know sparks will fly.",
    "Lost & Found is basically a secret idea notebook in disguise.",
    "Tap Lost & Found. You might discover something past-you left for future-you.",
    "Think of Lost & Found as a curiosity time machine.",
    "Revisit your wanders in Lost & Found. It's like a playlist of your brain."
  ]

  // Pick a random text on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * wanderTexts.length)
    setRandomText(wanderTexts[randomIndex])
  }, [])

  const getUserDisplayName = () => {
    if (!currentUser) return "You"
    return currentUser.display_name || currentUser.username || currentUser.email?.split('@')[0] || "You"
  }

  const handleShareWander = () => {
    const message = "Hey. I've been giving my brain a break with Wander, and think you should try it. https://wander-app-jet.vercel.app"
    
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    
    try {
      window.open(smsUrl, '_self')
    } catch (error) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
          alert('Share message copied to clipboard!')
        }).catch(() => {
          prompt('Copy this message to share Wander:', message)
        })
      } else {
        prompt('Copy this message to share Wander:', message)
      }
    }
    
    setShowAdminMenu(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3, #F3E8FF)',
      paddingBottom: '60px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
        <img 
          src="/wander-logo.png" 
          alt="Wander" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('Logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 32px; font-weight: 300; color: #7C2D12; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">Wander</h1>';
          }}
          onLoad={(e) => {
            console.log('Logo loaded successfully from:', e.target.src);
          }}
        />
        
        {/* Three dots menu */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            style={{
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}
          >
            •••
          </button>
          
          {showAdminMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              minWidth: '140px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              <button onClick={() => { navigate('profile'); setShowAdminMenu(false) }} 
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#4b5563', borderRadius: '6px' }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                Profile
              </button>
              <button onClick={handleShareWander}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#4b5563', borderRadius: '6px' }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                Share Wander
              </button>
              <button onClick={() => { navigate('about'); setShowAdminMenu(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#4b5563', borderRadius: '6px' }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                About
              </button>
              <button onClick={() => { navigate('how-to'); setShowAdminMenu(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#4b5563', borderRadius: '6px' }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                How to Wander
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '400px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* The Daily - Hero card */}
        <div onClick={() => navigate('daily')} style={{
          background: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
          borderRadius: '20px',
          padding: '24px',
          cursor: 'pointer',
          marginBottom: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          
          {/* Sun icon - bigger and properly sized */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#D97706" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              color: '#7C2D12', 
              marginBottom: '4px', 
              fontSize: '20px', 
              fontWeight: '600',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              margin: 0
            }}>
              The Daily
            </h2>
            <p style={{ 
              color: '#92400E', 
              margin: '4px 0 8px 0', 
              fontSize: '14px',
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              Share your thoughts with the world
            </p>
            <p style={{ 
              color: '#D97706', 
              margin: 0, 
              fontSize: '11px', 
              fontWeight: '500',
              opacity: 0.8,
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              START HERE EACH DAY
            </p>
          </div>
        </div>

        {/* Wander Mates - Secondary primary with aligned icon */}
        <div onClick={() => navigate('mates')} style={{
          background: 'linear-gradient(135deg, #A7F3D0, #6EE7B7)',
          borderRadius: '16px',
          padding: '24px',
          cursor: 'pointer',
          marginBottom: '24px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          
          {/* Users icon - aligned with Daily icon */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#059669" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              color: '#065F46', 
              marginBottom: '4px', 
              fontSize: '18px', 
              fontWeight: '600',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              margin: 0
            }}>
              Wander Mates
            </h3>
            <p style={{ 
              color: '#047857', 
              margin: '4px 0 0 0', 
              fontSize: '14px',
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              Mind-meld with a friend
            </p>
          </div>
        </div>

        {/* Visual separator */}
        <div style={{
          height: '1px',
          background: 'rgba(209, 213, 219, 0.6)',
          margin: '0 16px 24px 16px'
        }}></div>

        {/* Secondary grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '12px',
          marginBottom: '24px'
        }}>
          
          {/* Solo Wanders - with cloud icon */}
          <div onClick={() => navigate('solo')} style={{
            background: 'linear-gradient(135deg, #BFDBFE, #93C5FD)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90px',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            
            {/* Cloud icon - bigger */}
            <div style={{ marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </div>
            
            <h4 style={{ 
              color: '#1E40AF', 
              fontSize: '14px', 
              fontWeight: '600',
              margin: '0 0 4px 0',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif'
            }}>
              Solos
            </h4>
            <p style={{ 
              color: '#1E40AF', 
              fontSize: '11px',
              margin: 0,
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              Private space
            </p>
          </div>

          {/* Groups - single line subtitle */}
          <div onClick={() => navigate('groups')} style={{
            background: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90px',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            
            {/* Network icon - bigger */}
            <div style={{ marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="6" r="3"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="18" r="3"/>
                <path d="M9 18h6"/>
                <path d="M12 12v6"/>
                <path d="M12 12l-3-6"/>
                <path d="M12 12l3-6"/>
              </svg>
            </div>
            
            <h4 style={{ 
              color: '#B91C1C', 
              fontSize: '14px', 
              fontWeight: '600',
              margin: '0 0 4px 0',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif'
            }}>
              Groups
            </h4>
            <p style={{ 
              color: '#B91C1C', 
              fontSize: '11px',
              margin: 0,
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              Spark talks
            </p>
          </div>

          {/* Lost & Found */}
          <div onClick={() => navigate('lost-found')} style={{
            background: 'linear-gradient(135deg, #E9D5FF, #DDD6FE)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90px',
            textAlign: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
          }}>
            
            {/* Star icon - bigger */}
            <div style={{ marginBottom: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#7C3AED" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </div>
            
            <h4 style={{ 
              color: '#6D28D9', 
              fontSize: '14px', 
              fontWeight: '600',
              margin: '0 0 4px 0',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif'
            }}>
              Lost & Found
            </h4>
            <p style={{ 
              color: '#6D28D9', 
              fontSize: '11px',
              margin: 0,
              fontFamily: 'SF Pro Text, -apple-system, sans-serif'
            }}>
              Past wanders
            </p>
          </div>
        </div>

        {/* Random inspirational text */}
        {randomText && (
          <div style={{
            textAlign: 'center',
            color: '#8B7355',
            fontSize: '16px',
            fontStyle: 'italic',
            lineHeight: '1.4',
            opacity: 0.75,
            marginTop: '32px',
            fontFamily: 'SF Pro Text, -apple-system, sans-serif',
            maxWidth: '320px',
            margin: '32px auto 0 auto'
          }}>
            {randomText}
          </div>
        )}

      </main>

    </div>
  )
}

export default WanderHome