import React, { useState } from 'react'

import WanderDoodlePad from './WanderDoodlePad'
import WanderScriptO from './WanderScriptO'

const WanderLabs = ({ navigate, currentUser }) => {
  const [currentExperiment, setCurrentExperiment] = useState(null)

  const experiments = [
    {
      id: 'doodles',
      name: 'Wander Doodles',
      description: 'Draw your response instead of writing',
      icon: '🎨',
      color: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
      available: true
    },
    {
      id: 'script',
      name: 'Script o Wander',
      description: 'Create movie plots from random elements',
      icon: '🎬',
      color: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      available: true
    }
    // Future experiments would go here:
    // {
    //   id: 'emoji',
    //   name: 'Emoji Only',
    //   description: 'Express yourself with just emojis',
    //   icon: '😊',
    //   color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    //   available: true
    // },
  ]

  const startExperiment = (experimentId) => {
    setCurrentExperiment(experimentId)
  }

  const exitExperiment = () => {
    setCurrentExperiment(null)
  }

  // Render specific experiment
  if (currentExperiment === 'doodles') {
    return <WanderDoodlePad onCancel={exitExperiment} />
  }
  if (currentExperiment === 'script') {
  return <WanderScriptO onCancel={exitExperiment} />
}

  // Main Labs page
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        pointerEvents: 'none'
      }}></div>

      <header style={{ padding: '24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <button 
          onClick={() => navigate('home')}
          style={{ 
            position: 'absolute', 
            left: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(14, 165, 233, 0.1)'
          }}
        >
          ←
        </button>
        
        <img 
          src="/labs-logo.png" 
          alt="Wander Labs" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            console.log('Labs logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 32px; font-weight: 300; color: #0EA5E9; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Wander Labs</h1>';
          }}
          onLoad={(e) => {
            console.log('Labs logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Introduction */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(14, 165, 233, 0.15), 0 2px 8px rgba(14, 165, 233, 0.1)',
          textAlign: 'left'
        }}>
          <p style={{ 
            color: '#374151', 
            fontSize: '16px', 
            lineHeight: '1.5', 
            margin: 0
          }}>
            Sometimes words aren't enough. These experimental formats let you respond to prompts in completely different ways—through doodles, emojis, creative constraints, and more.
          </p>
        </div>

        {/* Experiment Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {experiments.map((experiment) => (
            <div 
              key={experiment.id}
              onClick={() => experiment.available && startExperiment(experiment.id)}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: experiment.available ? 'pointer' : 'not-allowed',
                opacity: experiment.available ? 1 : 0.5,
                boxShadow: '0 8px 32px rgba(14, 165, 233, 0.15), 0 2px 8px rgba(14, 165, 233, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (experiment.available) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(14, 165, 233, 0.2), 0 4px 12px rgba(14, 165, 233, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(14, 165, 233, 0.15), 0 2px 8px rgba(14, 165, 233, 0.1)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: experiment.id === 'doodles' ? 'rgba(124, 58, 237, 0.1)' : 
                             experiment.id === 'script' ? 'rgba(220, 38, 38, 0.1)' : 'transparent'
                }}>
                  {experiment.id === 'doodles' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.7a2.41 2.41 0 0 0-3.41 0Z"/>
                      <path d="m8.5 8.5 7 7"/>
                      <path d="m2 2 20 20"/>
                    </svg>
                  ) : experiment.id === 'script' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
                      <rect x="2" y="6" width="14" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: '24px' }}>{experiment.icon}</span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#0EA5E9',
                    margin: '0 0 4px 0'
                  }}>
                    {experiment.name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6B7280',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {experiment.description}
                  </p>
                </div>
                
                <div style={{
                  color: '#9CA3AF',
                  fontSize: '18px'
                }}>
                  →
                </div>
              </div>
            </div>
          ))}
          
          {/* Coming Soon Placeholder */}
          <div style={{
            background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(209, 213, 219, 0.3)',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
          }}>
            <p style={{ 
              color: '#9CA3AF', 
              fontSize: '14px',
              margin: 0,
              fontStyle: 'italic'
            }}>
              More experimental formats coming soon...
            </p>
          </div>
        </div>
      </main>

      {/* Navigation Bar */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(14, 165, 233, 0.15), 0 4px 16px rgba(14, 165, 233, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
            <div 
              onClick={() => navigate('home')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            <div 
              onClick={() => navigate('daily')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            <div 
              onClick={() => navigate('mates')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            <div 
              onClick={() => navigate('solo')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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
            
            <div 
              onClick={() => navigate('lost-found')}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
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

export default WanderLabs