import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('gallikart_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { success, error, info } = useToast();

  // Validate session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.getProfile().then((res) => {
        if (res.success && res.data) {
          const profile = res.data.user || res.data;
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } else if (res.status === 401 || res.code === 'INVALID_TOKEN') {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      });
    }
  }, []);

  // Fetch wishlist from server if authenticated
  useEffect(() => {
    if (user) {
      api.wishlist.getWishlist().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const ids = res.data.map((item) => item.productId?._id || item.productId || item);
          setWishlist(ids);
          localStorage.setItem('gallikart_wishlist', JSON.stringify(ids));
        }
      }).catch(() => {});
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && (res.data?.user || res.data?.accessToken)) {
        const loggedUser = res.data.user || res.data;
        setUser(loggedUser);
        success(`Welcome back, ${loggedUser.name || 'Member'}!`);
        return { success: true, user: loggedUser };
      } else {
        error(res.error || 'Invalid credentials');
        return { success: false, error: res.error };
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      if (res.success && (res.data?.user || res.data?.accessToken)) {
        const newUser = res.data.user || res.data;
        setUser(newUser);
        success(`Account created successfully! Welcome, ${newUser.name}`);
        return { success: true, user: newUser };
      } else {
        error(res.error || 'Registration failed');
        return { success: false, error: res.error };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('gallikart_wishlist');
    info('Logged out safely');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      info('Please sign in to save items to your wishlist');
      return;
    }

    const exists = wishlist.includes(productId);
    const updated = exists ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem('gallikart_wishlist', JSON.stringify(updated));

    if (exists) {
      info('Removed from saved items');
    } else {
      success('Saved to wishlist');
    }

    await api.wishlist.toggle(productId).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        wishlist,
        toggleWishlist,
        isSeller: user?.role === 'seller',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
