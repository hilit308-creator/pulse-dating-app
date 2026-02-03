import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const NEARBY_SCAN_MIN_INTERVAL_MS = 10 * 60 * 1000;
export const NEARBY_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const STORE_VERSION = 1;

const useNearbyPeopleStore = create(
  persist(
    (set, get) => ({
      scanByViewer: {},
      exposureByViewer: {},

      getScan: (viewerId) => {
        const state = get();
        return state.scanByViewer?.[viewerId] || null;
      },

      setScan: (viewerId, { lastScanAt, radiusMeters, results }) =>
        set((state) => ({
          scanByViewer: {
            ...(state.scanByViewer || {}),
            [viewerId]: {
              lastScanAt: typeof lastScanAt === 'number' ? lastScanAt : Date.now(),
              lastRadiusMeters: radiusMeters,
              minIntervalMs: state.scanByViewer?.[viewerId]?.minIntervalMs,
              results: Array.isArray(results) ? results : [],
            },
          },
        })),

      setMinIntervalMs: (viewerId, minIntervalMs) =>
        set((state) => ({
          scanByViewer: {
            ...(state.scanByViewer || {}),
            [viewerId]: {
              ...(state.scanByViewer?.[viewerId] || {}),
              minIntervalMs,
            },
          },
        })),

      markShown: (viewerId, candidateId, ts = Date.now()) =>
        set((state) => {
          const exposureByViewer = state.exposureByViewer || {};
          const viewerExposure = exposureByViewer[viewerId] || {};
          const prev = viewerExposure[candidateId] || {};
          return {
            exposureByViewer: {
              ...exposureByViewer,
              [viewerId]: {
                ...viewerExposure,
                [candidateId]: {
                  ...prev,
                  lastShownAt: ts,
                },
              },
            },
          };
        }),

      markInteracted: (viewerId, candidateId, ts = Date.now()) =>
        set((state) => {
          const exposureByViewer = state.exposureByViewer || {};
          const viewerExposure = exposureByViewer[viewerId] || {};
          const prev = viewerExposure[candidateId] || {};
          return {
            exposureByViewer: {
              ...exposureByViewer,
              [viewerId]: {
                ...viewerExposure,
                [candidateId]: {
                  ...prev,
                  hasInteracted: true,
                  interactionAt: ts,
                },
              },
            },
          };
        }),

      isSuppressed: (viewerId, candidateId, now = Date.now()) => {
        const state = get();
        const viewerExposure = state.exposureByViewer?.[viewerId] || {};
        const record = viewerExposure?.[candidateId];
        if (!record?.lastShownAt) return false;

        if (record?.hasInteracted) return false;

        const lastShownAt = record.lastShownAt;
        return now - lastShownAt < NEARBY_COOLDOWN_MS;
      },
    }),
    {
      name: 'pulse-nearby-people-store',
      version: STORE_VERSION,
      migrate: (persistedState) => persistedState,
      partialize: (state) => ({
        scanByViewer: state.scanByViewer,
        exposureByViewer: state.exposureByViewer,
      }),
    }
  )
);

export default useNearbyPeopleStore;
