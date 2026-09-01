import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
  // -----------------------------------------------------
  // 1. CART STATE
  // -----------------------------------------------------
  cart: [],

  addToCart: (product, selectedSize, quantity = 1) => {
    set((state) => {
      // Check if product with exact size is already in cart
      const existingItemIndex = state.cart.findIndex(
        item => item.productId === product._id && item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += quantity;
        return { cart: newCart };
      }

      // Add fresh item to cart
      return {
        cart: [
          ...state.cart,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || '',
            selectedSize,
            quantity
          }
        ]
      };
    });
  },

  removeFromCart: (productId, selectedSize) => {
    set((state) => ({
      cart: state.cart.filter(
        item => !(item.productId === productId && item.selectedSize === selectedSize)
      )
    }));
  },

  increaseQuantity: (productId, selectedSize) => {
    set((state) => ({
      cart: state.cart.map(item => 
        (item.productId === productId && item.selectedSize === selectedSize)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }));
  },

  decreaseQuantity: (productId, selectedSize) => {
    set((state) => ({
      cart: state.cart.map(item => 
        (item.productId === productId && item.selectedSize === selectedSize && item.quantity > 1)
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    }));
  },

  clearCart: () => set({ cart: [] }),

  // -----------------------------------------------------
  // 2. BOOKING STATE
  // -----------------------------------------------------
  booking: null,
  
  setBooking: (bookingData) => set({ booking: bookingData }),
  
  clearBooking: () => set({ booking: null }),
    }),
    {
      name: 'boomcart-storage', // Key added for strict HTML5 localStorage
    }
  )
);
