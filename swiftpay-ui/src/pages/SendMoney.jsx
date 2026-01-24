import React, { useState, useEffect } from 'react';
import '../stylesheets/sendMoney.scss';

const SendMoney = () => {
  const [formData, setFormData] = useState({
    receiverId: '',
    amount: ''
  });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorDescription, setErrorDescription] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    fetchUsers();
    fetchRecentTransactions();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;
      
      const response = await fetch(`${API_URL}/api/transactions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const transactionsData = await response.json();
        const sortedTransactions = transactionsData
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);
        setTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUserRewards = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/rewards/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const rewardsData = await response.json();
        return rewardsData;
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
    return [];
  };

  const addNewTransaction = (newTransaction) => {
    setTransactions(prevTransactions => {
      const updatedTransactions = [newTransaction, ...prevTransactions].slice(0, 3);
      return updatedTransactions;
    });
  };

  const showError = (title, description) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setShowErrorPopup(true);
  };

  const showReward = (rewards) => {
    if (rewards && rewards.length > 0) {
      // Get the latest reward
      const latestReward = rewards[rewards.length - 1];
      setRewardData(latestReward);
      setShowRewardPopup(true);
    }
  };

  const closePopup = () => {
    setShowErrorPopup(false);
    setShowRewardPopup(false);
    setErrorTitle('');
    setErrorDescription('');
    setRewardData(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const extractCleanErrorMessage = (technicalMessage) => {
    if (!technicalMessage) return 'Transaction failed';
    
    if (technicalMessage.includes('Not enough balance') || 
        technicalMessage.includes('InsufficientFundsException')) {
      return 'Insufficient funds in your wallet';
    }
    
    try {
      const jsonMatch = technicalMessage.match(/"message":"([^"]+)"/);
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1];
      }
    } catch (e) {
      // If parsing fails, continue to generic message
    }
    
    return 'Transaction failed - please try again';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const senderId = tokenPayload.userId;

      const payload = {
        senderId: parseInt(senderId),
        receiverId: parseInt(formData.receiverId),
        amount: parseFloat(formData.amount)
      };

      const response = await fetch(`${API_URL}/api/transactions/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'SUCCESS') {
          setMessage('✅ Money sent successfully!');
          setFormData({ receiverId: '', amount: '' });
          
          // Add the new transaction immediately to the list
          addNewTransaction(data);
          
          // Fetch and show rewards after successful transaction
          setTimeout(async () => {
            const rewards = await fetchUserRewards(senderId);
            showReward(rewards);
          }, 1000); // 1 second delay to show success first
          
        } else {
          const cleanError = extractCleanErrorMessage(data.message);
          showError('Transaction Failed', cleanError);
          addNewTransaction(data);
        }
      } else {
        showError('Transaction Error', data.message || 'Failed to send money');
      }
    } catch (error) {
      showError('Network Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const isSentTransaction = (transaction) => {
    const tokenPayload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
    const currentUserId = tokenPayload.userId;
    return transaction.senderId === parseInt(currentUserId);
  };

  return (
    <div className="send-money-container">
      {/* Reward Popup Modal */}
      {showRewardPopup && rewardData && (
        <div className="reward-popup-overlay">
          <div className="reward-popup">
            <div className="popup-header">
              <div className="reward-icon">🎉</div>
              <h3>Reward Earned!</h3>
            </div>
            <div className="popup-body">
              <div className="reward-amount">
                +{rewardData.points} Points
              </div>
              <p>You earned reward points for your transaction!</p>
              <div className="reward-details">
                <div className="reward-info">
                  <span>Transaction Reward</span>
                  <span>{new Date(rewardData.sentAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="popup-ok-btn" onClick={closePopup}>
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <div className="error-popup-overlay">
          <div className="error-popup">
            <div className="popup-header">
              <div className="error-icon">⚠️</div>
              <h3>{errorTitle}</h3>
            </div>
            <div className="popup-body">
              <p>{errorDescription}</p>
            </div>
            <div className="popup-footer">
              <button className="popup-ok-btn" onClick={closePopup}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="send-money-card">
        <div className="send-money-header">
          <h2>Send Money</h2>
          <p>Transfer funds to other users securely</p>
        </div>

        <form onSubmit={handleSubmit} className="send-money-form">
          <div className="form-group">
            <label htmlFor="receiverId">Send To</label>
            <select
              id="receiverId"
              name="receiverId"
              value={formData.receiverId}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-input"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Sending...
              </>
            ) : (
              'Send Money'
            )}
          </button>

          {message && (
            <div className="message success">
              {message}
            </div>
          )}
        </form>

        <div className="transaction-info">
          <h3>Recent Transactions</h3>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-details">
                    <div className="transaction-type">
                      {isSentTransaction(transaction) ? 'Sent to' : 'Received from'} 
                      <span className="user-name">
                        {isSentTransaction(transaction) 
                          ? getUserName(transaction.receiverId)
                          : getUserName(transaction.senderId)
                        }
                      </span>
                    </div>
                    <div className="transaction-date">
                      {formatDate(transaction.timestamp)}
                    </div>
                  </div>
                  <div className="transaction-amount">
                    <span className={`amount ${isSentTransaction(transaction) ? 'sent' : 'received'}`}>
                      {isSentTransaction(transaction) ? '-' : '+'}₹{transaction.amount}
                    </span>
                    <span className={`status ${transaction.status.toLowerCase()}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-transactions">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMoney;