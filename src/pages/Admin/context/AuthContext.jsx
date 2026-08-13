import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useClerkAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoaded || !isSignedIn || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/users/profile/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          
          // Store user data in localStorage for dashboard to use
          localStorage.setItem("userFullName", data.fullName || "");
          localStorage.setItem("userEmail", data.email || "");
          localStorage.setItem("userRole", data.role || "");
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoaded, isSignedIn, user]);

  const value = {
    user,
    userProfile,
    loading,
    isLoaded,
    isSignedIn,
    setUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;