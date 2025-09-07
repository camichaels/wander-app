import React from 'react'

const WanderAbout = ({ navigate, currentUser }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f9fafb, #f3f4f6, #e5e7eb)',
      paddingBottom: '100px'
    }}>
      
      <header style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
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

        {/* Logo replacing text title */}
        <img 
          src="/about-logo.png" 
          alt="About Wander" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('About logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 28px; font-weight: 600; color: #374151; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">About Wander</h1>';
          }}
          onLoad={(e) => {
            console.log('About logo loaded successfully from:', e.target.src);
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
            color: '#374151', 
            fontSize: '24px', 
            fontWeight: '500', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Get lost, find focus
          </h2>
          
          <div style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '16px' }}>
            <p style={{ marginBottom: '20px' }}>
              We spend our days in reactive mode—responding to emails, jumping between tasks, consuming endless content. But your best ideas don't come from grinding harder. They emerge when you give your mind permission to wander.
            </p>
            
            <p style={{ marginBottom: '20px' }}>
              Not every thought needs to be productive. Not every moment needs to be optimized. Some of the most important work your brain does happens when you're not trying to work at all.
            </p>
            
            <p style={{ margin: 0 }}>
              Wander celebrates the value of mental meandering, creative confusion, and thoughts that lead nowhere except to other interesting thoughts. Because the same brain that can solve complex problems all day deserves a few minutes to get wonderfully, productively weird.
            </p>
          </div>
        </div>

        {/* When you let your mind drift */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: '#374151', 
            fontSize: '20px', 
            fontWeight: '500', 
            marginBottom: '24px' 
          }}>
            So when you let your mind drift
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <p style={{ color: '#6366f1', fontSize: '16px', fontWeight: '400', margin: 0 }}>
              Ideas surface naturally
            </p>
            <p style={{ color: '#6366f1', fontSize: '16px', fontWeight: '400', margin: 0 }}>
              Breakthroughs emerge
            </p>
            <p style={{ color: '#6366f1', fontSize: '16px', fontWeight: '400', margin: 0 }}>
              Patterns click into place
            </p>
            <p style={{ color: '#6366f1', fontSize: '16px', fontWeight: '400', margin: 0 }}>
              Distant thoughts connect
            </p>
          </div>
        </div>

        {/* Ways to wander */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ 
            color: '#374151', 
            fontSize: '20px', 
            fontWeight: '500', 
            marginBottom: '20px' 
          }}>
            Ways to wander
          </h3>
          
          <p style={{ 
            color: '#4b5563', 
            lineHeight: '1.7', 
            fontSize: '16px', 
            marginBottom: '32px' 
          }}>
            Wander isn't another productivity tool trying to optimize your life. It's a space for the kind of thinking that happens naturally when you're walking, showering, or staring out the window—but captured and given room to grow.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ 
                color: '#374151', 
                fontSize: '18px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                The Daily
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                One surprising prompt each day. Let your mind drift for a few minutes, then capture what emerges. Perfect for building a habit of reflective thinking. And post to the world to see how others interpreted the same starting point.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#374151', 
                fontSize: '18px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Solo Wanders
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                Your personal drift space. A mix of reflective, creative, absurd, and personal prompts. Take advantage of these moments to explore thoughts without judgment or pressure.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#374151', 
                fontSize: '18px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Wander Mates
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                Share prompts with a friend and see how different minds approach them. Plus you get space to react to each other's wanderings, discover new perspectives, or just have a laugh.
              </p>
            </div>

            <div>
              <h4 style={{ 
                color: '#374151', 
                fontSize: '18px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                Group Wanders
              </h4>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6', 
                fontSize: '15px',
                margin: 0
              }}>
                Conversation starters for parties, meetings, or any gathering. Read prompts aloud and let everyone respond spontaneously.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation - No active state since About isn't in main nav */}
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

export default WanderAbout