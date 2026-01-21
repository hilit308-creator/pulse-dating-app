/**
 * Shared photo resolution utilities for consistent image handling across components.
 * Used by: UserCard, Today's Picks, Match modal
 */

// Default placeholder image when no photo is available
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=60';

/**
 * Resolves the primary photo URL for a user object.
 * Priority: primaryPhotoUrl > photoUrl > photos[0] > placeholder
 * 
 * @param {Object} user - User object with photo fields
 * @param {string} [placeholder] - Optional custom placeholder URL
 * @returns {string} The resolved photo URL (never empty/null)
 */
export function resolvePrimaryPhoto(user, placeholder = DEFAULT_PLACEHOLDER) {
  if (!user) return placeholder;
  
  // Check primaryPhotoUrl first
  if (user.primaryPhotoUrl && typeof user.primaryPhotoUrl === 'string' && user.primaryPhotoUrl.trim()) {
    return user.primaryPhotoUrl;
  }
  
  // Check photoUrl (alternative field name)
  if (user.photoUrl && typeof user.photoUrl === 'string' && user.photoUrl.trim()) {
    return user.photoUrl;
  }
  
  // Check photos array
  if (user.photos && Array.isArray(user.photos) && user.photos.length > 0) {
    const firstPhoto = user.photos[0];
    if (firstPhoto && typeof firstPhoto === 'string' && firstPhoto.trim()) {
      return firstPhoto;
    }
  }
  
  // Check base field (used in demo data)
  if (user.base && typeof user.base === 'string' && user.base.trim()) {
    return user.base;
  }
  
  // Return placeholder
  return placeholder;
}

/**
 * Resolves all photos for a user, ensuring at least one photo exists.
 * 
 * @param {Object} user - User object with photo fields
 * @param {string} [placeholder] - Optional custom placeholder URL
 * @returns {string[]} Array of photo URLs (never empty)
 */
export function resolveAllPhotos(user, placeholder = DEFAULT_PLACEHOLDER) {
  if (!user) return [placeholder];
  
  const photos = [];
  
  // Add primaryPhotoUrl if valid
  if (user.primaryPhotoUrl && typeof user.primaryPhotoUrl === 'string' && user.primaryPhotoUrl.trim()) {
    photos.push(user.primaryPhotoUrl);
  }
  
  // Add photos from array
  if (user.photos && Array.isArray(user.photos)) {
    user.photos.forEach(photo => {
      if (photo && typeof photo === 'string' && photo.trim() && !photos.includes(photo)) {
        photos.push(photo);
      }
    });
  }
  
  // Add photoUrl if not already included
  if (user.photoUrl && typeof user.photoUrl === 'string' && user.photoUrl.trim() && !photos.includes(user.photoUrl)) {
    photos.push(user.photoUrl);
  }
  
  // Ensure at least one photo
  if (photos.length === 0) {
    photos.push(placeholder);
  }
  
  return photos;
}

/**
 * Checks if a photo URL is valid (not empty, not a broken reference)
 * 
 * @param {string} url - Photo URL to validate
 * @returns {boolean} True if URL appears valid
 */
export function isValidPhotoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Basic URL validation
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
}

export default {
  resolvePrimaryPhoto,
  resolveAllPhotos,
  isValidPhotoUrl,
  DEFAULT_PLACEHOLDER,
};
