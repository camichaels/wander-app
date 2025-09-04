import React, { useState, useEffect } from 'react'
import { PromptHistoryAPI } from '../services/promptHistoryAPI'

const WanderLostFound = ({ navigate, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentFilter, setCurrentFilter] = useState('shuffled')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        tags: item.tags || []
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

  const startEdit = (id, currentResponse) => {
    setEditingId(id)
    setEditText(currentResponse)
  }

  const saveEdit = async () => {
    try {
      if (!currentUser?.id) return
      
      const { error } = await PromptHistoryAPI.updatePromptHistory(editingId, currentUser.id, {
        response_text: editText
      })

      if (!error) {
        setResponses(prev => prev.map(r => 
          r.id === editingId ? { ...r, response: editText } : r
        ))
        setEditingId(null)
        setEditText('')
      }
    } catch (err) {
      console.error('Failed to update response:', err)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
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
        background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff, #ddd6fe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid #7c3aed', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#7c3aed' }}>Loading your wanders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff, #ddd6fe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={loadInitialData}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer'
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
        background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff, #ddd6fe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#7c3aed', marginBottom: '16px' }}>Please sign in to view your Lost & Found</p>
          <button 
            onClick={() => navigate('profile')}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer'
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
      background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff, #ddd6fe)',
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
          color: '#6b21a8',
          marginBottom: '8px'
        }}>
          Lost & Found
        </h1>
        <p style={{ color: '#7c3aed', opacity: 0.75, fontSize: '14px' }}>
          Your wandering thoughts, rediscovered
        </p>
      </header>

      {/* Search and Filter Bar - Updated with larger icons */}
      <div style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '0' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your wanders..."
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              flexShrink: 0,
              fontSize: '18px'
            }}
          >
            ⚙
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => { setCurrentFilter('shuffled'); setShowFilters(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentFilter === 'shuffled' ? '#e9d5ff' : 'transparent',
                  color: '#7c3aed'
                }}
              >
                Shuffle (default)
              </button>
              <button
                onClick={() => { setCurrentFilter('starred'); setShowFilters(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentFilter === 'starred' ? '#e9d5ff' : 'transparent',
                  color: '#7c3aed'
                }}
              >
                ⭐ Starred only
              </button>
              <button
                onClick={() => { setCurrentFilter('recent'); setShowFilters(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentFilter === 'recent' ? '#e9d5ff' : 'transparent',
                  color: '#7c3aed'
                }}
              >
                Most recent
              </button>
              <button
                onClick={() => { setCurrentFilter('prompt-az'); setShowFilters(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentFilter === 'prompt-az' ? '#e9d5ff' : 'transparent',
                  color: '#7c3aed'
                }}
              >
                Prompt A-Z
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Indicator */}
        {getFilterLabel() && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#7c3aed',
              backgroundColor: '#e9d5ff',
              padding: '4px 12px',
              borderRadius: '50px'
            }}>
              {getFilterLabel()}
              <button
                onClick={() => setCurrentFilter('shuffled')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Results Count */}
      {(searchTerm || currentFilter !== 'shuffled') && (
        <div style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#7c3aed', opacity: 0.75, textAlign: 'center' }}>
            {responses.length} wander{responses.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        {/* Response Cards - Updated edit textarea styling */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {responses.map((item) => (
            <div key={item.id} style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              
              {/* Card Header - Reduced spacing */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '300', lineHeight: '1.4', margin: 0 }}>
                  {item.prompt}
                </p>
              </div>

              {/* Response Content */}
              {editingId === item.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f3e8ff',
                      border: '1px solid #c4b5fd',
                      borderRadius: '16px',
                      resize: 'none',
                      outline: 'none',
                      color: '#4b5563',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontFamily: 'inherit',
                      minHeight: '80px',
                      boxSizing: 'border-box'
                    }}
                    rows="3"
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={saveEdit}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        color: '#7c3aed',
                        border: '1px solid #c4b5fd',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    backgroundColor: '#f3e8ff',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}>
                    <p style={{ color: '#4b5563', fontStyle: 'italic', margin: 0 }}>{item.response}</p>
                  </div>
                  
                  {/* Action Buttons - Star moved to lower left, Edit same color as Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleStar(item.id)}
                        style={{
                          padding: '4px',
                          background: 'none',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ 
                          color: item.starred ? '#7c3aed' : '#d1d5db',
                          fontSize: '16px'
                        }}>
                          {item.starred ? '★' : '☆'}
                        </span>
                      </button>
                      <button
                        onClick={() => startEdit(item.id, item.response)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#9ca3af',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#9ca3af',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#7c3aed', opacity: 0.6 }}>
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
            <p style={{ color: '#7c3aed', opacity: 0.75 }}>
              {searchTerm || currentFilter === 'starred' 
                ? "No wanders match your search" 
                : "Your wandering thoughts will appear here"}
            </p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 20
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#4b5563', marginBottom: '16px' }}>Really delete this wander?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => deleteResponse(showDeleteConfirm)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '50px',
          padding: '12px 24px',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: '#7c3aed' }}>
            <button 
              onClick={() => navigate('home')}
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('daily')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Daily
            </button>
            <button 
              onClick={() => navigate('solo')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Solos
            </button>
            <button 
              onClick={() => navigate('mates')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mates
            </button>
            <button 
              onClick={() => navigate('groups')}
              style={{ fontSize: '12px', opacity: 0.5, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Groups
            </button>
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