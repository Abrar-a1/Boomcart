import { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
const CART_KEY = 'boomcart_cart';

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const { item } = action;
      const exists = state.find(i => i._key === item._key);
      if (exists) return state.map(i => i._key === item._key ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...state, item];
    }
    case 'REMOVE':   return state.filter(i => i._key !== action.key);
    case 'UPDATE':   return state.map(i => i._key === action.key ? { ...i, quantity: Math.max(1, action.qty) } : i);
    case 'CLEAR':    return [];
    case 'LOAD':     return action.items;
    default:         return state;
  }
};

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(reducer, [], () => {
    try { 
      const stored = localStorage.getItem(CART_KEY);
      
      if (!localStorage.getItem('boomcart_cart_migrated_v1')) {
        if (!stored || JSON.parse(stored).length === 0) {
          // MIGRATION: Read legacy boomcart-storage if boomcart_cart is missing/empty
          const legacy = localStorage.getItem('boomcart-storage');
          if (legacy) {
            const legacyParsed = JSON.parse(legacy);
            if (legacyParsed?.state?.cart && Array.isArray(legacyParsed.state.cart)) {
              const migrated = legacyParsed.state.cart.map(item => ({
                _key: `${item.productId}_${item.selectedSize || ''}_`,
                product: item.productId,
                name: item.name,
                image: item.image,
                price: item.price, // faithfully preserve legacy price
                quantity: item.quantity,
                size: item.selectedSize || '',
                color: ''
              }));
              localStorage.setItem(CART_KEY, JSON.stringify(migrated));
              localStorage.setItem('boomcart_cart_migrated_v1', 'true');
              return migrated;
            }
          }
        }
        localStorage.setItem('boomcart_cart_migrated_v1', 'true');
      }

      if (stored) return JSON.parse(stored);
      
      return []; 
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    const item = {
      _key:     `${product._id}_${size}_${color}`,
      product:  product._id,
      name:     product.name,
      image:    product.images[0]?.url || '',
      price:    product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity, size, color,
    };
    dispatch({ type: 'ADD', item });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (key) => dispatch({ type: 'REMOVE', key });
  const updateQuantity = (key, qty) => dispatch({ type: 'UPDATE', key, qty });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const itemsPrice    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const taxPrice      = Math.round(itemsPrice * 0.05);
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;
  const cartCount     = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, itemsPrice, shippingPrice, taxPrice, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
