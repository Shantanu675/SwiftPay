import React, { useState, useEffect } from 'react';
import '../stylesheets/transaction.scss';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const transactionsPerPage = 10;

  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, dateRange, transactions, sortConfig]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Get user ID from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`${API_URL}/api/transactions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const transactionsData = await response.json();
      setTransactions(Array.isArray(transactionsData) ? transactionsData : [transactionsData]);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return tokenPayload.userId;
    } catch (e) {
      return null;
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };
  const isSentTransaction = (transaction) => {
    const currentUserId = getCurrentUserId();
    return transaction.senderId === currentUserId;
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : '';
  };

  // Stats calculation based on actual transaction data
  const stats = {
    totalSpent: transactions
      .filter(t => isSentTransaction(t) && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0),
    
    totalReceived: transactions
      .filter(t => !isSentTransaction(t) && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0),
    
    transactionCount: transactions.length,
    
    averageSpend: transactions
      .filter(t => isSentTransaction(t) && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0) / 
      transactions.filter(t => isSentTransaction(t)).length || 0
  };

  // Get current user ID from token
  



  // Categorize transactions (you might want to add category field to your transaction model)
  const categorizeTransaction = (transaction) => {
    // This is a simple categorization - you might want to implement a more sophisticated approach
    const amount = transaction.amount;
    if (amount > 2000) return 'Large Transfer';
    if (amount < 500) return 'Small Payment';
    return 'General';
  };

  // Generate category data for pie chart
  const categoryData = transactions
    .filter(t => isSentTransaction(t) && t.status === 'SUCCESS')
    .reduce((acc, t) => {
      const category = categorizeTransaction(t);
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {});

  // Generate monthly trend data from actual transactions
  const generateMonthlyData = () => {
    const monthlyStats = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { month: monthName, spent: 0, received: 0 };
      }
      
      if (isSentTransaction(transaction) && transaction.status === 'SUCCESS') {
        monthlyStats[monthKey].spent += transaction.amount;
      } else if (!isSentTransaction(transaction) && transaction.status === 'SUCCESS') {
        monthlyStats[monthKey].received += transaction.amount;
      }
    });
    
    return Object.values(monthlyStats).slice(-6); // Last 6 months
  };

  const monthlyData = generateMonthlyData();

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => {
        const otherUserName = isSentTransaction(transaction) 
          ? getUserName(transaction.receiverId)
          : getUserName(transaction.senderId);
        
        return (
          otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.amount.toString().includes(searchTerm) ||
          transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.id.toString().includes(searchTerm)
        );
      });
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(transaction => transaction.timestamp >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(transaction => transaction.timestamp <= dateRange.end + 'T23:59:59');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle timestamp sorting
      if (sortConfig.key === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleExport = (format) => {
    // Enhanced export functionality with actual data
    const exportData = filteredTransactions.map(transaction => ({
      ID: transaction.id,
      Date: formatDate(transaction.timestamp),
      Type: isSentTransaction(transaction) ? 'Sent' : 'Received',
      Amount: transaction.amount,
      Status: transaction.status,
      'Other Party': isSentTransaction(transaction) 
        ? getUserName(transaction.receiverId)
        : getUserName(transaction.senderId),
      Description: isSentTransaction(transaction) 
        ? `Sent to ${getUserName(transaction.receiverId)}`
        : `Received from ${getUserName(transaction.senderId)}`
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const csvContent = exportData.map(row => 
        Object.values(row).map(field => `"${field}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert(`PDF export would be implemented here with ${exportData.length} transactions`);
    }
  };

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: { class: 'completed', label: 'Completed' },
      PENDING: { class: 'pending', label: 'Pending' },
      FAILED: { class: 'failed', label: 'Failed' }
    };
    const config = statusConfig[status] || { class: 'pending', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getTypeIcon = (transaction) => {
    return isSentTransaction(transaction) ? '↗️' : '↙️';
  };

  const getTransactionDescription = (transaction) => {
    if (isSentTransaction(transaction)) {
      return `Sent to ${getUserName(transaction.receiverId)}`;
    } else {
      return `Received from ${getUserName(transaction.senderId)}`;
    }
  };

  // Get quick insights
  const getQuickInsights = () => {
    if (transactions.length === 0) return [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthSpent = transactions
      .filter(t => {
        const date = new Date(t.timestamp);
        return isSentTransaction(t) && 
               t.status === 'SUCCESS' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthSpent = transactions
      .filter(t => {
        const date = new Date(t.timestamp);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return isSentTransaction(t) && 
               t.status === 'SUCCESS' && 
               date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingChange = lastMonthSpent > 0 ? 
      ((thisMonthSpent - lastMonthSpent) / lastMonthSpent * 100) : 0;

    const largestTransaction = transactions
      .filter(t => t.status === 'SUCCESS')
      .reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0 });

    const insights = [];

    if (thisMonthSpent > 0) {
      insights.push({
        icon: '💰',
        text: `Total spending this month`,
        amount: `₹${thisMonthSpent.toLocaleString()}`
      });
    }

    if (Math.abs(spendingChange) > 0) {
      insights.push({
        icon: spendingChange > 0 ? '📈' : '📉',
        text: `${Math.abs(spendingChange).toFixed(0)}% ${spendingChange > 0 ? 'higher' : 'lower'} than last month`,
        subtext: spendingChange > 0 ? 'Consider reviewing your expenses' : 'Great job!'
      });
    }

    if (largestTransaction.amount > 0) {
      insights.push({
        icon: '⭐',
        text: `Largest transaction`,
        amount: `₹${largestTransaction.amount.toLocaleString()}`
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Transactions</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchTransactions}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      {/* Header */}
      <header className="transactions-header">
        <div className="header-left">
          <h1>Transaction History</h1>
          <p>View and manage all your transactions</p>
          {transactions.length > 0 && (
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => handleExport('pdf')}>
            Export PDF
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            Export CSV
          </button>
          <button className="btn btn-outline" onClick={fetchTransactions}>
            Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, amount, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="date-input"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              setDateRange({ start: '', end: '' });
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon spent">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-10a2 2 0 11-4 0 2 2 0 014 0zM6 18a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-value">₹{stats.totalSpent.toLocaleString()}</div>
            <div className="card-label">Total Spent</div>
            <div className="card-subtext">
              {transactions.filter(t => isSentTransaction(t) && t.status === 'SUCCESS').length} successful transactions
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon received">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-value">₹{stats.totalReceived.toLocaleString()}</div>
            <div className="card-label">Total Received</div>
            <div className="card-subtext">
              {transactions.filter(t => !isSentTransaction(t) && t.status === 'SUCCESS').length} successful transactions
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon count">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-value">{stats.transactionCount}</div>
            <div className="card-label">Total Transactions</div>
            <div className="card-subtext">
              {transactions.filter(t => t.status === 'SUCCESS').length} completed
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon average">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="card-content">
            <div className="card-value">₹{stats.averageSpend.toFixed(0)}</div>
            <div className="card-label">Average Transaction</div>
            <div className="card-subtext">
              Per sent transaction
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      {getQuickInsights().length > 0 && (
        <div className="insights-section">
          <div className="insight-card">
            <h3>Quick Insights</h3>
            {getQuickInsights().map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-icon">{insight.icon}</span>
                <div className="insight-content">
                  <div className="insight-text">{insight.text}</div>
                  {insight.amount && (
                    <div className="insight-amount">{insight.amount}</div>
                  )}
                  {insight.subtext && (
                    <div className="insight-subtext">{insight.subtext}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      {transactions.length > 0 && (
        <div className="charts-section">
          <div className="chart-card">
            <h3>Spending by Category</h3>
            {Object.keys(categoryData).length > 0 ? (
              <div className="pie-chart">
                {Object.entries(categoryData).map(([category, amount], index) => (
                  <div key={category} className="pie-segment">
                    <div 
                      className="segment-color"
                      style={{ 
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                      }}
                    ></div>
                    <span className="segment-label">{category}</span>
                    <span className="segment-amount">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-chart-data">
                <p>No spending data available</p>
              </div>
            )}
          </div>

          <div className="chart-card">
            <h3>Monthly Trends</h3>
            {monthlyData.length > 0 ? (
              <>
                <div className="bar-chart">
                  {monthlyData.map((month, index) => {
                    const maxValue = Math.max(...monthlyData.map(m => Math.max(m.spent, m.received)));
                    return (
                      <div key={month.month} className="bar-group">
                        <div className="bar-wrapper">
                          <div 
                            className="bar spent" 
                            style={{ height: `${(month.spent / maxValue) * 100}%` }}
                          ></div>
                          <div 
                            className="bar received" 
                            style={{ height: `${(month.received / maxValue) * 100}%` }}
                          ></div>
                        </div>
                        <span className="bar-label">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color spent"></div>
                    <span>Spent</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color received"></div>
                    <span>Received</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-chart-data">
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <section className="transactions-section">
        <div className="section-header">
          <h2>All Transactions</h2>
          <div className="table-info">
            Showing {currentTransactions.length} of {filteredTransactions.length} transactions
          </div>
        </div>

        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('timestamp')}>
                  Date {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('description')}>
                  Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Type</th>
                <th onClick={() => handleSort('amount')}>
                  Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="date-cell">{formatDate(transaction.timestamp)}</td>
                  <td className="description-cell">
                    <div className="description-content">
                      <span className="description-text">
                        {getTransactionDescription(transaction)}
                      </span>
                      <span className="category-tag">
                        {categorizeTransaction(transaction)}
                      </span>
                    </div>
                    <div className="transaction-id">
                      ID: {transaction.id}
                    </div>
                  </td>
                  <td className="type-cell">
                    <span className={`type-badge ${isSentTransaction(transaction) ? 'sent' : 'received'}`}>
                      {getTypeIcon(transaction)}
                      {isSentTransaction(transaction) ? 'Sent' : 'Received'}
                    </span>
                  </td>
                  <td className={`amount-cell ${isSentTransaction(transaction) ? 'sent' : 'received'}`}>
                    {isSentTransaction(transaction) ? '-' : '+'}₹{transaction.amount}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(transaction.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentTransactions.length === 0 && (
            <div className="no-transactions">
              {transactions.length === 0 ? (
                <>
                  <p>No transactions found.</p>
                  <p className="subtext">Start by sending or receiving money.</p>
                </>
              ) : (
                <>
                  <p>No transactions found matching your filters.</p>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setSearchTerm('');
                      setDateRange({ start: '', end: '' });
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Transactions;