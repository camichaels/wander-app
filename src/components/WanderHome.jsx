import React from 'react'

const WanderHome = ({ navigate, currentUser }) => {
  const userStatus = {
    daily: { 
      available: true, 
      completed: false,
      tease: "Share your thoughts with the world"
    },
    solos: { 
      tease: "Food for aliens?"
    },
    mates: { 
      waitingForYou: 2, 
      readyToReveal: 1, 
      reacting: 1
    },
    lostFound: { 
      totalItems: 23 
    },
    stats: {
      totalWanders: 47,
      daysThisMonth: 12,
      activeMates: 4
    }
  }

  const getDailyTease = () => {
    return "Share your thoughts with the world"
  }

  const getUserDisplayName = () => {
    if (!currentUser) return "You"
    return currentUser.display_name || currentUser.username || currentUser.email?.split('@')[0] || "You"
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
      paddingBottom: '80px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '300', 
          color: '#92400e',
          marginBottom: '0'
        }}>
          Wander
        </h1>
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Daily Wander - Reduced padding */}
        <div onClick={() => navigate('daily')} style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '24px',
          padding: '16px 24px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#d97706',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <h2 style={{ color: '#92400e', marginBottom: '4px', fontSize: '18px', fontWeight: '500' }}>Daily Wander</h2>
            <p style={{ color: '#a16207', margin: 0, fontSize: '14px' }}>{getDailyTease()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          
          {/* Solo Wanders - Updated name */}
          <div onClick={() => navigate('solo')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
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
                Personal drift space
            </p>
          </div>

          {/* Wander Mates - Two People Icon */}
          <div onClick={() => navigate('mates')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
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
              Riff with a buddy
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          
          {/* Group Wanders - Connected Circles Icon */}
          <div onClick={() => navigate('groups')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ea580c',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <h4 style={{ color: '#c2410c', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Group Wanders</h4>
            <p style={{ color: '#ea580c', opacity: 0.75, fontSize: '12px' }}>
              Spark conversations
            </p>
          </div>

          <div onClick={() => navigate('lost-found')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#7c3aed',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h4 style={{ color: '#6b21a8', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Lost & Found</h4>
            <p style={{ color: '#7c3aed', opacity: 0.75, fontSize: '12px' }}>
              Browse past wanders
            </p>
          </div>

          <div onClick={() => navigate('profile')} style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#6b7280',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h4 style={{ color: '#4b5563', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{getUserDisplayName()}</h4>
            <p style={{ color: '#6b7280', opacity: 0.75, fontSize: '12px' }}>
              Settings & profile
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          
          <div onClick={() => navigate('share')} style={{
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '12px',
            padding: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h5 style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', margin: '0' }}>Share Wander</h5>
          </div>

          <div onClick={() => navigate('about')} style={{
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '12px',
            padding: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h5 style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', margin: '0' }}>About Wander</h5>
          </div>

          <div onClick={() => navigate('how-to')} style={{
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '12px',
            padding: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h5 style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', margin: '0' }}>How to Wander</h5>
          </div>
        </div>


      </main>
    </div>
  )
}

export default WanderHome