import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global store for Home deck state persistence across route transitions.
 * Uses sessionStorage to persist state across page navigations.
 */
const useHomeDeckStore = create(
  persist(
    (set, get) => ({
      // Cached users from API
      users: [],
      isUsersLoaded: false,
      
      // Swipe state
      likedUsers: [],
      passedUsers: [],
      swipeHistory: [],
      
      // Navigation anchor - the userId that should be visible after Back
      anchorUserId: null,
      anchorIdsHash: null,
      
      // Actions
      setUsers: (users) => set({ users, isUsersLoaded: true }),
      
      setLikedUsers: (likedUsers) => set({ likedUsers: Array.isArray(likedUsers) ? likedUsers : [] }),
      addLikedUser: (userId) => set((state) => {
        const arr = Array.isArray(state.likedUsers) ? state.likedUsers : [];
        return { likedUsers: arr.includes(userId) ? arr : [...arr, userId] };
      }),
      removeLikedUser: (userId) => set((state) => {
        const arr = Array.isArray(state.likedUsers) ? state.likedUsers : [];
        return { likedUsers: arr.filter(id => id !== userId) };
      }),
      
      setPassedUsers: (passedUsers) => set({ passedUsers: Array.isArray(passedUsers) ? passedUsers : [] }),
      addPassedUser: (userId) => set((state) => {
        const arr = Array.isArray(state.passedUsers) ? state.passedUsers : [];
        return { passedUsers: arr.includes(userId) ? arr : [...arr, userId] };
      }),
      removePassedUser: (userId) => set((state) => {
        const arr = Array.isArray(state.passedUsers) ? state.passedUsers : [];
        return { passedUsers: arr.filter(id => id !== userId) };
      }),
      
      setSwipeHistory: (swipeHistory) => set({ swipeHistory: Array.isArray(swipeHistory) ? swipeHistory : [] }),
      addSwipeHistory: (entry) => set((state) => {
        const arr = Array.isArray(state.swipeHistory) ? state.swipeHistory : [];
        return { swipeHistory: [...arr, entry] };
      }),
      popSwipeHistory: () => set((state) => {
        const arr = Array.isArray(state.swipeHistory) ? state.swipeHistory : [];
        return { swipeHistory: arr.slice(0, -1) };
      }),
      getLastSwipeHistory: () => {
        const state = get();
        const arr = Array.isArray(state.swipeHistory) ? state.swipeHistory : [];
        return arr.length > 0 ? arr[arr.length - 1] : null;
      },
      
      // Anchor management for Back navigation
      setAnchor: (userId, idsHash = null) => set({ anchorUserId: userId, anchorIdsHash: idsHash }),
      clearAnchor: () => set({ anchorUserId: null, anchorIdsHash: null }),
      
      // Reset all state (for "Start over" button)
      resetDeck: () => set({
        likedUsers: [],
        passedUsers: [],
        swipeHistory: [],
        anchorUserId: null,
        anchorIdsHash: null,
      }),
      
      // Full reset including users (for logout/refresh)
      resetAll: () => set({
        users: [],
        isUsersLoaded: false,
        likedUsers: [],
        passedUsers: [],
        swipeHistory: [],
        anchorUserId: null,
        anchorIdsHash: null,
      }),
    }),
    {
      name: 'pulse-home-deck-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            // Ensure arrays are always arrays (fix corrupted data)
            if (parsed && parsed.state) {
              if (!Array.isArray(parsed.state.likedUsers)) parsed.state.likedUsers = [];
              if (!Array.isArray(parsed.state.passedUsers)) parsed.state.passedUsers = [];
              if (!Array.isArray(parsed.state.swipeHistory)) parsed.state.swipeHistory = [];
              if (!Array.isArray(parsed.state.users)) parsed.state.users = [];
            }
            return parsed;
          } catch (e) {
            console.error('[homeDeckStore] Failed to parse storage, resetting:', e);
            sessionStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      // Only persist these fields (not functions)
      partialize: (state) => ({
        users: state.users,
        isUsersLoaded: state.isUsersLoaded,
        likedUsers: state.likedUsers,
        passedUsers: state.passedUsers,
        swipeHistory: state.swipeHistory,
        anchorUserId: state.anchorUserId,
        anchorIdsHash: state.anchorIdsHash,
      }),
    }
  )
);

export default useHomeDeckStore;
