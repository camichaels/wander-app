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
      
    } catch (err) {
      setError('Failed to delete user: ' + err.message)
      setIsSubmitting(false)
    }
  }

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
      }
    } catch (err) {
      console.error('Error during user switch:', err)
      setError('Failed to sign in: ' + err.message)
      setSelectedUserId('')
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

  // CSS styles object matching the design
  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      background: '#f0f0f5',
      minHeight: '100vh',
      padding: '0 20px',
      paddingBottom: '100px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      position: 'relative'
    },
    backButton: {
      position: 'absolute',
      left: '0',
      top: '0',
      background: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '18px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    title: {
      fontFamily: '"Brush Script MT", cursive',
      fontSize: '48px',
      color: '#e74c3c',
      fontWeight: 'normal',
      margin: 0
    },
    main: {
      maxWidth: '600px',
      margin: '0 auto'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '30px',
      position: 'relative'
    },
    cardTitle: {
      fontSize: '24px',
      color: '#2c3e50',
      fontWeight: '600',
      marginBottom: '30px'
    },
    actions: {
      position: 'absolute',
      top: '30px',
      right: '30px',
      display: 'flex',
      gap: '15px'
    },
    actionBtn: {
      background: 'none',
      border: 'none',
      color: '#666',
      textDecoration: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    deleteBtn: {
      color: '#e74c3c'
    },
    fieldGroup: {
      marginBottom: '32px'
    },
    fieldLabel: {
      display: 'block',
      fontSize: '16px',
      color: '#666',
      marginBottom: '8px',
      fontWeight: '500'
    },
    fieldValue: {
      fontSize: '20px',
      color: '#2c3e50',
      fontWeight: '600',
      lineHeight: '1.4',
      margin: 0
    },
    username: {
      color: '#3498db'
    },
    formInput: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      background: 'white',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    formSelect: {
      width: '100%',
      padding: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      background: 'white',
      transition: 'border-color 0.2s ease',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")',
      backgroundPosition: 'right 12px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px',
      paddingRight: '40px'
    },
    btn: {
      width: '100%',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    btnPrimary: {
      background: '#4a5568',
      color: 'white'
    },
    btnSecondary: {
      background: '#f8f9fa',
      border: '2px solid #e9ecef',
      color: '#6c757d'
    },
    signOutBtn: {
      width: '100%',
      background: '#f8f9fa',
      border: '2px solid #e9ecef',
      color: '#6c757d',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
    },
    modalActions: {
      display: 'flex',
      gap: '15px',
      marginTop: '30px'
    },
    error: {
      backgroundColor: '#fee',
      border: '1px solid #fca5a5',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      color: '#dc2626'
    },
    loading: {
      minHeight: '100vh',
      background: '#f0f0f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    spinner: {
      width: '32px',
      height: '32px',
      border: '2px solid #6b7280',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>

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

  <img 
    src="/profile-logo.png"  // Just change this from "/solo-logo.png"
    alt="Profile & Settings" 
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
      console.log('Profile logo failed to load from:', e.target.src);
      e.target.outerHTML = '<h1 style="font-size: 48px; font-weight: 300; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Your Profile</h1>';
    }}
    onLoad={(e) => {
      console.log('Profile logo loaded successfully from:', e.target.src);
    }}
  />
</header>

      <div style={styles.main}>
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
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
          <>
            {/* Profile Card */}
            <div style={styles.card}>
              <div style={styles.actions}>
                {!isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      style={styles.actionBtn}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{...styles.actionBtn, ...styles.deleteBtn}}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isSubmitting}
                      style={{...styles.actionBtn, background: '#4a5568', color: 'white', padding: '8px 16px'}}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={styles.actionBtn}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Username</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      style={{...styles.formInput, borderColor: validationErrors.username ? '#dc2626' : '#e2e8f0'}}
                    />
                    {validationErrors.username && (
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                        {validationErrors.username}
                      </p>
                    )}
                  </>
                ) : (
                  <div style={{...styles.fieldValue, ...styles.username}}>@{userProfile?.username}</div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Display Name</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      style={{...styles.formInput, borderColor: validationErrors.displayName ? '#dc2626' : '#e2e8f0'}}
                    />
                    {validationErrors.displayName && (
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                        {validationErrors.displayName}
                      </p>
                    )}
                  </>
                ) : (
                  <div style={styles.fieldValue}>{userProfile?.display_name}</div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Email</label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{...styles.formInput, borderColor: validationErrors.email ? '#dc2626' : '#e2e8f0'}}
                    />
                    {validationErrors.email && (
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                        {validationErrors.email}
                      </p>
                    )}
                  </>
                ) : (
                  <div style={styles.fieldValue}>{userProfile?.email}</div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Phone (optional)</label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Add phone number"
                      style={{...styles.formInput, borderColor: validationErrors.phone ? '#dc2626' : '#e2e8f0'}}
                    />
                    {validationErrors.phone && (
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                        {validationErrors.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <div style={styles.fieldValue}>
                    {userProfile?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Member Since</label>
                <div style={styles.fieldValue}>
                  {new Date(userProfile?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            {!isEditing && (
              <button
                onClick={handleLogout}
                style={styles.signOutBtn}
              >
                Sign Out
              </button>
            )}
          </>
        ) : (
          /* NOT LOGGED IN STATE */
          <>
            {/* Sign In Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Sign in as Existing User</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="">Select a user...</option>
                  {allUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.display_name} (@{user.username})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleSelectUser}
                disabled={!selectedUserId}
                style={{
                  ...styles.btn,
                  ...styles.btnPrimary,
                  opacity: selectedUserId ? 1 : 0.5,
                  cursor: selectedUserId ? 'pointer' : 'not-allowed'
                }}
              >
                Sign In
              </button>
            </div>

            {/* Create Account Card */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Create New Account</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                Get Started
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ fontSize: '24px', color: '#2c3e50', fontWeight: '600', marginBottom: '30px' }}>
              Create New Account
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', color: '#4a5568', marginBottom: '8px', fontWeight: '500' }}>
                  Username <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a unique username"
                  style={{...styles.formInput, borderColor: validationErrors.username ? '#dc2626' : '#e2e8f0'}}
                />
                {validationErrors.username && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', color: '#4a5568', marginBottom: '8px', fontWeight: '500' }}>
                  Display Name <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your full name"
                  style={{...styles.formInput, borderColor: validationErrors.displayName ? '#dc2626' : '#e2e8f0'}}
                />
                {validationErrors.displayName && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', color: '#4a5568', marginBottom: '8px', fontWeight: '500' }}>
                  Email <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  style={{...styles.formInput, borderColor: validationErrors.email ? '#dc2626' : '#e2e8f0'}}
                />
                {validationErrors.email && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', color: '#4a5568', marginBottom: '8px', fontWeight: '500' }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  style={{...styles.formInput, borderColor: validationErrors.phone ? '#dc2626' : '#e2e8f0'}}
                />
                {validationErrors.phone && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button
                onClick={handleCreateUser}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  ...styles.btn,
                  ...styles.btnPrimary,
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  resetForm()
                  setValidationErrors({})
                }}
                style={{
                  flex: 1,
                  ...styles.btn,
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #e2e8f0'
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
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ fontSize: '24px', color: '#2c3e50', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
              Delete Your Account?
            </h3>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', textAlign: 'center' }}>
              This will permanently delete your account and all associated data. This cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  ...styles.btn,
                  background: '#dc2626',
                  color: 'white',
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Forever'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  ...styles.btn,
                  ...styles.btnSecondary
                }}
              >
                Keep Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - keeping your existing bottom nav */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
        {/* Your existing navigation JSX here */}
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