import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { getWishlist } from '../services/userService';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const KEY = 'boomcart_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  });
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

  // On startup, if user is already logged in, sync wishlist from server
  useEffect(() => {
    if (user) refreshWishlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem(KEY, JSON.stringify(data.data));
      setUser(data.data);
      toast.success(`Welcome back, ${data.data.name}!`);
      // Load wishlist after login
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
      const { data } = await registerUser({ name, email, password });
      localStorage.setItem(KEY, JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Account created!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem('boomcart_wishlist');
    setUser(null);
    setWishlistIds([]);
    toast.success('Logged out');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem(KEY, JSON.stringify(updated));
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
      user, loading, login, register, logout, updateUser,
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
