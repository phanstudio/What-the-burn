import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from './AdminContext';

// const ProtectedRoute = ({ children }) => {
//     const jwt = sessionStorage.getItem('jwt');
//     return jwt ? children : <Navigate to="/" replace />;
// };

// export default ProtectedRoute;

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
