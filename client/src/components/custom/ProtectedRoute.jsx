import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const jwt = sessionStorage.getItem('jwt');
    return jwt ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;