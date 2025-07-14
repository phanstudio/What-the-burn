import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Create the context
const AdminContext = createContext();

// 2. Create the provider component
export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdminState] = useState(false);

  // Load from sessionStorage when app loads
  useEffect(() => {
    const stored = sessionStorage.getItem('isAdmin');
    if (stored === 'true') {
      setIsAdminState(true);
    }
  }, []);

  // Wrapper to update state + sessionStorage
  const setIsAdmin = (val) => {
    setIsAdminState(val);
    sessionStorage.setItem('isAdmin', val ? 'true' : 'false');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

// 3. Hook to use admin context
export const useAdmin = () => {
  return useContext(AdminContext);
};
