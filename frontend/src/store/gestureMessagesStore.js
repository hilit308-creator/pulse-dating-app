// gestureMessagesStore.js - Store for gesture messages sent from Explore screen
// These messages will appear in the Chat screen

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGestureMessagesStore = create(
  persist(
    (set, get) => ({
      // Messages sent via gestures, keyed by recipient user ID
      gestureMessages: {},
      
      // User info for creating new chats
      recipientUsers: {},
      
      // Track which gestures were sent to which person (persisted)
      sentGestures: {},
      
      // Monthly gesture usage tracking
      monthlyGestureUsage: {
        count: 0,
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
      },
      
      // User subscription status (mock - would come from backend)
      isPulsePro: false,
      
      // User points balance (mock - would come from backend)
      // Start with 0 points - users earn points through activities
      pointsBalance: 0,
      
      // Flag to track if a gesture is currently being processed (dialog open)
      gestureInProgress: false,

      // Add a gesture message for a user
      addGestureMessage: (userId, gestureData, userInfo) => {
        const message = {
          id: `gesture_${Date.now()}`,
          type: 'gesture',
          gestureType: gestureData.gestureType, // 'coffee', 'flower', 'gift', 'sayhi'
          from: 'me',
          text: gestureData.message,
          timestamp: Date.now(),
          status: 'sent',
          gestureDetails: gestureData.details, // cafe, drink, shop, flower, gift, etc.
          reactions: {},
        };

        set((state) => ({
          gestureMessages: {
            ...state.gestureMessages,
            [userId]: [...(state.gestureMessages[userId] || []), message],
          },
          // Save user info for creating new chat
          recipientUsers: userInfo ? {
            ...state.recipientUsers,
            [userId]: userInfo,
          } : state.recipientUsers,
        }));

        return message;
      },

      // Get gesture messages for a specific user
      getMessagesForUser: (userId) => {
        return get().gestureMessages[userId] || [];
      },

      // Clear gesture messages for a user (after they've been loaded into chat)
      clearMessagesForUser: (userId) => {
        set((state) => {
          const { [userId]: removedMessages, ...restMessages } = state.gestureMessages;
          const { [userId]: removedUser, ...restUsers } = state.recipientUsers;
          return { 
            gestureMessages: restMessages,
            recipientUsers: restUsers,
          };
        });
      },
      
      // Get user info for a recipient
      getRecipientUser: (userId) => {
        return get().recipientUsers[userId] || null;
      },
      
      // Mark gesture as sent for a person
      markGestureSent: (userId, gestureType) => {
        set((state) => ({
          sentGestures: {
            ...state.sentGestures,
            [userId]: { ...state.sentGestures[userId], [gestureType]: true },
          },
        }));
      },
      
      // Check if gesture was sent to a person
      isGestureSent: (userId, gestureType) => {
        return get().sentGestures[userId]?.[gestureType] || false;
      },
      
      // Get all sent gestures for a person
      getSentGesturesForUser: (userId) => {
        return get().sentGestures[userId] || {};
      },
      
      // Check and reset monthly usage if new month
      checkAndResetMonthlyUsage: () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const usage = get().monthlyGestureUsage;
        
        if (usage.month !== currentMonth || usage.year !== currentYear) {
          set({
            monthlyGestureUsage: {
              count: 0,
              month: currentMonth,
              year: currentYear,
            },
          });
        }
      },
      
      // Get remaining free gestures this month
      getRemainingFreeGestures: () => {
        const state = get();
        state.checkAndResetMonthlyUsage?.();
        if (state.isPulsePro) return Infinity;
        return Math.max(0, 1 - state.monthlyGestureUsage.count);
      },
      
      // Check if user can send gesture (free or has points)
      canSendGesture: () => {
        const state = get();
        // Reset monthly usage if new month
        state.checkAndResetMonthlyUsage?.();
        // Re-get state after potential reset
        const currentState = get();
        if (currentState.isPulsePro) return { canSend: true, reason: 'pro' };
        if (currentState.monthlyGestureUsage.count < 1) return { canSend: true, reason: 'free' };
        if (currentState.pointsBalance >= 60) return { canSend: true, reason: 'points', cost: 60 };
        return { canSend: false, reason: 'limit_reached' };
      },
      
      // Start gesture process (when dialog opens)
      startGestureProcess: () => {
        set({ gestureInProgress: true });
      },
      
      // End gesture process (when dialog closes without sending)
      cancelGestureProcess: () => {
        set({ gestureInProgress: false });
      },
      
      // Use a gesture (increment count or deduct points)
      useGesture: () => {
        const state = get();
        state.checkAndResetMonthlyUsage?.();
        
        // Reset gestureInProgress flag
        set({ gestureInProgress: false });
        
        if (state.isPulsePro) {
          // Pro users - no limit
          return { success: true, method: 'pro' };
        }
        
        if (state.monthlyGestureUsage.count < 1) {
          // Use free monthly gesture
          set({
            monthlyGestureUsage: {
              ...state.monthlyGestureUsage,
              count: state.monthlyGestureUsage.count + 1,
            },
          });
          return { success: true, method: 'free' };
        }
        
        if (state.pointsBalance >= 60) {
          // Deduct points
          set({
            pointsBalance: state.pointsBalance - 60,
          });
          return { success: true, method: 'points', pointsUsed: 60 };
        }
        
        return { success: false, reason: 'insufficient_resources' };
      },
      
      // Set Pro status (mock - would come from backend)
      setPulsePro: (isPro) => {
        set({ isPulsePro: isPro });
      },
      
      // Add points (mock - would come from backend)
      addPoints: (amount) => {
        set((state) => ({
          pointsBalance: state.pointsBalance + amount,
        }));
      },

      // Mark messages as delivered/read
      updateMessageStatus: (userId, messageId, status) => {
        set((state) => ({
          gestureMessages: {
            ...state.gestureMessages,
            [userId]: (state.gestureMessages[userId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, status } : msg
            ),
          },
        }));
      },
    }),
    {
      name: 'pulse-gesture-messages',
      partialize: (state) => ({ 
        gestureMessages: state.gestureMessages,
        recipientUsers: state.recipientUsers,
        sentGestures: state.sentGestures,
        monthlyGestureUsage: state.monthlyGestureUsage,
        isPulsePro: state.isPulsePro,
        pointsBalance: state.pointsBalance,
      }),
    }
  )
);

export { useGestureMessagesStore };
export default useGestureMessagesStore;
