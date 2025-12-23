import { create } from 'zustand';

const STORAGE_KEY = 'add_event_draft_v1';

const defaultState = {
  basic: {
    title: '',
    shortDescription: '',
    fullDescription: '',
    tags: [],
    coverUrl: '',
    type: 'physical', // physical | online | hybrid
    visibility: 'public', // public | unlisted | private
    size: 'small', // small | medium | large | private
  },
  schedule: {
    timezone: 'Asia/Jerusalem',
    startAt: '',
    endAt: '',
    locationText: '',
    isOnline: false,
    onlineLink: '',
    entryRules: '',
  },
  capacity: {
    maxCapacity: 50,
    showCounter: true,
    registrationType: 'free', // free | paid | donation
    registrationDeadline: '',
  },
  tickets: [
    // { id: 't1', name: 'General', price: 0, inventory: 50, perUserLimit: 2, saleStart: '', saleEnd: '', refundPolicy: 'none' }
  ],
  payments: {
    methods: ['in_app'], // in_app | bit | other
    bit: { businessName: '', businessNumber: '', description: '' },
  },
  audience: {
    recommendedAge: [21, 45],
    genderPref: 'user_pref', // user_pref | men_only | women_only | mixed
    requireVerifiedPhoto: false,
  },
  policies: {
    communityRules: '',
    emergencyContact: '',
  },
  publishing: {
    status: 'draft', // draft | pending | published | suspended
  },
};

function deepMerge(defaults, incoming) {
  if (!incoming || typeof incoming !== 'object') return defaults;
  const out = Array.isArray(defaults) ? [...defaults] : { ...defaults };
  for (const k of Object.keys(defaults)) {
    const dv = defaults[k];
    const iv = incoming[k];
    if (Array.isArray(dv)) {
      out[k] = Array.isArray(iv) ? iv : dv;
    } else if (dv && typeof dv === 'object') {
      out[k] = deepMerge(dv, iv || {});
    } else {
      out[k] = iv !== undefined ? iv : dv;
    }
  }
  return out;
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    // Deep-merge section by section to preserve defaults
    return {
      basic: deepMerge(defaultState.basic, parsed.basic || {}),
      schedule: deepMerge(defaultState.schedule, parsed.schedule || {}),
      capacity: deepMerge(defaultState.capacity, parsed.capacity || {}),
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : defaultState.tickets,
      payments: deepMerge(defaultState.payments, parsed.payments || {}),
      audience: deepMerge(defaultState.audience, parsed.audience || {}),
      policies: deepMerge(defaultState.policies, parsed.policies || {}),
      publishing: deepMerge(defaultState.publishing, parsed.publishing || {}),
    };
  } catch {
    return defaultState;
  }
}

export const useEventForm = create((set, get) => ({
  ...loadDraft(),
  reset: () => set(defaultState),
  setField: (section, key, value) =>
    set((state) => ({ [section]: { ...state[section], [key]: value } })),
  setSection: (section, payload) => set((state) => ({ [section]: { ...state[section], ...payload } })),

  // tickets
  addTicket: () =>
    set((state) => ({
      tickets: [
        ...state.tickets,
        {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `t_${Math.random().toString(36).slice(2)}`,
          name: 'General',
          price: state.capacity.registrationType === 'paid' ? 50 : 0,
          inventory: Math.max(1, Number(state.capacity.maxCapacity) || 1),
          perUserLimit: 2,
          saleStart: '',
          saleEnd: '',
          refundPolicy: 'none',
        },
      ],
    })),
  updateTicket: (id, patch) =>
    set((state) => ({ tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  removeTicket: (id) => set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) })),

  // save draft
  saveDraft: () => {
    const data = get();
    const snapshot = {
      basic: data.basic,
      schedule: data.schedule,
      capacity: data.capacity,
      tickets: data.tickets,
      payments: data.payments,
      audience: data.audience,
      policies: data.policies,
      publishing: data.publishing,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  },

  // validations (lightweight)
  validate: () => {
    const errors = {};
    const { basic, schedule, capacity, tickets } = get();

    if (!basic.title || basic.title.length > 60) errors.title = 'Event Name is required (≤60 chars)';
    if (!basic.coverUrl) errors.coverUrl = 'Cover image is required';
    if (!schedule.startAt) errors.startAt = 'Start date/time required';
    if (schedule.endAt && schedule.startAt && new Date(schedule.endAt) < new Date(schedule.startAt)) {
      errors.endAt = 'End must be after start';
    }
    if (!capacity.maxCapacity || capacity.maxCapacity < 1 || capacity.maxCapacity > 10000) {
      errors.maxCapacity = 'Capacity must be 1–10,000';
    }
    if (capacity.registrationType !== 'free') {
      const sumQty = (tickets || []).reduce((s, t) => s + Number(t.inventory || 0), 0);
      if (sumQty > Number(capacity.maxCapacity || 0)) {
        errors.tickets = 'Sum of ticket inventories cannot exceed max capacity';
      }
    }
    return errors;
  },
}));

// Auto-save middleware: persist changes after each set
useEventForm.subscribe((state) => {
  try {
    const snapshot = {
      basic: state.basic,
      schedule: state.schedule,
      capacity: state.capacity,
      tickets: state.tickets,
      payments: state.payments,
      audience: state.audience,
      policies: state.policies,
      publishing: state.publishing,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
});
