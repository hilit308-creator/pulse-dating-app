// src/adapters/chatAdapters.js
import { dedupePhotos } from '../utils/photos';

export function toProfile(storeProfile = {}) {
  const photos = dedupePhotos(storeProfile.photos || [storeProfile.photoUrl].filter(Boolean));
  return {
    id: storeProfile.id ?? storeProfile._id ?? String(Math.random()),
    name: storeProfile.name || storeProfile.displayName || 'Unknown',
    age: storeProfile.age,
    gender: storeProfile.gender,
    distanceKm: storeProfile.distance ?? storeProfile.distanceKm,
    city: storeProfile.city,
    profession: storeProfile.profession,
    tagline: storeProfile.tagline,
    interests: storeProfile.interests || [],
    aboutMe: storeProfile.aboutMe || [],
    lookingFor: storeProfile.lookingFor || [],
    photos,
    likesYou: Boolean(storeProfile.likesYou),
    photoUrl: photos[0],
  };
}

export function toBubble(storeMessage = {}) {
  return {
    id: storeMessage.id ?? storeMessage._id ?? Date.now(),
    from: storeMessage.from || (storeMessage.sender === 'me' ? 'me' : 'them'),
    type: storeMessage.type || 'text',
    text: storeMessage.text,
    imageUrl: storeMessage.imageUrl,
    audioUrl: storeMessage.audioUrl,
    durationMs: storeMessage.durationMs,
    timestamp: storeMessage.timestamp || Date.now(),
    status: storeMessage.status || 'sent',
    reactions: storeMessage.reactions || {},
    replyTo: storeMessage.replyTo,
    starred: Boolean(storeMessage.starred),
    edited: Boolean(storeMessage.edited),
  };
}
