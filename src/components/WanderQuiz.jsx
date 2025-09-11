import React, { useState, useEffect } from 'react'

const WanderQuiz = ({ navigate, currentUser }) => {
  const [currentStep, setCurrentStep] = useState('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const questions = [
    {
      text: "When was the last time your mind truly drifted—no screen, no plan, no goal?",
      options: [
        { text: "Honestly… I can't remember", points: 1 },
        { text: "Sometime this past week", points: 2 },
        { text: "Just earlier today, actually", points: 3 }
      ]
    },
    {
      text: "Where do your best ideas usually come to you?",
      options: [
        { text: "Right in the middle of focus", points: 1 },
        { text: "When I'm bored or in a quiet moment", points: 2 },
        { text: "After I step away and stop trying so hard", points: 3 }
      ]
    },
    {
      text: "How often do you give yourself a few unplanned minutes—just space to drift?",
      options: [
        { text: "Rarely, I'm usually on task", points: 1 },
        { text: "Now and then, if the moment allows", points: 2 },
        { text: "Most days—I make room for it", points: 3 }
      ]
    },
    {
      text: "When your mind wanders, what's your first reaction?",
      options: [
        { text: "I reel it back in quickly—distraction feels risky", points: 1 },
        { text: "I notice it, then let it pass", points: 2 },
        { text: "I follow it to see where it leads", points: 3 }
      ]
    },
    {
      text: "How would it feel to invite your brain to wander on purpose?",
      options: [
        { text: "Weird, maybe even uncomfortable", points: 1 },
        { text: "Intriguing… a little unfamiliar, but worth a try", points: 2 },
        { text: "Delightful—I'm all in", points: 3 }
      ]
    }
  ]

  const getResult = (score) => {
    if (score <= 7) {
      return {
        type: "Tightly Tuned",
        description: "You're focused. Structured. On task. All good things. But even the sharpest minds need a little blank space. Wander helps you sprinkle in randomness. No guilt, no pressure, just playful sparks.",
        firstStep: "Try one Daily this week. That's it. Think of it as a reset button. You'll be surprised how it feels.",
        features: [
          { name: "The Daily:", description: "Try it at lunch or between tasks for a mental refresh." },
          { name: "Mates:", description: "Invite one trusted friend. It'll feel safe and surprising." },
          { name: "Solos:", description: "Start small: one prompt, two minutes, no expectations." },
          { name: "Groups:", description: "Use Work Mode for breezy, non-cringey icebreakers." },
          { name: "Lost & Found:", description: "Glance back now and then. You'll be surprised what shows up." }
        ]
      }
    } else if (score <= 11) {
      return {
        type: "Curious Drifter",
        description: "You've got the instinct. Now give it more room. A bit more wandering could unlock new ideas, shift your perspective, or simply brighten your day. Wander will nudge you into the detours you already know you'll love.",
        firstStep: "Enjoy The Daily every day for a week, no excuses. Add one Solo when you catch yourself reaching for a scroll.",
        features: [
          { name: "The Daily:", description: "Start with today's prompt. Quick, light, consistent." },
          { name: "Mates:", description: "Pick one friend and experiment. You'll spark fun in no time." },
          { name: "Solos:", description: "Swap one scroll for one Solo; notice the difference." },
          { name: "Groups:", description: "Next time you're with friends, let Party Mode break the ice." },
          { name: "Lost & Found:", description: "Check back weekly to see what thoughts stick." }
        ]
      }
    } else {
      return {
        type: "Natural Wanderer",
        description: "Your mind already knows how to meander. You give it space, follow its trails, and probably stumble into great ideas when you least expect them. Wander is here to keep that magic flowing. Tiny sparks whenever you want a fresh detour.",
        firstStep: "Make The Daily your anchor. Start each morning with it, then branch into Mates or Solos whenever you're in the mood for more.",
        features: [
          { name: "The Daily:", description: "Make it a morning ritual. Like a daily mind stretch." },
          { name: "Mates:", description: "Invite a close friend for paired prompts. You'll love the reveals." },
          { name: "Solos:", description: "Try back-to-back prompts when an idea feels juicy." },
          { name: "Groups:", description: "Be the spark in gatherings. The playfulness is contagious." },
          { name: "Lost & Found:", description: "Revisit often to expand thoughts that tug at you." }
        ]
      }
    }
  }

  // Check if user has completed quiz on component mount
  useEffect(() => {
    if (currentUser?.id) {
      const quizKey = `wander_quiz_${currentUser.id}`
      const savedResult = localStorage.getItem(quizKey)
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult)
        setResult(parsedResult)
        setCurrentStep('results')
      }
    }
  }, [currentUser])

  const selectAnswer = (questionIndex, optionIndex) => {
    const points = questions[questionIndex].options[optionIndex].points
    setSelectedAnswer(optionIndex)
    
    const newAnswers = {
      ...answers,
      [questionIndex]: points
    }
    setAnswers(newAnswers)
    
    // Auto-progress after a brief pause
    setTimeout(() => {
      setSelectedAnswer(null)
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Calculate score and show results
        const totalScore = Object.values(newAnswers).reduce((sum, points) => sum + points, 0)
        const quizResult = getResult(totalScore)
        
        // Save result
        if (currentUser?.id) {
          const quizKey = `wander_quiz_${currentUser.id}`
          const resultData = {
            ...quizResult,
            score: totalScore,
            completedAt: new Date().toISOString()
          }
          localStorage.setItem(quizKey, JSON.stringify(resultData))
          setResult(resultData)
        }
        
        setCurrentStep('results')
      }
    }, 400)
  }

  const retakeQuiz = () => {
    setCurrentStep('intro')
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
    setSelectedAnswer(null)
    
    // Clear saved result
    if (currentUser?.id) {
      const quizKey = `wander_quiz_${currentUser.id}`
      localStorage.removeItem(quizKey)
    }
  }

  const startQuiz = () => {
    setCurrentStep('question')
    setCurrentQuestion(0)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      
      {/* Background overlay */}
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
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)'
          }}
        >
          ←
        </button>
        
        {/* Info button */}
        <button 
          onClick={() => setShowInfo(true)}
          style={{ 
            position: 'absolute', 
            right: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)'
          }}
        >
          ℹ︎
        </button>

        {/* Logo */}
        <img 
          src="/quiz-logo.png" 
          alt="Wander Quiz" 
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
            console.log('Wander logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 48px; font-weight: 300; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Wander</h1>';
          }}
          onLoad={(e) => {
            console.log('Wander logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 40
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#3B82F6', margin: '0 0 16px 0' }}>
                Wander Quiz
              </h2>
            </div>

            <div style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                This quick quiz helps you discover your wandering style and get personalized tips for making the most of Wander. Answer honestly—there are no wrong answers, just different ways of thinking.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                Your results will be saved, so you can always come back to reference your recommendations. You can retake the quiz anytime if you feel your relationship with mind-wandering has changed.
              </p>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#3B82F6' }}>
                Ready to discover what kind of wanderer you are?
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Intro Screen */}
        {currentStep === 'intro' && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            }}></div>
            
            <h1 style={{ 
              color: '#1E293B', 
              fontSize: '28px', 
              fontWeight: '600', 
              lineHeight: '1.3', 
              margin: '0 0 16px 0'
            }}>
              What kind of Wanderer are you?
            </h1>
            
            <p style={{ 
              color: '#64748B', 
              fontSize: '16px', 
              lineHeight: '1.5', 
              margin: '0 0 32px 0'
            }}>
              Answer these 5 quick questions to discover your wandering style. Then get tips on how to make Wander work its magic for you.
            </p>

            <button
              onClick={startQuiz}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '18px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)'
              }}
            >
              Start Quiz
            </button>
          </div>
        )}

        {/* Question Screen */}
        {currentStep === 'question' && (
          <div>
            

            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
              }}></div>
              
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b', 
                marginBottom: '16px' 
              }}>
                Question {currentQuestion + 1} of {questions.length}
              </div>
              
              <h2 style={{ 
                color: '#1E293B', 
                fontSize: '20px', 
                fontWeight: '500', 
                lineHeight: '1.4', 
                margin: '0 0 32px 0'
              }}>
                {questions[currentQuestion].text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => selectAnswer(currentQuestion, index)}
                    style={{
                      background: selectedAnswer === index ? '#eff6ff' : '#f8fafc',
                      border: selectedAnswer === index ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '16px',
                      color: selectedAnswer === index ? '#1e40af' : '#334155'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnswer !== index) {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.background = '#eff6ff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAnswer !== index) {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.background = '#f8fafc'
                      }
                    }}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {currentStep === 'results' && result && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            }}></div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: '0 0 16px 0' 
              }}>
                {result.type}
              </h1>
              <p style={{ 
                fontSize: '16px', 
                color: '#475569', 
                textAlign: 'left',
                lineHeight: '1.6', 
                margin: 0 
              }}>
                {result.description}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: '0 0 12px 0' 
              }}>
                Do this first
              </h3>
              <p style={{ 
                fontSize: '15px', 
                color: '#475569', 
                lineHeight: '1.5', 
                margin: 0 
              }}>
                {result.firstStep}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1e293b', 
                margin: '0 0 16px 0' 
              }}>
                Go deeper
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.features.map((feature, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px' 
                  }}>
                    <span style={{ 
                      fontWeight: '500', 
                      color: '#1e293b', 
                      minWidth: '80px',
                      fontSize: '14px'
                    }}>
                      {feature.name}
                    </span>
                    <span style={{ 
                      color: '#475569', 
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {feature.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
             <button
  onClick={retakeQuiz}
  style={{
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-2px)'
    e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)'
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)'
    e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)'
  }}
>
  Retake Quiz
</button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 4px 16px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
            {/* Home */}
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
            
            {/* Daily */}
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
            
            {/* Mates */}
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
            
            {/* Solo */}
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
            
            {/* L&F */}
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

export default WanderQuiz