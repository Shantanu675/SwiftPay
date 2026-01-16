import React, { useState, useEffect } from 'react';
import '../stylesheets/rewards.scss';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRedeemPopup, setShowRedeemPopup] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.userId;

      const response = await fetch(`http://localhost:8080/api/rewards/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const rewardsData = await response.json();
        setRewards(rewardsData);
        
        // Calculate total points
        const total = rewardsData.reduce((sum, reward) => sum + reward.points, 0);
        setTotalPoints(total);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const products = [
    {
      id: 1,
      name: "Amazon Voucher",
      points: 1000,
      image: "🛍️",
      description: "₹100 Amazon Gift Card",
      category: "Shopping"
    },
    {
      id: 2,
      name: "Starbucks Coffee",
      points: 500,
      image: "☕",
      description: "Free Premium Coffee",
      category: "Food & Beverage"
    },
    {
      id: 3,
      name: "Uber Ride",
      points: 750,
      image: "🚗",
      description: "₹150 Uber Ride Credit",
      category: "Travel"
    },
    {
      id: 4,
      name: "Movie Tickets",
      points: 1200,
      image: "🎬",
      description: "2 Cinema Tickets",
      category: "Entertainment"
    },
    {
      id: 5,
      name: "Mobile Recharge",
      points: 300,
      image: "📱",
      description: "₹50 Mobile Recharge",
      category: "Utility"
    },
    {
      id: 6,
      name: "Flipkart Voucher",
      points: 2000,
      image: "📦",
      description: "₹200 Shopping Voucher",
      category: "Shopping"
    }
  ];

  const handleRedeem = (product) => {
    if (totalPoints >= product.points) {
      setSelectedProduct(product);
      setShowRedeemPopup(true);
    }
  };

  const confirmRedeem = () => {
    // Here you would call your redeem API
    alert(`🎉 Successfully redeemed ${selectedProduct.name}!`);
    setShowRedeemPopup(false);
    setSelectedProduct(null);
    
    // Update points (in real app, this would come from backend)
    setTotalPoints(prev => prev - selectedProduct.points);
  };

  const closePopup = () => {
    setShowRedeemPopup(false);
    setSelectedProduct(null);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="rewards-loading">
        <div className="loading-spinner"></div>
        <p>Loading your rewards...</p>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      {/* Redeem Confirmation Popup */}
      {showRedeemPopup && selectedProduct && (
        <div className="redeem-popup-overlay">
          <div className="redeem-popup">
            <div className="popup-header">
              <div className="product-icon">{selectedProduct.image}</div>
              <h3>Redeem Reward</h3>
            </div>
            <div className="popup-body">
              <div className="product-info">
                <h4>{selectedProduct.name}</h4>
                <p>{selectedProduct.description}</p>
                <div className="points-cost">
                  <span className="cost">{selectedProduct.points} points</span>
                </div>
              </div>
              <div className="balance-after">
                <span>Balance after redemption: </span>
                <strong>{totalPoints - selectedProduct.points} points</strong>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-cancel" onClick={closePopup}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmRedeem}>
                Confirm Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rewards-card">
        {/* Header Section */}
        <div className="rewards-header">
          <div className="points-display">
            <div className="total-points">
              <span className="points-label">Your Rewards Points</span>
              <div className="points-value">{totalPoints}</div>
              <span className="points-subtitle">10x points on every transaction!</span>
            </div>
            <div className="points-info">
              <div className="info-item">
                <span className="info-label">Earn Rate</span>
                <span className="info-value">10x</span>
              </div>
              <div className="info-item">
                <span className="info-label">Value</span>
                <span className="info-value">₹{totalPoints / 100}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        <section className="rewards-section">
          <div className="section-header">
            <h2>Rewards History</h2>
            <span className="section-badge">{rewards.length} transactions</span>
          </div>
          {rewards.length > 0 ? (
            <div className="rewards-history">
              {rewards.map((reward, index) => (
                <div key={reward.id} className="reward-item">
                  <div className="reward-icon">⭐</div>
                  <div className="reward-details">
                    <div className="reward-amount">+{reward.points} points</div>
                    <div className="reward-date">{formatDate(reward.sentAt)}</div>
                  </div>
                  <div className="reward-badge">
                    Transaction Reward
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-rewards">
              <div className="no-rewards-icon">🎁</div>
              <h3>No rewards yet</h3>
              <p>Start sending money to earn reward points!</p>
            </div>
          )}
        </section>

        {/* Redeem Products */}
        <section className="rewards-section">
          <div className="section-header">
            <h2>Redeem Your Points</h2>
            <span className="section-badge">{products.length} offers</span>
          </div>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image}
                </div>
                <div className="product-content">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <div className="product-points">
                      <span className="points-required">{product.points} points</span>
                    </div>
                    <button 
                      className={`redeem-btn ${totalPoints >= product.points ? 'available' : 'disabled'}`}
                      onClick={() => handleRedeem(product)}
                      disabled={totalPoints < product.points}
                    >
                      {totalPoints >= product.points ? 'Redeem' : 'Need More Points'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="info-section">
          <h3>How Rewards Work</h3>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Send Money</strong>
                <p>Every transaction earns you 10x reward points</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Collect Points</strong>
                <p>Points are added instantly to your account</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Redeem Rewards</strong>
                <p>Exchange points for exciting gifts and vouchers</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rewards;