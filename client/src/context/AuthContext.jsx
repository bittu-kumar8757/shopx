import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as apiLogin } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('shopx-admin-token');
    if (savedToken) { setToken(savedToken); setIsAdmin(true); }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin({ username, password });
    const { token } = res.data;
    localStorage.setItem('shopx-admin-token', token);
    setToken(token);
    setIsAdmin(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('shopx-admin-token');
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
