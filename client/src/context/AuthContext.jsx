import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ─── Set baseURL once at module level (not inside a component) ───────
axios.defaults.baseURL = 'http://localhost:5000/api';

// ─── Restore auth token SYNCHRONOUSLY on module load ─────────────────
// This ensures the very first request (e.g. Navbar fetching notifications)
// already has the Authorization header — fixing the 401 race condition.
try {
  const savedUser = JSON.parse(localStorage.getItem('user'));
  if (savedUser?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${savedUser.token}`;
  }
} catch (_) {
  localStorage.removeItem('user');
}

export const AuthProvider = ({ children }) => {
  // Initialize user state synchronously from localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Keep axios Authorization header in sync whenever user changes
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axios.post('auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post('auth/register', { username, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('users/profile', profileData);

      const updatedUserObj = data.user || data;

      // Update local state and storage with merged data
      const mergedUser = { ...user, ...updatedUserObj };
      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));

      return updatedUserObj;
    } catch (err) {
      console.error('AuthContext Update Error:', err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
