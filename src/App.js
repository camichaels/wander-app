import React, { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import WanderHome from './components/WanderHome'
import WanderDaily from './components/WanderDaily'
import WanderSolo from './components/WanderSolo'
import WanderGroups from './components/WanderGroups'
import WanderLostFound from './components/WanderLostFound'
import WanderMates from './components/WanderMates'
import WanderProfile from './components/WanderProfile'
import WanderAbout from './components/WanderAbout'
import WanderHowTo from './components/WanderHowTo'

const AuthForm = ({ onUserSelect }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for the magic link!')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '300', color: '#92400e', marginBottom: '8px' }}>Wander</h1>
          <p style={{ color: '#a16207' }}>Get lost, find focus</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid #d97706',
              outline: 'none'
            }}
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#d97706',
              color: 'white',
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <div style={{ margin: '16px 0', textAlign: 'center', color: '#a16207' }}>or</div>

        <button
          onClick={() => onUserSelect()}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.6)',
            color: '#92400e',
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid #d97706',
            cursor: 'pointer'
          }}
        >
          Demo Mode
        </button>

        {message && (
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#a16207', textAlign: 'center' }}>{message}</p>
        )}
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(null) // Our demo user system
  const [showDemoMode, setShowDemoMode] = useState(false)

  // Load saved user from localStorage on app start
  useEffect(() => {
    const loadSavedUser = () => {
      try {
        const savedUser = localStorage.getItem('wander-demo-user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setCurrentUser(parsedUser)
          setShowDemoMode(true)
        }
      } catch (error) {
        console.warn('Error loading saved user:', error)
        // Clear corrupted localStorage data
        localStorage.removeItem('wander-demo-user')
      }
    }

    loadSavedUser()
  }, [])

  // Save user to localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('wander-demo-user', JSON.stringify(currentUser))
      } catch (error) {
        console.warn('Error saving user to localStorage:', error)
      }
    } else {
      // Clear localStorage when user logs out
      localStorage.removeItem('wander-demo-user')
    }
  }, [currentUser])

  // Handle Supabase authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const navigate = (page) => {
    setCurrentPage(page)
  }

  const handleDemoModeSelect = () => {
    setShowDemoMode(true)
    setCurrentPage('profile') // Go directly to profile for user selection
  }

  const handleUserLogout = () => {
    setCurrentUser(null)
    setShowDemoMode(false)
    setCurrentPage('home')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home': 
        return <WanderHome navigate={navigate} currentUser={currentUser} />
      case 'daily': 
        return <WanderDaily navigate={navigate} currentUser={currentUser} />
      case 'solo': 
        return <WanderSolo navigate={navigate} currentUser={currentUser} />
      case 'groups': 
        return <WanderGroups navigate={navigate} currentUser={currentUser} />
      case 'lost-found': 
        return <WanderLostFound navigate={navigate} currentUser={currentUser} />
      case 'mates': 
        return <WanderMates navigate={navigate} currentUser={currentUser} />
      case 'about': 
        return <WanderAbout navigate={navigate} currentUser={currentUser} />
      case 'how-to': 
        return <WanderHowTo navigate={navigate} currentUser={currentUser} />
      case 'profile': 
        return (
          <WanderProfile 
            navigate={navigate} 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser}
            onLogout={handleUserLogout}
          />
        )
      default: 
        return <WanderHome navigate={navigate} currentUser={currentUser} />
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '2px solid #d97706', 
            borderTop: '2px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#a16207' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // If in demo mode or have demo user, show the app
  if (showDemoMode || currentUser) {
    return (
      <div className="App">
        {renderCurrentPage()}
      </div>
    )
  }

  // If not authenticated and not in demo mode, show auth form
  if (!user) {
    return <AuthForm onUserSelect={handleDemoModeSelect} />
  }

  // If authenticated but no demo user selected, go to profile to select/create user
  if (user && !currentUser) {
    return (
      <WanderProfile 
        navigate={navigate} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser}
        onLogout={handleUserLogout}
      />
    )
  }

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  )
}

export default App