import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, userToken) => {
    try {
      setUser(userData);
      setToken(userToken);
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save login data', e);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.error('Failed to remove login data', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
