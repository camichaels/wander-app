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
                Daily Wander
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
                Solo Wander
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