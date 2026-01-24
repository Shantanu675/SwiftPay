import React, { useState, useEffect } from 'react';
import '../stylesheets/myprofile.scss';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    fetchUserData();
    fetchWalletBalance();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get user ID from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);
      setEditForm(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`${API_URL}/api/v1/wallets/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const walletData = await response.json();
        setWalletBalance(walletData.balance || 0);
      }
    } catch (err) {
      console.warn('Wallet service not available:', err);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSaveChanges();
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT', // You might need to add this endpoint to your backend
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Profile</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchUserData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
        <button className="btn btn-primary" onClick={handleEditToggle} disabled={true}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
        </button>
        ) : (
        <div className="edit-actions">
            <button className="btn btn-secondary" onClick={handleCancelEdit}>
            Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveChanges}>
            Save Changes
            </button>
        </div>
        )}
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              <div className="avatar-placeholder">
                {getInitials(user?.name)}
              </div>
              <div className="status-indicator verified"></div>
            </div>
            <div className="user-info">
              <h3>{user?.name || 'User'}</h3>
              <p>{user?.email || 'No email provided'}</p>
              <span className="user-badge verified">Verified</span>
            </div>
          </div>

          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Info
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </button>
            <button 
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preferences
            </button>
          </nav>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h4>Account Overview</h4>
            <div className="stat-item">
              <div className="stat-icon wallet">💰</div>
              <div className="stat-info">
                <div className="stat-value">₹{walletBalance.toFixed(2)}</div>
                <div className="stat-label">Wallet Balance</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon member">👤</div>
              <div className="stat-info">
                <div className="stat-value">{user?.role?.replace('ROLE_', '') || 'User'}</div>
                <div className="stat-label">Account Type</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon date">📅</div>
              <div className="stat-info">
                <div className="stat-value">{formatJoinDate(user?.createdAt)}</div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Personal Information</h2>
                <p>Manage your personal details and contact information</p>
              </div>

              <div className="profile-form">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="form-input"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="form-value">{user?.name || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="form-input"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <div className="form-value">{user?.email || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>User ID</label>
                      <div className="form-value id-value">{user?.id}</div>
                    </div>
                    <div className="form-group">
                      <label>Account Role</label>
                      <div className="form-value role-value">
                        {user?.role?.replace('ROLE_', '') || 'User'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Account Status</h3>
                  <div className="status-card">
                    <div className="status-icon verified">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="status-content">
                      <h4>Verified Account</h4>
                      <p>Your account is active and in good standing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Security Settings</h2>
                <p>Manage your account security and privacy</p>
              </div>

              <div className="security-settings">
                <div className="security-card">
                  <div className="security-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="security-content">
                    <h4>Password</h4>
                    <p>Last changed: Recently</p>
                  </div>
                  <button className="btn btn-outline">Change Password</button>
                </div>

                <div className="security-card">
                  <div className="security-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="security-content">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="btn btn-outline">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Preferences</h2>
                <p>Customize your SwiftPay experience</p>
              </div>

              <div className="preferences-settings">
                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates about your account activity</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>SMS Notifications</h4>
                    <p>Get transaction alerts via SMS</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h4>Marketing Emails</h4>
                    <p>Receive offers and promotions from PayFlow</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-toast">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;