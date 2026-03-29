import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken');
  });
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const info = localStorage.getItem('adminInfo');
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  });

  const login = (token, admin) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(admin));
    setIsAuthenticated(true);
    setAdminInfo(admin);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    setAdminInfo(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
