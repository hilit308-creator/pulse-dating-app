/**
 * ImageGallery - Vertical Swipe Image Navigation (Instagram-style)
 * 
 * Per Spec Section 3:
 * - Vertical swipe inside card (Instagram-style)
 * - Subtle left/right arrows as visual hint
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Swipe threshold for changing images
const SWIPE_THRESHOLD = 50;

/**
 * ImageDots - Pagination dots indicator
 */
function ImageDots({ total, current, onChange }) {
  if (total <= 1) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 0.5,
        zIndex: 10,
      }}
    >
      {Array.from({ length: total }).map((_, index) => (
        <Box
          key={index}
          onClick={() => onChange?.(index)}
          sx={{
            width: current === index ? 16 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: current === index ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        />
      ))}
    </Box>
  );
}

/**
 * NavigationArrows - Subtle left/right arrows as visual hint
 */
function NavigationArrows({ onPrev, onNext, showPrev, showNext }) {
  return (
    <>
      {showPrev && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 32,
            height: 32,
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(4px)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
            '.image-gallery:hover &': {
              opacity: 1,
            },
          }}
        >
          <ChevronLeft size={18} color="#1a1a2e" />
        </IconButton>
      )}
      {showNext && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 32,
            height: 32,
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(4px)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
            '.image-gallery:hover &': {
              opacity: 1,
            },
          }}
        >
          <ChevronRight size={18} color="#1a1a2e" />
        </IconButton>
      )}
    </>
  );
}

/**
 * ImageGallery Component
 * 
 * @param {Object} props
 * @param {string[]} props.images - Array of image URLs
 * @param {string} props.alt - Alt text for images
 * @param {function} props.onImageChange - Called when image changes
 * @param {boolean} props.showArrows - Whether to show navigation arrows
 * @param {boolean} props.showDots - Whether to show pagination dots
 */
export default function ImageGallery({
  images = [],
  alt = 'Profile photo',
  onImageChange,
  showArrows = true,
  showDots = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoaded, setIsLoaded] = useState({});
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  const goToImage = useCallback((index) => {
    if (index < 0 || index >= images.length) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    onImageChange?.(index);
  }, [currentIndex, images.length, onImageChange]);

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      goToImage(currentIndex + 1);
    }
  }, [currentIndex, images.length, goToImage]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToImage(currentIndex - 1);
    }
  }, [currentIndex, goToImage]);

  // Handle vertical swipe
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
      if (deltaY > 0) {
        // Swipe up - next image
        goNext();
      } else {
        // Swipe down - previous image
        goPrev();
      }
    }
  }, [goNext, goPrev]);

  // Handle tap on left/right side
  const handleTap = useCallback((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Tap on left 30% - previous
    if (x < width * 0.3) {
      goPrev();
    }
    // Tap on right 30% - next
    else if (x > width * 0.7) {
      goNext();
    }
    // Middle 40% - no action (let parent handle tap)
  }, [goNext, goPrev]);

  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        No photos
      </Box>
    );
  }

  // Single image - no navigation needed
  if (images.length === 1) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={images[0]}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className="image-gallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-x',
      }}
    >
      {/* Pagination dots */}
      {showDots && (
        <ImageDots
          total={images.length}
          current={currentIndex}
          onChange={goToImage}
        />
      )}

      {/* Images with animation */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          custom={direction}
          initial={{ 
            opacity: 0,
            y: direction > 0 ? 50 : -50,
          }}
          animate={{ 
            opacity: 1,
            y: 0,
          }}
          exit={{ 
            opacity: 0,
            y: direction > 0 ? -50 : 50,
          }}
          transition={{
            duration: 0.25,
            ease: 'easeOut',
          }}
          onLoad={() => setIsLoaded(prev => ({ ...prev, [currentIndex]: true }))}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Loading skeleton */}
      {!isLoaded[currentIndex] && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
          }}
        />
      )}

      {/* Navigation arrows */}
      {showArrows && (
        <NavigationArrows
          onPrev={goPrev}
          onNext={goNext}
          showPrev={currentIndex > 0}
          showNext={currentIndex < images.length - 1}
        />
      )}

      {/* Keyframes for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </Box>
  );
}

export { ImageDots, NavigationArrows };
