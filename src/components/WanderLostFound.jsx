import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'

const WanderLostFound = ({ navigate, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [currentFilter, setCurrentFilter] = useState('shuffled')
  const [expandingId, setExpandingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Expansion-specific state
  const [expansionTypes, setExpansionTypes] = useState([])
  const [showExpansionPaths, setShowExpansionPaths] = useState(false)
  const [selectedExpansionType, setSelectedExpansionType] = useState(null)
  const [expansionPrompts, setExpansionPrompts] = useState({})
  const [expansionStep, setExpansionStep] = useState('edit') // 'edit', 'paths', 'initial', 'tieup'
  const [expansionData, setExpansionData] = useState({
    initialResponse: '',
    tieupResponse: ''
  })

  useEffect(() => {
    loadInitialData()
  }, [currentUser])

  useEffect(() => {
    searchPrompts()
  }, [searchTerm, currentFilter])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await searchPrompts()
      
      // Load expansion types
      const { data: types } = await PromptHistoryAPI.getExpansionTypes()
      setExpansionTypes(types || [])
    } catch (err) {
      setError('Failed to load your wandering history')
    } finally {
      setLoading(false)
    }
  }

  const searchPrompts = async () => {
    try {
      if (!currentUser?.id) {
        setResponses([])
        return
      }

      const searchParams = {
        userId: currentUser.id,
        searchText: searchTerm || null,
        favoritesOnly: currentFilter === 'starred',
        sortBy: getSortBy(currentFilter),
        sortDirection: getSortDirection(currentFilter),
        limit: 50,
        offset: 0
      }

      const { data, error } = await PromptHistoryAPI.searchPromptHistory(searchParams)
      
      if (error) {
        setError('Failed to search your wanders')
        return
      }

      const transformedData = data?.map(item => ({
        id: item.id,
        prompt: item.prompt_text,
        response: item.response_text,
        date: new Date(item.created_at).toISOString().split('T')[0],
        starred: item.is_favorite || false,
        source: capitalizeFirst(item.prompt_type || 'Unknown'),
        title: item.title,
        primaryCategory: item.primary_category_name,
        secondaryCategory: item.secondary_category_name,
        tags: item.tags || [],
        expansion: item.expansion
      })) || []

      if (currentFilter === 'shuffled') {
        setResponses(shuffle(transformedData))
      } else {
        setResponses(transformedData)
      }
    } catch (err) {
      setError('Failed to search your wanders')
    }
  }

  const getSortBy = (filter) => {
    switch (filter) {
      case 'recent': return 'created_at'
      case 'prompt-az': return 'prompt_text'
      case 'starred': return 'created_at'
      default: return 'created_at'
    }
  }

  const getSortDirection = (filter) => {
    return filter === 'prompt-az' ? 'ASC' : 'DESC'
  }

  const shuffle = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const toggleStar = async (id) => {
    try {
      if (!currentUser?.id) return
      
      const { data, error } = await PromptHistoryAPI.toggleFavorite(id, currentUser.id)
      if (!error) {
        setResponses(prev => prev.map(r => 
          r.id === id ? { ...r, starred: data } : r
        ))
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const smartExpand = (item) => {
    setExpandingId(item.id)
    setEditText(item.response)

    if (item.expansion) {
      // Has expansion - edit existing expansion content
      const expansionType = expansionTypes.find(t => 
        t.expansion_type_id === item.expansion.expansion_type_id
      )
      setSelectedExpansionType(expansionType)
      setExpansionData({
        initialResponse: item.expansion.initial_response,
        tieupResponse: item.expansion.tieup_response || ''
      })
      setExpansionPrompts({
        initial_prompt_text: item.expansion.initial_prompt.prompt_text,
        tieup_prompt_text: item.expansion.tieup_prompt.prompt_text
      })
      setExpansionStep('edit-expansion')
    } else {
      // No expansion - start fresh
      setExpansionStep('edit')
      setShowExpansionPaths(false)
      setSelectedExpansionType(null)
      setExpansionData({
        initialResponse: '',
        tieupResponse: ''
      })
    }
  }

  const proceedToExpansionPaths = () => {
    setExpansionStep('paths')
    setShowExpansionPaths(true)
  }

  const selectExpansionPath = async (expansionType) => {
    setSelectedExpansionType(expansionType)
    
    // Get random prompts for this expansion type
    const { data: prompts } = await PromptHistoryAPI.getRandomExpansionPrompts(expansionType.expansion_type_id)
    setExpansionPrompts(prompts || {})
    setExpansionStep('initial')
    setShowExpansionPaths(false)
  }

  const saveExpansionStep = () => {
    if (expansionStep === 'initial') {
      setExpansionStep('tieup')
    } else if (expansionStep === 'tieup' || expansionStep === 'edit-expansion') {
      saveFullExpansion()
    }
  }

  const saveFullExpansion = async () => {
    try {
      if (!currentUser?.id) return

      const item = responses.find(r => r.id === expandingId)
      
      // Update original response if changed
      if (editText !== item.response) {
        await PromptHistoryAPI.updatePromptHistory(expandingId, currentUser.id, {
          response_text: editText
        })
      }

      // Create or update expansion
      if (item.expansion) {
        // Update existing expansion
        await PromptHistoryAPI.updateExpansion(item.expansion.expansion_id, currentUser.id, {
          initial_response: expansionData.initialResponse,
          tieup_response: expansionData.tieupResponse
        })
      } else {
        // Create new expansion
        await PromptHistoryAPI.createExpansion(currentUser.id, {
          prompt_history_id: expandingId,
          expansion_type_id: selectedExpansionType.expansion_type_id,
          initial_prompt_id: expansionPrompts.initial_prompt_id,
          initial_response: expansionData.initialResponse,
          tieup_prompt_id: expansionPrompts.tieup_prompt_id,
          tieup_response: expansionData.tieupResponse
        })
      }

      // Refresh the data
      await searchPrompts()
      cancelExpand()
    } catch (err) {
      console.error('Failed to save expansion:', err)
    }
  }

  const saveEditOnly = async () => {
    try {
      if (!currentUser?.id) return
      
      const { error } = await PromptHistoryAPI.updatePromptHistory(expandingId, currentUser.id, {
        response_text: editText
      })

      if (!error) {
        setResponses(prev => prev.map(r => 
          r.id === expandingId ? { ...r, response: editText } : r
        ))
        cancelExpand()
      }
    } catch (err) {
      console.error('Failed to update response:', err)
    }
  }

  const cancelExpand = () => {
    setExpandingId(null)
    setEditText('')
    setExpansionStep('edit')
    setShowExpansionPaths(false)
    setSelectedExpansionType(null)
    setExpansionData({
      initialResponse: '',
      tieupResponse: ''
    })
  }

  const deleteResponse = async (id) => {
    try {
      if (!currentUser?.id) return
      
      const { error } = await PromptHistoryAPI.deletePromptHistory(id, currentUser.id)
      
      if (!error) {
        setResponses(prev => prev.filter(r => r.id !== id))
        setShowDeleteConfirm(null)
      }
    } catch (err) {
      console.error('Failed to delete response:', err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const getFilterLabel = () => {
    switch (currentFilter) {
      case 'starred': return 'Showing starred'
      case 'recent': return 'Sorted by recent'
      case 'prompt-az': return 'Sorted A-Z by prompt'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '2px solid #7C3AED', 
            borderTop: '2px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 16px' 
          }}></div>
          <p style={{ color: '#7C3AED' }}>Loading your wanders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#DC2626', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={loadInitialData}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentUser?.id) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#7C3AED', marginBottom: '16px' }}>Please sign in to view your Lost & Found</p>
          <button 
            onClick={() => navigate('profile')}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
            }}
          >
            Go to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
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
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.1)'
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
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.1)'
          }}
        >
          ℹ︎
        </button>

        {/* Logo replacing text title */}
        <img 
          src="/lostfound-logo.png" 
          alt="Lost & Found" 
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
            console.log('Lost & Found logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 48px; font-weight: 300; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Lost & Found</h1>';
          }}
          onLoad={(e) => {
            console.log('Lost & Found logo loaded successfully from:', e.target.src);
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
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#7C3AED', margin: '0 0 16px 0' }}>
                Lost & Found
              </h2>
            </div>

            <div style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                Every wander leaves something behind. Lost & Found is where your responses live—a playful archive of thoughts, ideas, and odd sparks you can rediscover anytime. Everything you create is saved here automatically, like a pile of postcards from your own mind.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                You can scroll, search, or favorite the ones that stand out, but it's never about organization. Lost & Found is purposefully a little scrambled, so the fun is in stumbling on something unexpected.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                When you want to, you can add more to a past wander. An Expand button opens up three lighthearted paths for you to go deeper, capture more of your thinking, and unlock even more inspiration and ideas:
              </p>
              
              <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Connect It</strong> — link the thought to your own world, memories, or people.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Stretch It</strong> — push the idea further, making it bigger, weirder, more unexpected.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Use It</strong> — turn it into something real with simple next steps.
                </li>
              </ul>
              
              <p style={{ margin: 0, fontWeight: '500', color: '#7C3AED' }}>
                This deeper layer is always optional—a way to catch extra sparks of insight without ever losing the playful spirit. At its core, Lost & Found isn't a journal or a to-do list. It's your whimsical notebook of wandering—waiting to be found again when you need a boost.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search and Filter Bar */}
      <div style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '0' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your wanders..."
              style={{
                width: '100%',
                padding: '16px 48px 16px 20px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                border: '2px solid #DDD6FE',
                borderRadius: '16px',
                fontSize: '16px',
                color: '#374151',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#DDD6FE'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#7C3AED',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#6D28D9'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#7C3AED'
                }}
              >
                ×
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
              border: '2px solid #DDD6FE',
              borderRadius: '16px',
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: '18px',
              color: '#7C3AED',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
              e.target.style.color = 'white'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
              e.target.style.color = '#7C3AED'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            ⚙
          </button>
        </div>

        {/* Enhanced Filter Options */}
        {showFilters && (
          <div style={{
            marginTop: '12px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)',
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'shuffled', label: 'Shuffle (default)' },
                { key: 'starred', label: '⭐ Starred only' },
                { key: 'recent', label: 'Most recent' },
                { key: 'prompt-az', label: 'Prompt A-Z' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => { setCurrentFilter(filter.key); setShowFilters(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: currentFilter === filter.key 
                      ? 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)' 
                      : 'transparent',
                    color: currentFilter === filter.key ? '#7C3AED' : '#374151',
                    fontWeight: currentFilter === filter.key ? '600' : '400',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentFilter !== filter.key) {
                      e.target.style.background = 'rgba(124, 58, 237, 0.05)'
                      e.target.style.color = '#7C3AED'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentFilter !== filter.key) {
                      e.target.style.background = 'transparent'
                      e.target.style.color = '#374151'
                    }
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Active Filter Indicator */}
        {getFilterLabel() && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#7C3AED',
              background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)'
            }}>
              {getFilterLabel()}
              <button
                onClick={() => setCurrentFilter('shuffled')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7C3AED',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0 0 0 4px'
                }}
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Results Count */}
      {(searchTerm || currentFilter !== 'shuffled') && (
        <div style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '14px', color: '#A855F7', textAlign: 'center' }}>
            {responses.length} wander{responses.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {responses.map((item) => (
            <div key={item.id} style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 58, 237, 0.2), 0 4px 12px rgba(124, 58, 237, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)'
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
              
              {/* Card Header */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#374151', fontSize: '16px', fontWeight: '500', lineHeight: '1.4', margin: 0 }}>
                  {item.prompt}
                </p>
              </div>

              {/* Expansion Content */}
              {expandingId === item.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Edit Original Response */}
                  <div>
                    <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '12px', fontWeight: '600' }}>
                      Your response:
                    </p>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                        border: '2px solid #DDD6FE',
                        borderRadius: '16px',
                        resize: 'none',
                        outline: 'none',
                        color: '#6B21A8',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontFamily: 'inherit',
                        minHeight: '80px',
                        boxSizing: 'border-box',
                        boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#7C3AED'
                        e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#DDD6FE'
                        e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)'
                      }}
                      rows="3"
                      autoFocus
                    />
                  </div>

                  {/* Existing Expansion Edit Mode */}
                  {expansionStep === 'edit-expansion' && selectedExpansionType && (
                    <div style={{
                      background: 'linear-gradient(135def, #F3E8FF 0%, #E9D5FF 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                      <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '16px', fontWeight: '600' }}>
                        {selectedExpansionType.display_name}:
                      </p>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          {expansionPrompts.initial_prompt_text}
                        </p>
                        <textarea
                          value={expansionData.initialResponse}
                          onChange={(e) => setExpansionData(prev => ({ ...prev, initialResponse: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                            border: '2px solid #DDD6FE',
                            borderRadius: '12px',
                            resize: 'none',
                            outline: 'none',
                            color: '#374151',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            minHeight: '80px',
                            boxSizing: 'border-box',
                            boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#7C3AED'
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#DDD6FE'
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)'
                          }}
                          rows="3"
                        />
                      </div>

                      <div>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          {expansionPrompts.tieup_prompt_text}
                        </p>
                        <textarea
                          value={expansionData.tieupResponse}
                          onChange={(e) => setExpansionData(prev => ({ ...prev, tieupResponse: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                            border: '2px solid #DDD6FE',
                            borderRadius: '12px',
                            resize: 'none',
                            outline: 'none',
                            color: '#374151',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            minHeight: '60px',
                            boxSizing: 'border-box',
                            boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#7C3AED'
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#DDD6FE'
                            e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)'
                          }}
                          rows="2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Expansion Path Selection */}
                  {expansionStep === 'paths' && showExpansionPaths && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                      <p style={{ fontSize: '16px', color: '#7C3AED', marginBottom: '16px', fontWeight: '600' }}>
                        Want to go deeper? Pick a direction:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {expansionTypes.map(type => (
                          <button
                            key={type.expansion_type_id}
                            onClick={() => selectExpansionPath(type)}
                            style={{
                              padding: '16px',
                              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                              border: '2px solid rgba(124, 58, 237, 0.3)',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.1)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)'
                              e.target.style.transform = 'translateY(-1px)'
                              e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.15)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)'
                              e.target.style.transform = 'translateY(0)'
                              e.target.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.1)'
                            }}
                          >
                            <div style={{ fontWeight: '600', color: '#7C3AED', fontSize: '14px', marginBottom: '4px' }}>
                              {type.display_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                              {type.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Initial Expansion Step */}
                  {expansionStep === 'initial' && selectedExpansionType && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                      <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '12px', fontWeight: '600' }}>
                        {selectedExpansionType.display_name}:
                      </p>
                      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
                        {expansionPrompts.initial_prompt_text}
                      </p>
                      <textarea
                        value={expansionData.initialResponse}
                        onChange={(e) => setExpansionData(prev => ({ ...prev, initialResponse: e.target.value }))}
                        placeholder="Your thoughts..."
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                          border: '2px solid #DDD6FE',
                          borderRadius: '12px',
                          resize: 'none',
                          outline: 'none',
                          color: '#374151',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          minHeight: '80px',
                          boxSizing: 'border-box',
                          boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7C3AED'
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#DDD6FE'
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)'
                        }}
                        rows="3"
                      />
                    </div>
                  )}

                  {/* Tieup Step with Context */}
                  {expansionStep === 'tieup' && selectedExpansionType && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                      {/* Show previous context */}
                      <div style={{ 
                        marginBottom: '16px', 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)', 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)'
                      }}>
                        <p style={{ fontSize: '14px', color: '#7C3AED', fontWeight: '600', marginBottom: '8px' }}>
                          {selectedExpansionType.display_name}:
                        </p>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                          {expansionData.initialResponse}
                        </p>
                      </div>

                      <p style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '12px', fontWeight: '600' }}>
                        One more thing:
                      </p>
                      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
                        {expansionPrompts.tieup_prompt_text}
                      </p>
                      <textarea
                        value={expansionData.tieupResponse}
                        onChange={(e) => setExpansionData(prev => ({ ...prev, tieupResponse: e.target.value }))}
                        placeholder="Your thoughts..."
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                          border: '2px solid #DDD6FE',
                          borderRadius: '12px',
                          resize: 'none',
                          outline: 'none',
                          color: '#374151',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          minHeight: '60px',
                          boxSizing: 'border-box',
                          boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#7C3AED'
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 3px rgba(124, 58, 237, 0.2)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#DDD6FE'
                          e.target.style.boxShadow = 'inset 0 2px 8px rgba(124, 58, 237, 0.05), 0 2px 4px rgba(124, 58, 237, 0.05)'
                        }}
                        rows="2"
                      />
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {expansionStep === 'edit' && (
                      <>
                        <button
                          onClick={saveEditOnly}
                          style={{
                            padding: '14px 24px',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3), 0 2px 4px rgba(109, 40, 217, 0.2)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4), 0 4px 8px rgba(109, 40, 217, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.3), 0 2px 4px rgba(109, 40, 217, 0.2)'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={proceedToExpansionPaths}
                          style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                            color: '#7C3AED',
                            border: '2px solid #7C3AED',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.15), 0 2px 4px rgba(124, 58, 237, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                            e.target.style.color = 'white'
                            e.target.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
                            e.target.style.color = '#7C3AED'
                            e.target.style.transform = 'translateY(0)'
                          }}
                        >
                          Go Deeper
                        </button>
                      </>
                    )}
                    
                    {expansionStep === 'initial' && (
                      <button
                        onClick={saveExpansionStep}
                        disabled={!expansionData.initialResponse.trim()}
                        style={{
                          padding: '14px 24px',
                          background: expansionData.initialResponse.trim() 
                            ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' 
                            : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: expansionData.initialResponse.trim() ? 'pointer' : 'not-allowed',
                          boxShadow: expansionData.initialResponse.trim() 
                            ? '0 8px 24px rgba(124, 58, 237, 0.3)' 
                            : '0 4px 16px rgba(156, 163, 175, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (expansionData.initialResponse.trim()) {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = expansionData.initialResponse.trim() 
                            ? '0 8px 24px rgba(124, 58, 237, 0.3)' 
                            : '0 4px 16px rgba(156, 163, 175, 0.3)'
                        }}
                      >
                        Continue
                      </button>
                    )}
                    
                    {(expansionStep === 'tieup' || expansionStep === 'edit-expansion') && (
                      <button
                        onClick={saveExpansionStep}
                        style={{
                          padding: '14px 24px',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3), 0 2px 4px rgba(109, 40, 217, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.4), 0 4px 8px rgba(109, 40, 217, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.3), 0 2px 4px rgba(109, 40, 217, 0.2)'
                        }}
                      >
                        {expansionStep === 'edit-expansion' ? 'Save' : 'Finish'}
                      </button>
                    )}
                    
                    <button
                      onClick={cancelExpand}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                        color: '#7C3AED',
                        border: '2px solid #7C3AED',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.15), 0 2px 4px rgba(124, 58, 237, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                        e.target.style.color = 'white'
                        e.target.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
                        e.target.style.color = '#7C3AED'
                        e.target.style.transform = 'translateY(0)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Original Response */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: item.expansion ? '16px' : '16px',
                    boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                    border: '1px solid rgba(124, 58, 237, 0.2)'
                  }}>
                    <p style={{ color: '#6B21A8', fontStyle: 'italic', margin: 0 }}>{item.response}</p>
                  </div>
                  
                  {/* Expansion Content (if exists) */}
                  {item.expansion && (
                    <div style={{
                      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '16px',
                      boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.1), 0 2px 4px rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '14px', color: '#7C3AED', fontWeight: '600', marginBottom: '8px' }}>
                          {item.expansion.expansion_type.display_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                          {item.expansion.initial_prompt.prompt_text}
                        </p>
                        <p style={{ color: '#374151', fontSize: '14px', margin: 0 }}>
                          {item.expansion.initial_response}
                        </p>
                      </div>
                      
                      {item.expansion.tieup_response && (
                        <div>
                          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                            {item.expansion.tieup_prompt.prompt_text}
                          </p>
                          <p style={{ color: '#374151', fontSize: '14px', margin: 0 }}>
                            {item.expansion.tieup_response}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleStar(item.id)}
                        style={{
                          padding: '8px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(124, 58, 237, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'none'
                        }}
                      >
                        <span style={{ 
                          color: item.starred ? '#7C3AED' : '#9CA3AF',
                          fontSize: '18px',
                          transition: 'all 0.3s ease'
                        }}>
                          {item.starred ? '★' : '☆'}
                        </span>
                      </button>
                      <button
                        onClick={() => smartExpand(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '14px',
                          color: '#9CA3AF',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#7C3AED'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#9CA3AF'
                        }}
                      >
                        Expand
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '14px',
                          color: '#9CA3AF',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#EF4444'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#9CA3AF'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#A855F7', opacity: 0.8 }}>
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {responses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ color: '#A855F7', opacity: 0.75 }}>
              {searchTerm || currentFilter === 'starred' 
                ? "No wanders match your search" 
                : "Your wandering thoughts will appear here"}
            </p>
          </div>
        )}
      </main>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <p style={{ color: '#374151', marginBottom: '24px', fontSize: '16px' }}>Really delete this wander?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => deleteResponse(showDeleteConfirm)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
                  color: '#7C3AED',
                  border: '2px solid #7C3AED',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  e.target.style.color = 'white'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)'
                  e.target.style.color = '#7C3AED'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bottom Navigation - L&F is highlighted since this is the Lost & Found page */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '30px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 4px 16px rgba(124, 58, 237, 0.1)'
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
            
            {/* L&F - Active state since this is the Lost & Found page */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#7C3AED" stroke="#6B21A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: '600', 
                color: '#7C3AED',
                marginTop: '2px',
                fontFamily: 'SF Pro Text, -apple-system, sans-serif'
              }}>
                L&F
              </span>
            </div>
            
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        textarea {
          font-size: 16px !important;
          transform-origin: left top;
          zoom: 1 !important;
        }
        
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default WanderLostFound