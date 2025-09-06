import React, { useState } from 'react';
import { 
  getProfiles, 
  getCurrentProfile, 
  setCurrentProfile, 
  createProfile, 
  deleteProfile 
} from '../utils/localStorage';
import '../styles/ProfileManager.css';

const ProfileManager = ({ onProfileChange }) => {
  const [profiles, setProfiles] = useState(getProfiles());
  const [currentProfile, setCurrentProfileState] = useState(getCurrentProfile());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleProfileChange = (profileId) => {
    setCurrentProfile(profileId);
    setCurrentProfileState(profileId);
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
      
      // If we deleted the current profile, switch to 'real'
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
    <div className="profile-manager">
      <div className="profile-header">
        <h3>Profile: {profiles[currentProfile]?.name || currentProfile}</h3>
        <button 
          className="create-profile-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          + New Profile
        </button>
      </div>

      <div className="profile-selector">
        {Object.entries(profiles).map(([profileId, profile]) => {
          const stats = getProfileStats(profileId);
          const isActive = profileId === currentProfile;
          
          return (
            <div 
              key={profileId} 
              className={`profile-card ${isActive ? 'active' : ''}`}
              onClick={() => handleProfileChange(profileId)}
            >
              <div className="profile-info">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-stats">
                  <span>{stats.tests} tests</span>
                  <span>{stats.avgWpm} WPM</span>
                  <span>{stats.avgAccuracy}% acc</span>
                </div>
              </div>
              
              {profileId !== 'test' && profileId !== 'real' && (
                <button 
                  className="delete-profile-btn"
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

      {showCreateForm && (
        <div className="create-profile-form">
          <input
            type="text"
            placeholder="Profile name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
            autoFocus
          />
          <div className="form-buttons">
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
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h4>Delete Profile</h4>
            <p>Are you sure you want to delete "{profiles[showDeleteConfirm]?.name}"?</p>
            <p className="warning">This will permanently delete all test data for this profile.</p>
            <div className="modal-buttons">
              <button 
                className="delete-btn"
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

export default ProfileManager;
