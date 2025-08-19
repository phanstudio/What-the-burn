import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { disconnect } from '@wagmi/core';
import { config } from '../../utils/wagmi';

export const ProtectedRoute = ({ children }) => {
  const jwt = sessionStorage.getItem('jwt');
  const location = useLocation();
  return jwt ? children : <Navigate to="/" replace state={{ from: location }} />;
};

export const AdminProtectedRoute = ({ children }) => {
  const jwt = sessionStorage.getItem('jwt');
  const { isAdmin } = useAdmin();
  const location = useLocation();

  if (!jwt || !isAdmin) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export function handleForbidden(err) {
  if (err?.response?.status === 403) {
    console.warn('403 Forbidden — logging out...');
    sessionStorage.removeItem('jwt');
    disconnect(config);
  }
}
