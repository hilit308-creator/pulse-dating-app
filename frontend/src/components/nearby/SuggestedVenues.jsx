// SuggestedVenues.jsx
// Per spec: "The system never says where to go — it only narrows options."
// Venues are meeting facilitators, not destinations.
// Display is visual-first, ratings support trust not comparison shopping.

import React, { useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Coffee, Wine, Utensils, Music, TreePine } from 'lucide-react';

// Venue categories - neutral, low-pressure
const VENUE_CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'drinks', label: 'Drinks', icon: Wine },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'outdoors', label: 'Outdoors', icon: TreePine },
];

const PARTNER_PLAN_RANK = {
  platinum: 3,
  gold: 2,
  silver: 1,
  basic: 0,
};

function parseMinutes(text) {
  if (!text) return null;
  const str = String(text);
  const m = str.match(/(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function isOpeningSoon(venue, thresholdMinutes = 40) {
  if (venue?.isOpen) return false;
  const minutes = parseMinutes(venue?.opensIn);
  return typeof minutes === 'number' && minutes > 0 && minutes <= thresholdMinutes;
}

// Mock venues data - ordered per spec:
// 1. Paid partnerships (highest plan first)
// 2. Currently open venues
// 3. Venues opening soon (within ~40 minutes)
const MOCK_VENUES = [
  {
    id: 1,
    name: 'Café Levinsky',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&h=300&q=80',
    distance: '350m',
    walkTime: '4 min',
    rating: 4.7,
    pulseRating: 4.8,
    isOpen: true,
    openingSoon: false,
    isPaidPartner: true,
    partnerPlan: 'gold',
    vibe: 'Cozy & quiet',
  },
  {
    id: 2,
    name: 'The Alchemist',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&h=300&q=80',
    distance: '500m',
    walkTime: '6 min',
    rating: 4.5,
    pulseRating: 4.6,
    isOpen: true,
    openingSoon: false,
    isPaidPartner: true,
    partnerPlan: 'platinum',
    vibe: 'Lively atmosphere',
  },
  {
    id: 3,
    name: 'Garden Terrace',
    category: 'outdoors',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=300&q=80',
    distance: '200m',
    walkTime: '2 min',
    rating: 4.3,
    pulseRating: 4.5,
    isOpen: true,
    openingSoon: false,
    isPaidPartner: false,
    vibe: 'Fresh air & views',
  },
  {
    id: 4,
    name: 'Hummus Bar',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&h=300&q=80',
    distance: '450m',
    walkTime: '5 min',
    rating: 4.6,
    pulseRating: 4.4,
    isOpen: false,
    openingSoon: true,
    opensIn: '25 min',
    isPaidPartner: false,
    vibe: 'Casual & tasty',
  },
];

/**
 * VenueCard - Visual-first display per spec
 * Image + icon must communicate instantly, text is secondary
 */
function VenueCard({ venue, onSelect, isSelected }) {
  const CategoryIcon = VENUE_CATEGORIES.find(c => c.id === venue.category)?.icon || Coffee;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(venue)}
    >
      <Box
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: isSelected 
            ? '0 0 0 2px #6C5CE7, 0 8px 24px rgba(108,92,231,0.2)' 
            : '0 2px 12px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Image - visual first */}
        <Box sx={{ position: 'relative', height: 120 }}>
          <img
            src={venue.image}
            alt={venue.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Category icon overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CategoryIcon size={16} color="#6C5CE7" />
          </Box>
          {/* Partner badge - subtle */}
          {venue.isPaidPartner && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                px: 1,
                py: 0.25,
                borderRadius: 999,
                backgroundColor: 'rgba(108,92,231,0.9)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}>
                Featured
              </Typography>
            </Box>
          )}
          {/* Opening soon indicator */}
          {!venue.isOpen && venue.openingSoon && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 999,
                backgroundColor: 'rgba(245,158,11,0.9)',
              }}
            >
              <Clock size={12} color="#fff" />
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}>
                Opens in {venue.opensIn}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Info - minimal text */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.25 }}>
            {venue.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <MapPin size={12} color="#64748b" />
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {venue.walkTime}
              </Typography>
            </Box>
            {/* Pulse rating - community memory */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                {venue.pulseRating}
              </Typography>
            </Box>
          </Box>

          {/* Vibe - contextual relevance */}
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            {venue.vibe}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

/**
 * SuggestedVenues - Neutral venue suggestions
 * Per spec: "Translate 'we're talking' into 'we could meet' without asking the user to invent logistics"
 */
export default function SuggestedVenues({ onSelectVenue, selectedVenue }) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter venues by category
  const filteredVenues = activeCategory === 'all' 
    ? MOCK_VENUES 
    : MOCK_VENUES.filter(v => v.category === activeCategory);

  // Sort per spec:
  // 1) Paid partnerships (highest plan first)
  // 2) Currently open venues
  // 3) Opening soon (within ~40 minutes), soonest first
  const sortedVenues = [...filteredVenues]
    .map((v) => {
      const soon = isOpeningSoon(v, 40);
      return {
        ...v,
        openingSoon: soon,
      };
    })
    .sort((a, b) => {
      const aPartnerRank = a.isPaidPartner ? (PARTNER_PLAN_RANK[a.partnerPlan] ?? 0) : -1;
      const bPartnerRank = b.isPaidPartner ? (PARTNER_PLAN_RANK[b.partnerPlan] ?? 0) : -1;
      if (aPartnerRank !== bPartnerRank) return bPartnerRank - aPartnerRank;

      const aPaid = !!a.isPaidPartner;
      const bPaid = !!b.isPaidPartner;
      if (aPaid !== bPaid) return aPaid ? -1 : 1;

      const aOpen = !!a.isOpen;
      const bOpen = !!b.isOpen;
      if (aOpen !== bOpen) return aOpen ? -1 : 1;

      const aSoon = !!a.openingSoon;
      const bSoon = !!b.openingSoon;
      if (aSoon !== bSoon) return aSoon ? -1 : 1;

      if (aSoon && bSoon) {
        const aMin = parseMinutes(a.opensIn) ?? 999;
        const bMin = parseMinutes(b.opensIn) ?? 999;
        if (aMin !== bMin) return aMin - bMin;
      }

      return 0;
    });

  return (
    <Box>
      {/* Header - neutral tone */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
        Places to meet
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
        A few options if you'd like to meet up
      </Typography>

      {/* Category filters - neutral categories */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
        {VENUE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Chip
              key={cat.id}
              label={cat.label}
              icon={Icon ? <Icon size={14} /> : undefined}
              onClick={() => setActiveCategory(cat.id)}
              sx={{
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.8rem',
                ...(activeCategory === cat.id
                  ? {
                      backgroundColor: '#6C5CE7',
                      color: '#fff',
                      '& .MuiChip-icon': { color: '#fff' },
                    }
                  : {
                      backgroundColor: 'rgba(108,92,231,0.08)',
                      color: '#6C5CE7',
                      '& .MuiChip-icon': { color: '#6C5CE7' },
                    }),
              }}
            />
          );
        })}
      </Box>

      {/* Venues grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
        {sortedVenues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onSelect={onSelectVenue}
            isSelected={selectedVenue?.id === venue.id}
          />
        ))}
      </Box>

      {/* Reassurance - per spec: system doesn't decide */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 2,
          color: '#94a3b8',
          textAlign: 'center',
          fontSize: '0.75rem',
        }}
      >
        Just suggestions — you can meet anywhere you'd like
      </Typography>
    </Box>
  );
}
