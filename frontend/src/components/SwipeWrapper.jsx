/**
 * SwipeWrapper.jsx
 * Wraps content and provides horizontal swipe functionality for like/pass actions
 * Used with ProfileTimeline cards throughout the app
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Screen width for swipe calculations
const SCREEN_W = typeof window !== 'undefined' ? window.innerWidth : 400;
const SWIPE_THRESHOLD = 100; // 100px threshold for easier swiping

const SwipeWrapper = ({ children, onSwipeLeft, onSwipeRight, onOffsetChange }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipeRef = useRef(false);
  const containerRef = useRef(null);

  // Notify parent of offset changes for label display
  useEffect(() => {
    onOffsetChange?.(offsetX);
  }, [offsetX, onOffsetChange]);

  // Use effect to add global touch listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e) => {
      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startYRef.current = touch.clientY;
      isSwipeRef.current = false;
    };

    const onTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const deltaY = Math.abs(touch.clientY - startYRef.current);
      
      if (!isSwipeRef.current && (Math.abs(deltaX) > 15 || deltaY > 15)) {
        isSwipeRef.current = Math.abs(deltaX) > deltaY;
      }
      
      if (isSwipeRef.current) {
        e.preventDefault();
        setIsSwiping(true);
        setOffsetX(deltaX);
      }
    };

    const onTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const finalDeltaX = touch.clientX - startXRef.current;
      
      if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
        if (finalDeltaX > 0) {
          setOffsetX(SCREEN_W);
          setTimeout(() => {
            setOffsetX(0);
            setIsSwiping(false);
            onSwipeRight?.();
          }, 200);
        } else {
          setOffsetX(-SCREEN_W);
          setTimeout(() => {
            setOffsetX(0);
            setIsSwiping(false);
            onSwipeLeft?.();
          }, 200);
        }
      } else {
        setOffsetX(0);
        setIsSwiping(false);
      }
      isSwipeRef.current = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);

  // Handle mouse down on the overlay
  const handleOverlayMouseDown = useCallback((e) => {
    // Don't interfere with clicks on buttons or interactive elements
    // Use a more robust check that works with SVG elements
    let element = e.target;
    while (element && element !== containerRef.current) {
      // Check tagName (works for both HTML and SVG)
      const tagName = element.tagName?.toUpperCase();
      if (tagName === 'BUTTON' || tagName === 'SVG' || tagName === 'PATH' || tagName === 'A') {
        return;
      }
      // Check for MUI classes
      if (element.classList?.contains('MuiIconButton-root') || 
          element.classList?.contains('MuiButtonBase-root') ||
          element.getAttribute?.('role') === 'button') {
        return;
      }
      element = element.parentElement;
    }
    
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isSwipeRef.current = false;
    setIsSwiping(false);
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const deltaY = Math.abs(moveEvent.clientY - startYRef.current);
      
      if (!isSwipeRef.current && (Math.abs(deltaX) > 15 || deltaY > 15)) {
        isSwipeRef.current = Math.abs(deltaX) > deltaY;
      }
      
      if (isSwipeRef.current) {
        setIsSwiping(true);
        setOffsetX(deltaX);
      }
    };
    
    const handleMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      const finalDeltaX = upEvent.clientX - startXRef.current;
      
      if (Math.abs(finalDeltaX) > SWIPE_THRESHOLD) {
        if (finalDeltaX > 0) {
          setOffsetX(SCREEN_W);
          setTimeout(() => {
            setOffsetX(0);
            setIsSwiping(false);
            onSwipeRight?.();
          }, 200);
        } else {
          setOffsetX(-SCREEN_W);
          setTimeout(() => {
            setOffsetX(0);
            setIsSwiping(false);
            onSwipeLeft?.();
          }, 200);
        }
      } else {
        setOffsetX(0);
        setIsSwiping(false);
      }
      
      isSwipeRef.current = false;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onSwipeLeft, onSwipeRight]);

  // Calculate visual feedback
  const rotation = (offsetX / SCREEN_W) * 8;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleOverlayMouseDown}
      style={{
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        position: 'relative',
        width: '100%',
        cursor: isSwiping ? 'grabbing' : 'default',
      }}
    >
      {children}
    </div>
  );
};

// Swipe Labels component to be rendered at page level
export const SwipeLabels = ({ swipeOffset }) => {
  if (swipeOffset === 0) return null;
  
  return (
    <>
      {swipeOffset < 0 && (
        <Box 
          sx={{ 
            opacity: Math.min(1, Math.abs(swipeOffset) / 50), 
            position: 'fixed', 
            left: 40, 
            top: '50%', 
            transform: 'translateY(-50%) rotate(-15deg)', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: '4px solid #ef4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
            pointerEvents: 'none', 
            zIndex: 99999,
          }}
        >
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#ef4444', letterSpacing: 3 }}>NOPE</Typography>
        </Box>
      )}
      {swipeOffset > 0 && (
        <Box 
          sx={{ 
            opacity: Math.min(1, swipeOffset / 50), 
            position: 'fixed', 
            right: 40, 
            top: '50%', 
            transform: 'translateY(-50%) rotate(15deg)', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: '4px solid #22c55e', 
            backgroundColor: 'rgba(34, 197, 94, 0.2)', 
            pointerEvents: 'none', 
            zIndex: 99999,
          }}
        >
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#22c55e', letterSpacing: 3 }}>LIKE</Typography>
        </Box>
      )}
    </>
  );
};

export default SwipeWrapper;
