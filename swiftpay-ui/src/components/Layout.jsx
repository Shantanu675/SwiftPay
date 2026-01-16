// components/Layout.js
import React from 'react';
import Header from './header.jsx';
// import '../stylesheets/layout.scss'

const Layout = ({ 
  children, 
  title, 
  subtitle, 
  actions = [], 
  showBackButton = true,
  showQuickActions = true 
}) => {
  return (
    <div className="app-layout">
      <Header 
        title={title} 
        subtitle={subtitle} 
        actions={actions}
        showBackButton={showBackButton}
        showQuickActions={showQuickActions}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
