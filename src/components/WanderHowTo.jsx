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
        
        <img 
          src="/how-logo.png" 
          alt="How to Wander" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('How-to logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 28px; font-weight: 600; color: #0f172a; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">How to Wander</h1>';
          }}
          onLoad={(e) => {
            console.log('How-to logo loaded successfully from:', e.target.src);
          }}
        />
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

      {/* Bottom Navigation - No active state since How To isn't in main nav */}
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
            
            {/* Solo */}
            <div 
              onClick={() => navigate('solo')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer'
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
    </div>
  )
}

export default WanderHowTo