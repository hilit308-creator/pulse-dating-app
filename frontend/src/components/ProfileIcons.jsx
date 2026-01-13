/**
 * ProfileIcons - Default Icons Row for User Cards
 * 
 * Per Spec Section 3 - Line 2:
 * - Height
 * - Smoking (yes / no)
 * - Religion / belief level (only if user opted-in)
 * - Zodiac sign
 * - 1–2 main interests
 * 
 * Icons only, no text labels.
 */

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import {
  Ruler,
  Cigarette,
  CigaretteOff,
  Star,
  Heart,
  Music,
  Camera,
  Plane,
  Coffee,
  Book,
  Dumbbell,
  Palette,
  Film,
  Gamepad2,
  Dog,
  Utensils,
} from 'lucide-react';

// Zodiac signs with icons (using Star as base)
const ZODIAC_ICONS = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

// Interest to icon mapping
const INTEREST_ICONS = {
  music: Music,
  photography: Camera,
  travel: Plane,
  coffee: Coffee,
  reading: Book,
  fitness: Dumbbell,
  art: Palette,
  movies: Film,
  gaming: Gamepad2,
  pets: Dog,
  food: Utensils,
  default: Heart,
};

// Religion/belief icons (simplified)
const BELIEF_LEVELS = {
  very_religious: '🙏',
  somewhat_religious: '✡️',
  spiritual: '🕉️',
  not_religious: null, // Don't show
};

/**
 * Format height for display
 * @param {number} cm - Height in centimeters
 * @returns {string} Formatted height
 */
const formatHeight = (cm) => {
  if (!cm) return null;
  // Convert to feet/inches for US, keep cm for others
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}"`;
};

/**
 * IconWrapper - Consistent icon styling
 */
function IconWrapper({ children, tooltip, show = true }) {
  if (!show) return null;
  
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '8px',
          backgroundColor: 'rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

/**
 * ZodiacIcon - Display zodiac sign
 */
function ZodiacIcon({ sign }) {
  if (!sign || !ZODIAC_ICONS[sign.toLowerCase()]) return null;
  
  return (
    <IconWrapper tooltip={sign.charAt(0).toUpperCase() + sign.slice(1)}>
      <Box
        component="span"
        sx={{
          fontSize: '14px',
          lineHeight: 1,
        }}
      >
        {ZODIAC_ICONS[sign.toLowerCase()]}
      </Box>
    </IconWrapper>
  );
}

/**
 * HeightIcon - Display height
 */
function HeightIcon({ heightCm }) {
  if (!heightCm) return null;
  
  return (
    <IconWrapper tooltip={`${heightCm}cm (${formatHeight(heightCm)})`}>
      <Ruler size={14} color="#64748b" />
    </IconWrapper>
  );
}

/**
 * SmokingIcon - Display smoking status
 */
function SmokingIcon({ smokes }) {
  if (smokes === null || smokes === undefined) return null;
  
  return (
    <IconWrapper tooltip={smokes ? 'Smokes' : 'Non-smoker'}>
      {smokes ? (
        <Cigarette size={14} color="#64748b" />
      ) : (
        <CigaretteOff size={14} color="#64748b" />
      )}
    </IconWrapper>
  );
}

/**
 * BeliefIcon - Display religion/belief level (only if opted-in)
 */
function BeliefIcon({ beliefLevel, showBelief = false }) {
  if (!showBelief || !beliefLevel || !BELIEF_LEVELS[beliefLevel]) return null;
  
  return (
    <IconWrapper tooltip={beliefLevel.replace(/_/g, ' ')}>
      <Box
        component="span"
        sx={{
          fontSize: '12px',
          lineHeight: 1,
        }}
      >
        {BELIEF_LEVELS[beliefLevel]}
      </Box>
    </IconWrapper>
  );
}

/**
 * InterestIcon - Display interest icon
 */
function InterestIcon({ interest }) {
  if (!interest) return null;
  
  const IconComponent = INTEREST_ICONS[interest.toLowerCase()] || INTEREST_ICONS.default;
  
  return (
    <IconWrapper tooltip={interest}>
      <IconComponent size={14} color="#6C5CE7" />
    </IconWrapper>
  );
}

/**
 * ProfileIconsRow - Main component for displaying profile icons
 * 
 * @param {Object} props
 * @param {number} props.heightCm - Height in centimeters
 * @param {boolean} props.smokes - Smoking status
 * @param {string} props.beliefLevel - Religion/belief level
 * @param {boolean} props.showBelief - Whether user opted to show belief
 * @param {string} props.zodiacSign - Zodiac sign
 * @param {string[]} props.interests - Array of interests (max 2 shown)
 */
export default function ProfileIconsRow({
  heightCm,
  smokes,
  beliefLevel,
  showBelief = false,
  zodiacSign,
  interests = [],
}) {
  const displayInterests = interests.slice(0, 2);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        flexWrap: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <HeightIcon heightCm={heightCm} />
      <SmokingIcon smokes={smokes} />
      <BeliefIcon beliefLevel={beliefLevel} showBelief={showBelief} />
      <ZodiacIcon sign={zodiacSign} />
      {displayInterests.map((interest, index) => (
        <InterestIcon key={index} interest={interest} />
      ))}
    </Box>
  );
}

// Export individual components for flexibility
export {
  HeightIcon,
  SmokingIcon,
  BeliefIcon,
  ZodiacIcon,
  InterestIcon,
  IconWrapper,
  ZODIAC_ICONS,
  INTEREST_ICONS,
};
