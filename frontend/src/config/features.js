// src/config/features.js

const isProd = process.env.NODE_ENV === 'production';

export const features = {
  newSwipe: !isProd, // enabled in staging/dev
  lockChatsUntilNearby: true,
  matchConfetti: true,
};

export default features;
