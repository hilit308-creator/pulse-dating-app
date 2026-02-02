import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global store for Home deck state persistence across route transitions.
 * Uses sessionStorage to persist state across page navigations.
 */
// Force reset on version change
const STORE_VERSION = 4;
const storedVersion = sessionStorage.getItem('pulse-home-deck-version');
if (storedVersion !== String(STORE_VERSION)) {
  console.log('[homeDeckStore] Version mismatch, clearing storage');
  sessionStorage.removeItem('pulse-home-deck-storage');
  sessionStorage.setItem('pulse-home-deck-version', String(STORE_VERSION));
}

// Daily reset - clear picks at start of each new day
const today = new Date().toDateString();
const lastResetDate = localStorage.getItem('pulse-last-daily-reset');
if (lastResetDate !== today) {
  console.log('[homeDeckStore] New day detected, resetting picks for fresh daily experience');
  sessionStorage.removeItem('pulse-home-deck-storage');
  localStorage.setItem('pulse-last-daily-reset', today);
}

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
      
      // Full profile data for liked users (for YOU LIKE tab in Matches)
      likedProfiles: [],
      
      // Mutual matches (for MUTUAL MATCHES tab in Matches)
      mutualMatches: [],
      
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
      
      // Liked profiles management (full profile data for YOU LIKE tab)
      setLikedProfiles: (profiles) => set({ likedProfiles: Array.isArray(profiles) ? profiles : [] }),
      addLikedProfile: (profile) => set((state) => {
        const arr = Array.isArray(state.likedProfiles) ? state.likedProfiles : [];
        // Don't add duplicates
        if (arr.some(p => p.id === profile.id)) return state;
        return { likedProfiles: [...arr, { ...profile, likedAt: Date.now() }] };
      }),
      removeLikedProfile: (userId) => set((state) => {
        const arr = Array.isArray(state.likedProfiles) ? state.likedProfiles : [];
        return { likedProfiles: arr.filter(p => p.id !== userId) };
      }),
      
      // Mutual matches management (for MUTUAL MATCHES tab)
      setMutualMatches: (matches) => set({ mutualMatches: Array.isArray(matches) ? matches : [] }),
      addMutualMatch: (profile) => set((state) => {
        const arr = Array.isArray(state.mutualMatches) ? state.mutualMatches : [];
        // Don't add duplicates
        if (arr.some(p => p.id === profile.id)) return state;
        return { mutualMatches: [...arr, { ...profile, matchedAt: Date.now(), status: 'mutual', chatActive: true, chatTimeLeft: 900 }] };
      }),
      removeMutualMatch: (userId) => set((state) => {
        const arr = Array.isArray(state.mutualMatches) ? state.mutualMatches : [];
        return { mutualMatches: arr.filter(p => p.id !== userId) };
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
        likedProfiles: [],
        mutualMatches: [],
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
        likedProfiles: [],
        mutualMatches: [],
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
              if (!Array.isArray(parsed.state.likedProfiles)) parsed.state.likedProfiles = [];
              if (!Array.isArray(parsed.state.mutualMatches)) parsed.state.mutualMatches = [];
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
        likedProfiles: state.likedProfiles,
        mutualMatches: state.mutualMatches,
        anchorUserId: state.anchorUserId,
        anchorIdsHash: state.anchorIdsHash,
      }),
    }
  )
);

export default useHomeDeckStore;
