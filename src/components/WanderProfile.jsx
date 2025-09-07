import React, { useState, useEffect } from 'react'
import { UserAPI } from '../services/userAPI'
import { getCurrentUser } from '../services/supabase'

const WanderProfile = ({ navigate, currentUser, setCurrentUser }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // User data states
  const [userProfile, setUserProfile] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  
  // Form states
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  
  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    phone: ''
  })
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({})

  // Updated useEffect to properly handle currentUser changes
  useEffect(() => {
    loadInitialData()
  }, [currentUser?.id]) // Only trigger when the actual user ID changes

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all users for dropdown
      const usersResult = await UserAPI.getAllUsers()
      if (usersResult.error) throw usersResult.error
      setAllUsers(usersResult.data || [])

      // Check if we have a current user
      if (currentUser?.id) {
        setIsLoggedIn(true)
        
        // Load current user profile
        const profileResult = await UserAPI.getCurrentUserProfile(currentUser.id)
        if (profileResult.error) throw profileResult.error
        
        setUserProfile(profileResult.data)
        setFormData({
          username: profileResult.data?.username || '',
          displayName: profileResult.data?.display_name || '',
          email: profileResult.data?.email || '',
          phone: profileResult.data?.phone || ''
        })
      } else {
        setIsLoggedIn(false)
        setUserProfile(null)
        // Clear form data when no user
        setFormData({
          username: '',
          displayName: '',
          email: '',
          phone: ''
        })
      }
    } catch (err) {
      setError(err.message)
      console.error('Error loading profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = async (isUpdate = false) => {
    const errors = {}
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    } else {
      // Check if username is available
      const usernameCheck = await UserAPI.checkUsernameAvailable(
        formData.username, 
        isUpdate ? currentUser?.id : null
      )
      if (!usernameCheck.available) {
        errors.username = 'Username is already taken'
      }
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    } else {
      // Check if email is available
      const emailCheck = await UserAPI.checkEmailAvailable(
        formData.email,
        isUpdate ? currentUser?.id : null
      )
      if (!emailCheck.available) {
        errors.email = 'Email is already registered'
      }
    }

    // Phone validation (optional)
    if (formData.phone && !/^[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleCreateUser = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const isValid = await validateForm(false)
      if (!isValid) return

      const result = await UserAPI.createUser(formData)
      if (result.error) throw result.error

      // Set as current user
      setCurrentUser({ id: result.data.user_id, email: result.data.email })
      setShowCreateForm(false)
      resetForm()
      await loadInitialData()
      
    } catch (err) {
      setError('Failed to create user: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const isValid = await validateForm(true)
      if (!isValid) return

      const result = await UserAPI.updateUser(currentUser.id, formData)
      if (result.error) throw result.error

      setUserProfile(result.data)
      setIsEditing(false)
      
    } catch (err) {
      setError('Failed to update profile: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const result = await UserAPI.deleteUser(currentUser.id)
      if (result.error) throw result.error

      // Immediately log out and clear all user state
      setCurrentUser(null)
      setUserProfile(null)
      setIsLoggedIn(false)
      setIsEditing(false)
      setSelectedUserId('')
      setShowDeleteConfirm(false)
      resetForm()
      
      // Don't call loadInitialData() - user is deleted and logged out
      
    } catch (err) {
      setError('Failed to delete user: ' + err.message)
      setIsSubmitting(false)
    }
  }

  // FIXED: handleSelectUser function with proper state clearing
  const handleSelectUser = async () => {
    if (!selectedUserId) return
    
    try {
      // First, clear all user-related state to prevent showing stale data
      setUserProfile(null)
      setFormData({
        username: '',
        displayName: '',
        email: '',
        phone: ''
      })
      setError(null)
      setIsEditing(false)
      setValidationErrors({})
      
      // Set loading state
      setLoading(true)
      
      const selectedUser = allUsers.find(u => u.user_id === selectedUserId)
      if (selectedUser) {
        // Update current user
        setCurrentUser({ id: selectedUser.user_id, email: selectedUser.email })
        
        // Clear the dropdown
        setSelectedUserId('')
        
        // loadInitialData will be called automatically by useEffect when currentUser.id changes
      }
    } catch (err) {
      console.error('Error during user switch:', err)
      setError('Failed to sign in: ' + err.message)
      setSelectedUserId('') // Clear on error too
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUserProfile(null)
    setIsLoggedIn(false)
    setIsEditing(false)
    setSelectedUserId('')
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      username: '',
      displayName: '',
      email: '',
      phone: ''
    })
    setValidationErrors({})
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setFormData({
      username: userProfile?.username || '',
      displayName: userProfile?.display_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || ''
    })
    setValidationErrors({})
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb, #d1d5db)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid #6b7280', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb, #d1d5db)',
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
          src="/profile-logo.png" 
          alt="Profile & Settings" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
          }}
          onError={(e) => {
            console.log('Profile logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 28px; font-weight: 600; color: #374151; margin: 0; font-family: SF Pro Display, -apple-system, sans-serif;">' + (isLoggedIn ? 'Profile & Settings' : 'Welcome to Wander') + '</h1>';
          }}
          onLoad={(e) => {
            console.log('Profile logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px' }}>
        
        {error && (
          <div style={{
            backgroundColor: '#fecaca',
            border: '1px solid #f87171',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
            <button 
              onClick={() => setError(null)}
              style={{
                marginTop: '8px',
                color: '#dc2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoggedIn ? (
          /* LOGGED IN STATE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Profile Card - Inline Editing */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', margin: 0 }}>
                  Your Profile
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                          fontSize: '12px',
                          color: '#dc2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 0.6
                        }}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#374151',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          fontSize: '14px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.5 : 1
                        }}
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          color: '#6b7280',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Username */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Username
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: validationErrors.username ? '1px solid #dc2626' : '1px solid #d1d5db',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {validationErrors.username && (
                        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                          {validationErrors.username}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>@{userProfile?.username}</p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Display Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: validationErrors.displayName ? '1px solid #dc2626' : '1px solid #d1d5db',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {validationErrors.displayName && (
                        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                          {validationErrors.displayName}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#374151', fontWeight: '500', margin: 0, fontSize: '16px' }}>
                      {userProfile?.display_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Email
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: validationErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {validationErrors.email && (
                        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                          {validationErrors.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>{userProfile?.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Phone (optional)
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Add phone number"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: validationErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {validationErrors.phone && (
                        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                          {validationErrors.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>
                      {userProfile?.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Member Since */}
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Member Since
                  </label>
                  <p style={{ color: '#374151', margin: 0, fontSize: '16px' }}>
                    {new Date(userProfile?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            {!isEditing && (
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        ) : (
          /* NOT LOGGED IN STATE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Select Existing User */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
                Sign in as Existing User
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    border: '1px solid #d1d5db',
                    borderRadius: '16px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select a user...</option>
                  {allUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.display_name} (@{user.username})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleSelectUser}
                  disabled={!selectedUserId}
                  style={{
                    width: '100%',
                    backgroundColor: selectedUserId ? '#374151' : '#6b7280',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: selectedUserId ? 'pointer' : 'not-allowed',
                    opacity: selectedUserId ? 1 : 0.5
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Create New User */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
                Create New Account
              </h2>
              
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#374151',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create User Modal */}
      {showCreateForm && (
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
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.3)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
              Create New Account
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a unique username"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: validationErrors.username ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.username && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: validationErrors.displayName ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.displayName && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: validationErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.email && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: validationErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {validationErrors.phone && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleCreateUser}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  'Create Account'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  resetForm()
                  setValidationErrors({})
                }}
                style={{
                  padding: '12px 16px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p style={{ color: '#374151', marginBottom: '8px', fontWeight: '500' }}>
              Delete Your Account?
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              This will permanently delete your account and all associated data including mates, responses, and chat history. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  'Delete Forever'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Keep Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - No active state since Profile isn't in main nav */}
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default WanderProfile