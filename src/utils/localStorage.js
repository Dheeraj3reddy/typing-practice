// Profile management
export const getProfiles = () => {
  const profiles = JSON.parse(localStorage.getItem('typingProfiles') || '{}');
  // Ensure default profiles exist
  if (!profiles.test) {
    profiles.test = { name: 'Test', tests: [] };
  }
  if (!profiles.real) {
    profiles.real = { name: 'Real', tests: [] };
  }
  return profiles;
};

export const getCurrentProfile = () => {
  return localStorage.getItem('currentProfile') || 'real';
};

export const setCurrentProfile = (profileId) => {
  localStorage.setItem('currentProfile', profileId);
};

export const createProfile = (profileId, profileName) => {
  const profiles = getProfiles();
  profiles[profileId] = { name: profileName, tests: [] };
  localStorage.setItem('typingProfiles', JSON.stringify(profiles));
  return profiles;
};

export const deleteProfile = (profileId) => {
  const profiles = getProfiles();
  if (profileId !== 'test' && profileId !== 'real') { // Protect default profiles
    delete profiles[profileId];
    localStorage.setItem('typingProfiles', JSON.stringify(profiles));
  }
  return profiles;
};

export const saveTestResults = (results, profileId = null) => {
  const currentProfileId = profileId || getCurrentProfile();
  const profiles = getProfiles();
  
  if (!profiles[currentProfileId]) {
    profiles[currentProfileId] = { name: currentProfileId, tests: [] };
  }
  
  profiles[currentProfileId].tests.push(results);
  localStorage.setItem('typingProfiles', JSON.stringify(profiles));
};

export const getTestResults = (profileId = null) => {
  const currentProfileId = profileId || getCurrentProfile();
  const profiles = getProfiles();
  return profiles[currentProfileId]?.tests || [];
};

// Migration function for existing data
export const migrateOldData = () => {
  const oldData = JSON.parse(localStorage.getItem('typingTests') || '[]');
  if (oldData.length > 0) {
    const profiles = getProfiles();
    // Move existing tests to "test" profile instead of "real"
    profiles.test.tests = [...profiles.test.tests, ...oldData];
    localStorage.setItem('typingProfiles', JSON.stringify(profiles));
    localStorage.removeItem('typingTests'); // Remove old data
  }
};
