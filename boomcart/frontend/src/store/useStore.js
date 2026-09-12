import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
  // -----------------------------------------------------
  // BOOKING STATE
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
