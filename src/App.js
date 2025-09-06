import React, { useState, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import Statistics from './components/Statistics';
import ProfileSelector from './components/ProfileSelector';
import { migrateOldData, getCurrentProfile } from './utils/localStorage';
import './styles/App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('test');
  const [currentProfile, setCurrentProfile] = useState(getCurrentProfile());

  // Migrate old data on app start
  useEffect(() => {
    migrateOldData();
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleProfileChange = (profileId) => {
    setCurrentProfile(profileId);
    // Force re-render of components that depend on profile data
    window.location.reload();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-text">TypeFlow</span>
        </div>
        
        <nav className="nav">
          <button 
            className={`nav-item ${view === 'test' ? 'active' : ''}`}
            onClick={() => setView('test')}
          >
            <i className="icon">⌨</i>
            <span>test</span>
          </button>
          <button 
            className={`nav-item ${view === 'stats' ? 'active' : ''}`}
            onClick={() => setView('stats')}
          >
            <i className="icon">📊</i>
            <span>statistics</span>
          </button>
        </nav>

        <div className="header-right">
          <ProfileSelector onProfileChange={handleProfileChange} />
          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main">
        {view === 'test' ? <TypingTest /> : <Statistics />}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#" className="footer-link">contact</a>
          <a href="#" className="footer-link">support</a>
          <a href="#" className="footer-link">github</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
