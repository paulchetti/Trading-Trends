import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../apiConfig.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tt_token') || null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('LANDING'); // 'LANDING', 'USER_DASHBOARD', 'ADMIN_DASHBOARD'
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchCurrentProfile(authToken) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setUser(data.user);
          setWallet(data.wallet);
          if (data.user?.role === 'ADMIN') {
            setActiveView('ADMIN_DASHBOARD');
          } else {
            setActiveView('USER_DASHBOARD');
          }
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(identifier, password) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
    } catch (netErr) {
      throw new Error('Unable to connect to server. Please verify backend is running on port 5050.');
    }

    let data;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(`Server returned non-JSON response (Status ${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    localStorage.setItem('tt_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);

    if (data.user.role === 'ADMIN') {
      setActiveView('ADMIN_DASHBOARD');
    } else {
      setActiveView('USER_DASHBOARD');
    }

    return data;
  }

  function logout() {
    localStorage.removeItem('tt_token');
    setToken(null);
    setUser(null);
    setWallet(null);
    setImpersonatedUser(null);
    setActiveView('LANDING');
  }

  async function refreshProfile() {
    if (token) {
      await fetchCurrentProfile(token);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        activeView,
        setActiveView,
        impersonatedUser,
        setImpersonatedUser,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
