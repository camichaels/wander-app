import React from 'react'

const WanderAbout = ({ navigate, currentUser }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f9fafb, #f3f4f6, #e5e7eb)',
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
          color: '#374151',
          marginBottom: '8px'
        }}>
          About Wander
        </h1>
        <p style={{ color: '#6b7280', opacity: 0.75, fontSize: '14px' }}>
          Why your brain needs this
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
            backgroundColor: '#6366f1',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
          </div>
          <h2 style={{ color: '#374151', fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
            Get lost, find focus
          </h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '16px' }}>
            Your brain is constantly generating ideas, connections, and insights. 
            Most of them get lost in the noise of notifications, meetings, and endless tasks. 
            Wander gives your thoughts space to breathe and develop into something meaningful.
          </p>
        </div>

        {/* Why Your Brain Needs This */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#374151', fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Why your brain needs this
          </h3>
          
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
            We spend our days in reactive mode—responding to emails, jumping between tasks, 
            consuming endless content. But your best ideas don't come from grinding harder. 
            They emerge when you give your mind permission to wander.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6366f1',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <strong style={{ color: '#374151' }}>Unlock creative connections:</strong> Your brain makes its best 
                links when it's not trying to solve specific problems
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6366f1',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <strong style={{ color: '#374151' }}>Process emotions and experiences:</strong> Mental wandering 
                helps you make sense of what's happened and what's coming
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#6366f1',
                borderRadius: '50%',
                marginTop: '10px',
                flexShrink: 0
              }}></div>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <strong style={{ color: '#374151' }}>Reduce mental clutter:</strong> Getting thoughts out of your head 
                creates space for clearer thinking
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#374151', fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            How it works
          </h3>
          
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
            Wander isn't another productivity tool trying to optimize your life. 
            It's a space for the kind of thinking that happens naturally when you're walking, 
            showering, or staring out the window—but captured and given room to grow.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ color: '#374151', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                Daily Wander
              </h4>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '15px' }}>
                One surprising prompt each day. Let your mind drift for a few minutes, 
                then capture what emerges.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#374151', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                Solo Wander
              </h4>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '15px' }}>
                Your personal drift space. Explore thoughts without judgment or pressure.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#374151', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                Wander Mates
              </h4>
              <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '15px' }}>
                Share prompts with friends and see how different minds approach the same starting point.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: '#374151', fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Our philosophy
          </h3>
          
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' }}>
            Not every thought needs to be productive. Not every moment needs to be optimized. 
            Some of the most important work your brain does happens when you're not trying to work at all.
          </p>

          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Wander celebrates the value of mental meandering, creative confusion, and thoughts 
            that lead nowhere except to other interesting thoughts. 
            Because the same brain that can solve complex problems all day deserves 
            a few minutes to get wonderfully, productively weird.
          </p>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#6b7280' }}>
            <button 
              onClick={() => navigate('home')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('daily')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Daily
            </button>
            <button 
              onClick={() => navigate('solo')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Solos
            </button>
            <button 
              onClick={() => navigate('mates')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mates
            </button>
            <button 
              onClick={() => navigate('groups')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Groups
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default WanderAbout