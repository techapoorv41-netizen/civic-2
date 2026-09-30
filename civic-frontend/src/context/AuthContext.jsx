import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("civic_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await getMe();
        if (isMounted) {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else if (!user) {
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted && !user) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("civic_user", JSON.stringify(response.data.user));
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiRegister(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("civic_user", JSON.stringify(response.data.user));
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("civic_user");
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
