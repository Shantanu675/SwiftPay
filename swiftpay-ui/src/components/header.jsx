import React, { useState, useEffect } from 'react';
import '../stylesheets/header.scss';


const Header = ({ 
  title = "SwiftPay", 
  subtitle, 
  showUser = true, 
  showNotifications = true,
  actions = [],
  onMenuToggle,
  showBackButton = false,
  showQuickActions = false
}) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActionsPanel, setShowQuickActionsPanel] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`${API_URL}/api/notify/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const notificationsData = await response.json();
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.warn('Notifications service not available:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setShowNotificationsPanel(false);
  };

  // Quick Actions Data
  const quickActions = [
    {
      icon: '🏠',
      label: 'Dashboard',
      path: '/home',
      description: 'Go to main dashboard'
    },
    {
      icon: '💸',
      label: 'Send Money',
      path: '/send-money',
      description: 'Transfer to friends & family'
    },
    {
      icon: '💰',
      label: 'Add Funds',
      path: '/add-funds',
      description: 'Top up your wallet'
    },
    {
      icon: '📊',
      label: 'Transactions',
      path: '/transactions',
      description: 'View transaction history'
    },
    {
      icon: '🎁',
      label: 'Rewards',
      path: '/rewards',
      description: 'Claim your rewards'
    },
    {
      icon: '👤',
      label: 'Profile',
      path: '/profile',
      description: 'Manage your account'
    }
  ];

  const handleQuickAction = (path) => {
    setShowQuickActionsPanel(false);
    window.location.href = path;
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    window.location.href = '/home';
  };

  return (
    <header className="app-header">
      {/* Left Section - Navigation & Title */}
      <div className="header-left">
        <div className="navigation-controls">
          {showBackButton && (
            <button className="nav-btn back-btn" onClick={handleBack} title="Go Back">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <button className="nav-btn home-btn" onClick={handleHome} title="Go to Dashboard">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          {onMenuToggle && (
            <button className="nav-btn menu-toggle" onClick={onMenuToggle} title="Toggle Menu">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="header-title">
          <h1>{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Center Section - Actions */}
      {actions.length > 0 && (
        <div className="header-center">
          <div className="header-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`btn ${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.icon && <span className="btn-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right Section - Quick Actions, Notifications & User */}
      <div className="header-right">
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="quick-actions-wrapper">
            <button 
              className="quick-actions-trigger"
              onClick={() => setShowQuickActionsPanel(!showQuickActionsPanel)}
              title="Quick Actions"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="quick-actions-label">Shortcuts</span>
            </button>

            {showQuickActionsPanel && (
              <div className="quick-actions-panel">
                <div className="quick-actions-header">
                  <h3>Quick Actions</h3>
                  <p>Navigate quickly around the app</p>
                </div>
                
                <div className="quick-actions-grid">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="quick-action-item"
                      onClick={() => handleQuickAction(action.path)}
                    >
                      <div className="quick-action-icon">{action.icon}</div>
                      <div className="quick-action-content">
                        <div className="quick-action-label">{action.label}</div>
                        <div className="quick-action-description">{action.description}</div>
                      </div>
                      <svg className="quick-action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <div className="notification-wrapper">
            <button 
              className="notification-bell"
              onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {notifications.length > 0 && (
                <span className="notification-count">{notifications.length}</span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotificationsPanel && (
              <div className="notifications-panel">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="clear-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-icon">🔔</div>
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 5 && (
                  <div className="notifications-footer">
                    <button className="view-all-btn">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        {showUser && user && (
          <div className="user-profile-wrapper">
            <button 
              className="user-profile-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name || 'User'}</div>
                <div className="user-email">{user.email || 'user@example.com'}</div>
              </div>
              <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <div className="user-avatar large">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name || 'User'}</div>
                    <div className="user-email">{user.email || 'user@example.com'}</div>
                  </div>
                </div>
                
                <div className="user-menu-items">
                  <a href="/profile" className="menu-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </a>
                  
                  <a href="/settings" className="menu-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  
                  <a href="/help" className="menu-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </a>
                </div>
                
                <div className="user-menu-footer">
                  <button className="logout-btn" onClick={handleLogout}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay for closing dropdowns */}
      {(showNotificationsPanel || showUserMenu || showQuickActionsPanel) && (
        <div 
          className="header-overlay"
          onClick={() => {
            setShowNotificationsPanel(false);
            setShowUserMenu(false);
            setShowQuickActionsPanel(false);
          }}
        />
      )}
    </header>
  );
};

export default Header; 