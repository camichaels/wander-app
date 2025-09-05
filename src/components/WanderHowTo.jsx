import React from 'react'

const WanderHowTo = ({ navigate, currentUser }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe, #bae6fd)',
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
          color: '#0f172a',
          marginBottom: '8px'
        }}>
          How to Wander
        </h1>
        <p style={{ color: '#475569', opacity: 0.75, fontSize: '14px' }}>
          It's easier than you think
        </p>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            color: '#0f172a', 
            fontSize: '24px', 
            fontWeight: '500', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Three steps to better thinking
          </h2>
          <p style={{ 
            color: '#4b5563', 
            lineHeight: '1.7', 
            fontSize: '16px', 
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Wandering should feel random, silly, and refreshing, but the beauty is that underneath it all it's your brain's way of making really important connections. Here's how to make the most of these mental drifts.
          </p>

          {/* The Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#10b981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>1</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '500', marginBottom: '8px', marginTop: 0 }}>
                  Read the prompt
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '16px', margin: 0 }}>
                  Take 30 seconds to let the question settle in your mind. Don't rush to answer. 
                  Let it bounce around and see what surfaces naturally.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f59e0b',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>2</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '500', marginBottom: '8px', marginTop: 0 }}>
                  Follow your thoughts
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '16px', margin: 0 }}>
                  Write whatever comes to mind. Don't edit yourself. The goal isn't to be clever 
                  or profound—it's to capture where your mind naturally goes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#8b5cf6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>3</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '500', marginBottom: '8px', marginTop: 0 }}>
                  Save or share
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '16px', margin: 0 }}>
                  Keep it private for later reflection, or share it to see how others wandered 
                  from the same starting point. Both have value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Better Wandering */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ 
            color: '#0f172a', 
            fontSize: '20px', 
            fontWeight: '500', 
            marginBottom: '24px' 
          }}>
            Tips for better wandering
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ 
                color: '#0f172a', 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Don't overthink it.
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                First thoughts are often the most interesting ones.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#0f172a', 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Embrace the weird.
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                Some prompts are intentionally absurd to unlock different types of thinking.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#0f172a', 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                There are no wrong answers.
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                The value is in the mental exercise, not the output.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#0f172a', 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Use the timer mindfully.
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                It's there to prevent overthinking, not to stress you out. Hide it if it helps.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#0f172a', 
                fontSize: '16px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Come back to your wanderings.
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                Check your Lost & Found regularly—old thoughts often feel fresh with time.
              </p>
            </div>
          </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#475569' }}>
            <button 
              onClick={() => navigate('home')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('daily')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Daily
            </button>
            <button 
              onClick={() => navigate('solo')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Solos
            </button>
            <button 
              onClick={() => navigate('mates')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mates
            </button>
            <button 
              onClick={() => navigate('groups')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Groups
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default WanderHowTo