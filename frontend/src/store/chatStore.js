// chatStore.js - Store for persisting chat data
// Chats created from gestures will persist after refresh

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set, get) => ({
      // Chats created from gestures (keyed by matchId)
      gestureChats: {},

      // Add or update a gesture chat
      addGestureChat: (chat) => {
        set((state) => ({
          gestureChats: {
            ...state.gestureChats,
            [chat.matchId]: chat,
          },
        }));
      },

      // Update messages in a gesture chat
      updateChatMessages: (matchId, messages) => {
        set((state) => {
          const existingChat = state.gestureChats[matchId];
          if (existingChat) {
            return {
              gestureChats: {
                ...state.gestureChats,
                [matchId]: {
                  ...existingChat,
                  messages,
                  lastSentAt: Math.max(...messages.map(m => m.timestamp)),
                },
              },
            };
          }
          return state;
        });
      },

      // Get all gesture chats as array
      getGestureChatsArray: () => {
        return Object.values(get().gestureChats);
      },

      // Get a specific gesture chat
      getGestureChat: (matchId) => {
        return get().gestureChats[matchId] || null;
      },

      // Remove a gesture chat
      removeGestureChat: (matchId) => {
        set((state) => {
          const { [matchId]: removed, ...rest } = state.gestureChats;
          return { gestureChats: rest };
        });
      },
    }),
    {
      name: 'pulse-gesture-chats',
      partialize: (state) => ({ gestureChats: state.gestureChats }),
    }
  )
);

export default useChatStore;
