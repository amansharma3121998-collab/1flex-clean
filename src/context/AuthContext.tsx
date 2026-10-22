import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types/media';

interface AuthContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  selectProfile: (profile: Profile) => void;
  addProfile: (name: string, isKid?: boolean) => void;
  updateProfileAvatar: (profileId: string, avatar: string) => void;
  isProfileSelected: boolean;
  setShowProfileSelector: (show: boolean) => void;
  showProfileSelector: boolean;
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'p_main', name: 'Viewer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', isKid: false },
  { id: 'p_fam', name: 'Family', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isKid: false },
  { id: 'p_kids', name: 'Kids', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isKid: true },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('moviesbox_profiles') || localStorage.getItem('1flex_profiles');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(() => {
    try {
      const savedId = sessionStorage.getItem('moviesbox_profile_selected') || sessionStorage.getItem('1flex_profile_selected');
      if (savedId) {
        const found = profiles.find(p => p.id === savedId);
        if (found) return found;
      }
      return profiles[0] || null;
    } catch {
      return profiles[0] || null;
    }
  });

  const [showProfileSelector, setShowProfileSelector] = useState(false);

  useEffect(() => {
    localStorage.setItem('moviesbox_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const selectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    sessionStorage.setItem('moviesbox_profile_selected', profile.id);
    setShowProfileSelector(false);
  };

  const addProfile = (name: string, isKid = false) => {
    const newProf: Profile = {
      id: `p_${Date.now()}`,
      name: name.trim() || 'New Profile',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isKid,
    };
    setProfiles(prev => [...prev, newProf]);
    selectProfile(newProf);
  };

  const updateProfileAvatar = (profileId: string, avatar: string) => {
    setProfiles(prev =>
      prev.map(p => (p.id === profileId ? { ...p, avatar } : p))
    );
    if (currentProfile?.id === profileId) {
      setCurrentProfile(prev => (prev ? { ...prev, avatar } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentProfile,
        profiles,
        selectProfile,
        addProfile,
        updateProfileAvatar,
        isProfileSelected: !!currentProfile,
        showProfileSelector,
        setShowProfileSelector,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
