import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loader text="Authenticating..." />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;