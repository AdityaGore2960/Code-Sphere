import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize axios base URL
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post('/auth/register', { username, email, password });
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
    // If profileData is FormData, axios automatically handles the content-type
    const { data } = await axios.put('/users/profile', profileData);
    
    // Support both direct user object and { success, user } structure from server
    const updatedUserObj = data.user || data;
    
    // Merge existing user data (like token) with new profile data
    const mergedUser = { ...user, ...updatedUserObj };
    
    setUser(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    return updatedUserObj;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
