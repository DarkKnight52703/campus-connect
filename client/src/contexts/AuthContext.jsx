import React, { createContext, useContext, useState, useEffect } from 'react';

const UserAuthContext = createContext();
const AdminAuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser(decoded);
      } else {
        logout();
      }
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if(userData) setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setAdmin(decoded);
      } else {
        logout();
      }
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAuth = () => useContext(UserAuthContext);
export const useAdminAuth = () => useContext(AdminAuthContext);
