import React from 'react';
import '../stylesheets/home.scss';

const HomePage = () => {
  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  const handleLearnMore = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-brand">
          <div className="logo">
            <span className="logo-icon">💸</span>
            <span className="logo-text">SwiftPay</span>
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-btn login-btn" onClick={() => window.location.href = '/login'}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ The Future of Payments is Here</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to
            <span className="gradient-text"> SwiftPay</span>
          </h1>
          
          <p className="hero-subtitle">
            Experience seamless, secure, and instant payments. 
            Join millions who trust SwiftPay for their everyday transactions.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">10M+</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat">
              <div className="stat-number">$50B+</div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={handleGetStarted}>
              <span className="btn-text">Get Started Free</span>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn btn-secondary" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>

          <div className="hero-scroll">
            <div className="scroll-indicator">
              <span>Scroll to explore</span>
              <div className="scroll-arrow"></div>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="glass-card card-1">
            <div className="card-header">
              <div className="card-icon">💳</div>
              <div className="card-amount">$1,250.00</div>
            </div>
            <div className="card-details">
              <div className="card-name">John Doe</div>
              <div className="card-number">•••• 4512</div>
            </div>
          </div>

          <div className="glass-card card-2">
            <div className="transaction">
              <div className="transaction-icon">📤</div>
              <div className="transaction-details">
                <div className="transaction-amount">-$45.00</div>
                <div className="transaction-merchant">Coffee Shop</div>
              </div>
            </div>
          </div>

          <div className="glass-card card-3">
            <div className="notification">
              <div className="notification-icon">🎁</div>
              <div className="notification-content">
                <div className="notification-title">Reward Earned!</div>
                <div className="notification-desc">5% cashback</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose SwiftPay?</h2>
            <p>Built for speed, security, and simplicity</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Transfers</h3>
              <p>Send and receive money in seconds, not days. 24/7 availability.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Bank-Grade Security</h3>
              <p>Military-grade encryption and fraud protection for your peace of mind.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Send money anywhere in the world with competitive exchange rates.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Zero Fees</h3>
              <p>No hidden charges. What you see is what you pay. Seriously.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>Track your spending and get insights to manage your money better.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Rewards Program</h3>
              <p>Earn cashback and rewards on every transaction you make.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join SwiftPay today and experience the future of digital payments.</p>
            <button className="btn btn-large" onClick={handleGetStarted}>
              Create Your Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">💸</span>
                <span className="logo-text">SwiftPay</span>
              </div>
              <p>Making payments simple, secure, and seamless.</p>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#security">Security</a>
              <a href="#help">Help</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SwiftPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;