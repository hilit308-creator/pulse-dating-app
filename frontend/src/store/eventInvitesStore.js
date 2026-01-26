import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const REMINDER_DELAY_MS = 90 * 1000;

const useEventInvitesStore = create(
  persist(
    (set, get) => ({
      invites: [],
      pairsByEventId: {},

      addInvite: (invite) => {
        const id = invite?.id || `event_invite_${Date.now()}`;
        const full = {
          id,
          status: 'pending', // pending | declined | accepted | gift_pending | gift_accepted | gift_declined
          createdAt: Date.now(),
          remindAt: null,
          reminded: false,
          ...invite,
        };

        set((state) => ({ invites: [full, ...state.invites] }));
        return full;
      },

      getNextPendingInvite: () => {
        return get().invites.find((i) => i.status === 'pending') || null;
      },

      acceptInvite: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) => {
            if (i.id !== inviteId) return i;
            if (i.paidByInviter) {
              return { ...i, status: 'gift_pending' };
            }
            return { ...i, status: 'accepted', remindAt: Date.now() + REMINDER_DELAY_MS };
          }),
          pairsByEventId: (() => {
            const inv = state.invites.find((x) => x.id === inviteId);
            const eventId = inv?.event?.id;
            if (!eventId) return state.pairsByEventId;
            return {
              ...state.pairsByEventId,
              [String(eventId)]: {
                matchId: inv?.matchId,
                name: inv?.inviter?.name,
              },
            };
          })(),
        }));
      },

      declineInvite: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) => (i.id === inviteId ? { ...i, status: 'declined' } : i)),
        }));
      },

      acceptGift: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) => (i.id === inviteId ? { ...i, status: 'gift_accepted' } : i)),
          pairsByEventId: (() => {
            const inv = state.invites.find((x) => x.id === inviteId);
            const eventId = inv?.event?.id;
            if (!eventId) return state.pairsByEventId;
            return {
              ...state.pairsByEventId,
              [String(eventId)]: {
                matchId: inv?.matchId,
                name: inv?.inviter?.name,
              },
            };
          })(),
        }));
      },

      declineGift: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) => (i.id === inviteId ? { ...i, status: 'gift_declined', remindAt: Date.now() + REMINDER_DELAY_MS } : i)),
        }));
      },

      markReminded: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) => (i.id === inviteId ? { ...i, reminded: true } : i)),
        }));
      },

      clearInvite: (inviteId) => {
        set((state) => ({ invites: state.invites.filter((i) => i.id !== inviteId) }));
      },

      clearAll: () => set({ invites: [] }),
    }),
    {
      name: 'pulse-event-invites',
      partialize: (state) => ({ invites: state.invites, pairsByEventId: state.pairsByEventId }),
    }
  )
);

export default useEventInvitesStore;
