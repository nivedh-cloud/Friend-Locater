// Vercel deployment trigger
import React, { useState } from 'react';
import './App.css';
import TrackingDashboard from './features/tracking/TrackingDashboard';
import AuthScreen from './features/auth/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="App overflow-hidden">
      {!isAuthenticated ? (
        <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <TrackingDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
