import React, { useState, useEffect, useRef } from 'react';
import { 
  getProfiles, 
  getCurrentProfile, 
  setCurrentProfile, 
  createProfile, 
  deleteProfile 
} from '../utils/localStorage';
import '../styles/ProfileSelector.css';

const ProfileSelector = ({ onProfileChange }) => {
  const [profiles, setProfiles] = useState(getProfiles());
  const [currentProfile, setCurrentProfileState] = useState(getCurrentProfile());
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileChange = (profileId) => {
    setCurrentProfile(profileId);
    setCurrentProfileState(profileId);
    setIsOpen(false);
    onProfileChange(profileId);
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const profileId = newProfileName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (profileId && !profiles[profileId]) {
        const updatedProfiles = createProfile(profileId, newProfileName.trim());
        setProfiles(updatedProfiles);
        setNewProfileName('');
        setShowCreateForm(false);
        handleProfileChange(profileId);
      }
    }
  };

  const handleDeleteProfile = (profileId) => {
    if (profileId !== 'test' && profileId !== 'real') {
      const updatedProfiles = deleteProfile(profileId);
      setProfiles(updatedProfiles);
      
      if (currentProfile === profileId) {
        handleProfileChange('real');
      }
    }
    setShowDeleteConfirm(null);
  };

  const getProfileStats = (profileId) => {
    const profile = profiles[profileId];
    if (!profile || !profile.tests || profile.tests.length === 0) {
      return { tests: 0, avgWpm: 0, avgAccuracy: 0 };
    }

    const tests = profile.tests;
    const avgWpm = tests.reduce((sum, test) => sum + (test.wpm || 0), 0) / tests.length;
    const avgAccuracy = tests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / tests.length;

    return {
      tests: tests.length,
      avgWpm: Math.round(avgWpm),
      avgAccuracy: Math.round(avgAccuracy)
    };
  };

  return (
    <div className="profile-selector" ref={dropdownRef}>
      <div className="profile-dropdown">
        <button 
          className="profile-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="profile-icon">👤</span>
          <span className="profile-name">{profiles[currentProfile]?.name || currentProfile}</span>
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="profile-menu">
            <div className="profile-list">
              {Object.entries(profiles).map(([profileId, profile]) => {
                const stats = getProfileStats(profileId);
                const isActive = profileId === currentProfile;
                
                return (
                  <div 
                    key={profileId} 
                    className={`profile-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleProfileChange(profileId)}
                  >
                    <div className="profile-item-info">
                      <span className="profile-item-name">{profile.name}</span>
                      <span className="profile-item-stats">
                        {stats.tests} tests • {stats.avgWpm} WPM • {stats.avgAccuracy}%
                      </span>
                    </div>
                    
                    {profileId !== 'test' && profileId !== 'real' && (
                      <button 
                        className="delete-profile-btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(profileId);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="profile-menu-divider"></div>
            
            <button 
              className="create-profile-btn-small"
              onClick={() => {
                setShowCreateForm(true);
                setIsOpen(false);
              }}
            >
              + New Profile
            </button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="create-profile-modal">
          <div className="modal-content-small">
            <h4>Create New Profile</h4>
            <input
              type="text"
              placeholder="Profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
              autoFocus
            />
            <div className="modal-buttons-small">
              <button onClick={handleCreateProfile} disabled={!newProfileName.trim()}>
                Create
              </button>
              <button onClick={() => {
                setShowCreateForm(false);
                setNewProfileName('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content-small">
            <h4>Delete Profile</h4>
            <p>Delete "{profiles[showDeleteConfirm]?.name}"?</p>
            <p className="warning-small">This will permanently delete all test data.</p>
            <div className="modal-buttons-small">
              <button 
                className="delete-btn-small"
                onClick={() => handleDeleteProfile(showDeleteConfirm)}
              >
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
