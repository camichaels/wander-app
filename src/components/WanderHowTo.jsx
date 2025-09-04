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

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#3b82f6',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
              <path d="M8 14h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 14h.01"/>
              <path d="M8 18h.01"/>
              <path d="M12 18h.01"/>
              <path d="M16 18h.01"/>
            </svg>
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
            Three steps to better thinking
          </h2>
          <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '16px' }}>
            Wandering isn't random—it's your brain's way of making connections. 
            Here's how to make the most of your mental drifts.
          </p>
        </div>

        {/* The Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          
          {/* Step 1 */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>1</span>
              </div>
              <div>
                <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  Read the prompt
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>
                  Take 30 seconds to let the question settle in your mind. Don't rush to answer. 
                  Let it bounce around and see what surfaces naturally.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>2</span>
              </div>
              <div>
                <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  Follow your thoughts
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>
                  Write whatever comes to mind. Don't edit yourself. The goal isn't to be clever 
                  or profound—it's to capture where your mind naturally goes.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>3</span>
              </div>
              <div>
                <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  Save or share
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>
                  Keep it private for later reflection, or share it to see how others wandered 
                  from the same starting point. Both have value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Different Ways to Wander */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Different ways to wander
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                Daily Wander
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
                One curated prompt per day. Perfect for building a habit of reflective thinking. 
                See how thousands of others interpreted the same starting point.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                Solo Wander
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
                Your personal thinking space. Choose from reflective, creative, absurd, 
                or personal prompts. No time limits, no pressure.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                Wander Mates
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
                Explore prompts with friends. See how different minds approach the same question. 
                React to each other's wanderings and discover new perspectives.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#f97316', borderRadius: '50%' }}></div>
                Group Wanders
              </h4>
              <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
                Conversation starters for parties, meetings, or any gathering. 
                Read prompts aloud and let everyone respond spontaneously.
              </p>
            </div>
          </div>
        </div>

        {/* Tips for Better Wandering */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Tips for better wandering
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a' }}>Don't overthink it.</strong> First thoughts are often the most interesting ones.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a' }}>Embrace the weird.</strong> Some prompts are intentionally absurd to unlock different types of thinking.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a' }}>There are no wrong answers.</strong> The value is in the mental exercise, not the output.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a' }}>Use the timer mindfully.</strong> It's there to prevent overthinking, not to stress you out. Hide it if it helps.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a' }}>Come back to your wanderings.</strong> Check your Lost & Found regularly—old thoughts often feel fresh with time.
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