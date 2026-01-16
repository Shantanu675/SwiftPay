import React, { useState, useEffect } from 'react';
import '../stylesheets/dashboard.scss';
import { useNavigate } from "react-router-dom";
import logo from "../assets/swiftPay_logo.jpeg"

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  // ADDED: Separate state for unread notifications
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    
    // Poll for new notifications every 10 seconds
    const pollInterval = setInterval(() => {
      checkNewNotifications();
    }, 10000); // 10 seconds
    
    return () => clearInterval(pollInterval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate("/");
        throw new Error('No authentication token found. Please login.');
      }

      // Decode JWT to get userId
      let userId;
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userId = tokenPayload.userId || tokenPayload.sub;
      } catch (e) {
        throw new Error('Invalid token format');
      }

      // Fetch user data
      const userRes = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userRes.ok) {
        throw new Error(`Failed to fetch user: ${userRes.status}`);
      }
      const userData = await userRes.json();
      setUser(userData);

      // Fetch wallet balance
      const walletRes = await fetch(`http://localhost:8080/api/v1/wallets/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let walletBalance = 0;
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        walletBalance = walletData.balance;
      }

      // Fetch recent transactions
      const transactionsRes = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let userTransactions = [];
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        userTransactions = transactionsData
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);
      }

      // Fetch notifications from correct port (8084)
      let userNotifications = [];
      try {
        const notificationsRes = await fetch(`http://localhost:8080/api/notify/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (notificationsRes.ok) {
          userNotifications = await notificationsRes.json();
          setLastNotificationCount(userNotifications.length);
        }
      } catch (notifyError) {
        console.warn('Notifications service not available:', notifyError);
      }

      

      // Fetch rewards from correct port (8083)
      let rewardsCount = 0;
      try {
        const rewardsRes = await fetch(`http://localhost:8080/api/rewards/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json();
          rewardsCount = rewardsData.length;
        }
      } catch (rewardsError) {
        console.warn('Rewards service not available:', rewardsError);
      }

      // Set all data
      setStats({
        balance: walletBalance,
        transactions: userTransactions.length,
        rewards: rewardsCount,
        users: 1 // For individual user dashboard
      });

      setTransactions(userTransactions);
      setNotifications(userNotifications);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkNewNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`http://localhost:8080/api/notify/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newNotifications = await response.json();
        
        // Check if there are new notifications
        if (newNotifications.length > lastNotificationCount) {
          const newNotificationCount = newNotifications.length - lastNotificationCount;
          const latestNotification = newNotifications[0]; // Get the newest one
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('SwiftPay - New Notification', {
              body: latestNotification.message,
              icon: '/logo.png',
              badge: '/logo.png'
            });
          }
          
          // Show toast notification in app
          showToastNotification(latestNotification, newNotificationCount);
          
          // Update notifications state and last count
          setNotifications(newNotifications);
          setLastNotificationCount(newNotifications.length);
          
          // Add pulse animation to bell
          const bell = document.querySelector('.notification-bell');
          if (bell) {
            bell.classList.add('pulse');
            setTimeout(() => {
              bell.classList.remove('pulse');
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };
  
  

  const showToastNotification = (notification, count) => {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">🔔</div>
        <div class="toast-message">
          <strong>${count} new notification${count > 1 ? 's' : ''}</strong>
          <div>${notification.message}</div>
        </div>
        <button class="toast-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSendMoney = () => {
    window.location.href = '/send-money';
  };

  
  const handleAddFunds = () => {
    window.location.href = '/add-funds';
  };

  const handleViewTransactions = () => {
    window.location.href = '/transactions';
  };

  const handleViewRewards = () => {
    window.location.href = '/rewards';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSentTransaction = (transaction) => {
    if (!user) return false;
    return transaction.senderId === user.id;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
            </div>
          )}
        </div>
        <div className="header-right">
          <div className="notification-bell">
            <b className="fas fa-bell">🔔</b>
            {notifications.length > 0 && (
              <div className="notification-count">
                {notifications.length}
              </div>
            )}
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>
            <img 
              src={logo} 
              alt="SwiftPay Logo" 
              className="brand-logo" 
            />
            SwiftPay
          </h2>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="nav-label">Overview</span>
          </a>
          <a href="/transactions" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10a2 2 0 11-4 0 2 2 0 014 0zM6 18a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="nav-label">Transactions</span>
          </a>
          <a href="/send-money" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="nav-label">Send Money</span>
          </a>
          <a href="/add-funds" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="nav-label">Add Funds</span>
          </a>
          <a href="/rewards" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="nav-label">Rewards</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={handleSendMoney}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div className="action-label">Send Money</div>
          </div>
          <div className="action-card" onClick={handleAddFunds}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="action-label">Add Funds</div>
          </div>
          <div className="action-card" onClick={handleViewTransactions}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="action-label">Transactions</div>
          </div>
          <div className="action-card" onClick={handleViewRewards}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="action-label">Rewards</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon wallet">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              </div>
              <div className="stat-trend positive">&nbsp;&nbsp;Live</div>
            </div>
            <div className="stat-value">₹{stats.balance?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Wallet Balance</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon transaction">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="stat-trend positive">&nbsp;&nbsp;Live</div>
            </div>
            <div className="stat-value">{stats.transactions || 0}</div>
            <div className="stat-label">Total Transactions</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon reward">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="stat-trend positive">&nbsp;&nbsp;Live</div>
            </div>
            <div className="stat-value">{stats.rewards || 0}</div>
            <div className="stat-label">Available Rewards</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon user">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="stat-trend positive">&nbsp;&nbsp;Live</div>
            </div>
            <div className="stat-value">{stats.users || 1}</div>
            <div className="stat-label">Active Account</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <div className="section-actions">
              <button className="btn btn-secondary" onClick={handleViewTransactions}>
                View All
              </button>
            </div>
          </div>
          {transactions.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {isSentTransaction(transaction) ? 'Sent' : 'Received'}
                    </td>
                    <td>₹{transaction.amount}</td>
                    <td>
                      <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{formatDate(transaction.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <p>No transactions yet. Start by sending money or adding funds!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;