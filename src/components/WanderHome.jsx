import React, { useState, useEffect } from 'react'

const WanderHome = ({ navigate, currentUser }) => {
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState('morning')

  useEffect(() => {
    setTimeOfDay(getTimeOfDay())
  }, [])

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon' 
    return 'evening'
  }

  const getBackgroundGradient = () => {
    const baseGradients = {
      morning: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
      afternoon: 'linear-gradient(135deg, #fde68a, #fcd34d, #f59e0b)', 
      evening: 'linear-gradient(135deg, #fecaca, #f87171, #ef4444)'
    }
    return baseGradients[timeOfDay]
  }

  const getUserDisplayName = () => {
    if (!currentUser) return "You"
    return currentUser.display_name || currentUser.username || currentUser.email?.split('@')[0] || "You"
  }

  const handleShareWander = () => {
    const message = "Hey. I've been giving my brain a break with Wander, and think you should try it. https://wander-app-jet.vercel.app"
    
    // Try SMS first (works on most mobile devices)
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    
    try {
      // Check if we can open SMS
      window.open(smsUrl, '_self')
    } catch (error) {
      // Fallback: copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
          alert('Share message copied to clipboard!')
        }).catch(() => {
          // Final fallback: show message for manual copy
          prompt('Copy this message to share Wander:', message)
        })
      } else {
        // Very old browsers fallback
        prompt('Copy this message to share Wander:', message)
      }
    }
    
    setShowAdminMenu(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: getBackgroundGradient(),
      paddingBottom: '80px',
      transition: 'background 0.5s ease'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '300', 
          color: '#92400e',
          marginBottom: '0'
        }}>
          Wander
        </h1>
        
        {/* Administrative Menu */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#92400e'
            }}
          >
            ⋯
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Daily Wander - Always prominent */}
        <div onClick={() => navigate('daily')} style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '24px',
          padding: '32px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '24px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.85)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#d97706',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="m12 2 0 4"/>
              <path d="m12 18 0 4"/>
              <path d="m4.93 4.93 2.83 2.83"/>
              <path d="m16.24 16.24 2.83 2.83"/>
              <path d="m2 12 4 0"/>
              <path d="m18 12 4 0"/>
              <path d="m4.93 19.07 2.83-2.83"/>
              <path d="m16.24 7.76 2.83-2.83"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#92400e', marginBottom: '4px', fontSize: '20px', fontWeight: '500' }}>Daily Wander</h2>
            <p style={{ color: '#a16207', margin: 0, fontSize: '14px' }}>Share your thoughts with the world</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          
          {/* Solo Wanders */}
          <div onClick={() => navigate('solo')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </div>
            <h3 style={{ color: '#1e40af', marginBottom: '8px', fontSize: '18px', fontWeight: '500' }}>Solo Wanders</h3>
            <p style={{ color: '#2563eb', opacity: 0.75, fontSize: '14px' }}>
              Where thoughts roam free
            </p>
          </div>

          {/* Wander Mates */}
          <div onClick={() => navigate('mates')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#059669',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={{ color: '#047857', marginBottom: '8px', fontSize: '18px', fontWeight: '500' }}>Wander Mates</h3>
            <p style={{ color: '#059669', opacity: 0.75, fontSize: '14px' }}>
              Mind-meld with a friend
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          
          {/* Group Wanders */}
          <div onClick={() => navigate('groups')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#ea580c',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="5" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <circle cx="6" cy="19" r="3"/>
                <line x1="9" x2="15" y1="5" y2="5"/>
                <line x1="15" x2="9" y1="19" y2="19"/>
                <line x1="6" x2="6" y1="8" y2="16"/>
                <line x1="18" x2="18" y1="8" y2="16"/>
              </svg>
            </div>
            <h4 style={{ color: '#c2410c', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Group Wanders</h4>
            <p style={{ color: '#ea580c', opacity: 0.75, fontSize: '14px' }}>
              Stir up some beautiful chaos
            </p>
          </div>

          <div onClick={() => navigate('lost-found')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.75)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#7c3aed',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h4 style={{ color: '#6b21a8', fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Lost & Found</h4>
            <p style={{ color: '#7c3aed', opacity: 0.75, fontSize: '14px' }}>
              Browse past wanders
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}

export default WanderHome