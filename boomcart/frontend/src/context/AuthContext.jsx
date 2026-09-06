import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginUser, sendOtp, verifyOtp, logoutUser, getMe } from '../services/authService';
import { getWishlist } from '../services/userService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // Track wishlist IDs in context so ProductCard can init wishlisted state (#3 fix)
  const [wishlistIds, setWishlistIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('boomcart_wishlist') || '[]'); } catch { return []; }
  });

  const refreshWishlist = useCallback(async () => {
    try {
      const { data } = await getWishlist();
      const ids = (data.data || []).map(p => p._id);
      setWishlistIds(ids);
      localStorage.setItem('boomcart_wishlist', JSON.stringify(ids));
    } catch { /* silently ignore */ }
  }, []);

  // On startup, check session via /auth/me
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await getMe();
        setUser(data.data);
        refreshWishlist();
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      setUser(data.data);
      toast.success(`Welcome back, ${data.data.name}!`);
      setTimeout(refreshWishlist, 0);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await sendOtp({ email, type: 'signup' });
      toast.success('OTP sent! Please check your email.');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const verifyRegistration = async (name, email, password, otp) => {
    setLoading(true);
    try {
      const { data } = await verifyOtp({ name, email, password, otp, type: 'signup' });
      setUser(data.data);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout request failed', err);
    }
    localStorage.removeItem('boomcart_wishlist');
    setUser(null);
    setWishlistIds([]);
    toast.success('Logged out');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  // Toggle a single ID in the local wishlist map (avoids refetch on every toggle)
  const toggleWishlistId = (productId) => {
    setWishlistIds(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('boomcart_wishlist', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, verifyRegistration, logout, updateUser,
      isAdmin: user?.role === 'admin',
      wishlistIds, refreshWishlist, toggleWishlistId,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
