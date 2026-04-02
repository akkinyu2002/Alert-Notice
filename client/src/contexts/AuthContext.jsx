import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);
const isAdminRole = (role) => role === 'admin' || role === 'hospital';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => {
          if (isAdminRole(res.data?.role)) {
            setUser(res.data);
            return;
          }
          localStorage.removeItem('token');
          setUser(null);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (userData, token) => {
    if (!isAdminRole(userData?.role)) {
      localStorage.removeItem('token');
      setUser(null);
      return;
    }
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const isAdmin = isAdminRole(user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
