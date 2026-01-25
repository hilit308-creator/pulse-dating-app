// ExploreScreen.jsx — Pulse Explore Page
// "לאן שווה לצאת עכשיו?"
// Places worth stepping into - real-time discovery

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CardMedia,
  Skeleton,
  Tooltip,
  TextField,
  Avatar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  QrCode,
  Gift,
  Sparkles,
  Music,
  Coffee,
  Wine,
  Users,
  Zap,
  Star,
  ChevronRight,
  X,
  Heart,
  MessageCircle,
  Send,
  Flower2,
  Check,
  TreePine,
  Palette,
  Calendar,
  CreditCard,
  Trash2,
  Disc,
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import useGestureMessagesStore from '../store/gestureMessagesStore';
import { demoMatches } from './MatchesScreen';

/* =========================
   Constants
   ========================= */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Filter categories - organized in two rows
const FILTER_CATEGORIES_ROW1 = [
  { id: 'all', labelKey: 'allPlaces', icon: Sparkles },
  { id: 'saved', labelKey: 'saved', icon: Bookmark },
  { id: 'near-me', labelKey: 'nearMe', icon: MapPin },
  { id: 'my-workshops', labelKey: 'myWorkshops', icon: Calendar },
];
const FILTER_CATEGORIES_ROW2 = [
  { id: 'cafe', labelKey: 'cafes', icon: Coffee },
  { id: 'bar', labelKey: 'bars', icon: Wine },
  { id: 'live-music', labelKey: 'liveMusic', icon: Music },
  { id: 'dance', labelKey: 'dance', icon: Disc },
  { id: 'nature', labelKey: 'nature', icon: TreePine },
  { id: 'workshops', labelKey: 'workshops', icon: Palette },
  { id: 'chill', labelKey: 'chill', icon: Star },
];

// Vibe icons mapping
const VIBE_ICONS = {
  chill: { icon: '🌙', label: 'Chill vibes' },
  social: { icon: '👥', label: 'Social' },
  dance: { icon: '💃', label: 'Dance' },
  live: { icon: '🎵', label: 'Live music' },
  romantic: { icon: '🕯️', label: 'Romantic' },
  energetic: { icon: '⚡', label: 'Energetic' },
};

// Mock nearby people for Sweet Gestures
const NEARBY_PEOPLE = [
  {
    id: 1,
    name: "Dana",
    distance: 197,
    unit: "m",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 2,
    name: "Tom",
    distance: 599,
    unit: "m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 3,
    name: "Sarah",
    distance: 1.0,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    isOnline: false,
  },
  {
    id: 4,
    name: "Alex",
    distance: 1.2,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 5,
    name: "Maya",
    distance: 1.5,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
];

// Gesture types for Sweet Gestures
const GESTURE_TYPES = [
  {
    id: 'coffee',
    label: 'Send Coffee',
    icon: Coffee,
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #8b7bea 100%)',
    shadowColor: 'rgba(108, 92, 231, 0.4)',
  },
  {
    id: 'flower',
    label: 'Send Flower',
    icon: Flower2,
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #8b7bea 100%)',
    shadowColor: 'rgba(108, 92, 231, 0.4)',
  },
  {
    id: 'note',
    label: 'Send Note',
    icon: Gift,
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #8b7bea 100%)',
    shadowColor: 'rgba(108, 92, 231, 0.4)',
  },
  {
    id: 'hi',
    label: 'Say Hi',
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
  },
];

// Mock places data (10-20 places only)
// hasEvents indicates if place has upcoming events (matches MOCK_BUSINESSES in BusinessPage.jsx)
const MOCK_PLACES = [
  {
    id: 1,
    name: "Kuli Alma",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'dance', 'live'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "03:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Happy Hour Extended",
      description: "1+1 on all cocktails until midnight",
      expiresAt: "23:59",
    },
    isNew: false,
    description: "One of Tel Aviv's most iconic nightlife spots. Kuli Alma combines art, music, and nightlife in a unique underground space. Known for eclectic DJ sets, live performances, and a vibrant crowd.",
    pulseRating: 4.7,
    pulseReviews: 234,
  },
  {
    id: 2,
    name: "Cafe Nordoy",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'romantic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "01:00",
    hasActiveBenefit: false,
    hasEvents: false,
    benefit: null,
    isNew: true,
    description: "A charming neighborhood cafe with vintage vibes. Perfect for brunch, coffee dates, or working on your laptop. Known for excellent pastries and a cozy atmosphere.",
    pulseRating: 4.6,
    pulseReviews: 178,
  },
  {
    id: 3,
    name: "The Block",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['dance', 'energetic', 'live'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "05:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Free Entry",
      description: "Show your Pulse app for free entry before 23:00",
      expiresAt: "23:00",
    },
    isNew: false,
    description: "Tel Aviv's premier techno club. A massive warehouse space with world-class sound system and international DJs. The place to be for serious electronic music lovers.",
    pulseRating: 4.8,
    pulseReviews: 312,
  },
  {
    id: 4,
    name: "Cafelix",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'social'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "00:00",
    hasActiveBenefit: true,
    hasEvents: false,
    benefit: {
      title: "Drink on the house",
      description: "Free espresso with any pastry",
      expiresAt: "18:00",
    },
    isNew: false,
    description: "Specialty coffee roasters with a passion for quality. Try their signature cold brew or enjoy a freshly baked pastry. A favorite among local coffee enthusiasts.",
    pulseRating: 4.5,
    pulseReviews: 145,
  },
  {
    id: 5,
    name: "Sputnik",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'chill'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "02:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    description: "A laid-back neighborhood bar with a retro Soviet theme. Great cocktails, friendly atmosphere, and perfect for casual dates or catching up with friends.",
    pulseRating: 4.4,
    pulseReviews: 98,
  },
  {
    id: 6,
    name: "Pastel",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    category: "live-music",
    vibes: ['live', 'romantic', 'chill'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "20:00",
    closingTime: "02:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: true,
    description: "An intimate live music venue with a romantic atmosphere. Features jazz, acoustic sets, and singer-songwriters. Perfect for a cultured date night with great food and wine.",
    pulseRating: 4.7,
    pulseReviews: 167,
  },
  {
    id: 7,
    name: "Beit Maariv",
    image: "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['dance', 'social', 'energetic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "04:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "1+1 Drinks",
      description: "Buy one get one free on all beers",
      expiresAt: "22:00",
    },
    isNew: false,
    description: "A legendary Tel Aviv nightclub in a historic building. Multiple floors with different music styles, from house to hip-hop. Always packed with a fun, diverse crowd.",
    pulseRating: 4.5,
    pulseReviews: 289,
  },
  {
    id: 8,
    name: "Anna Loulou",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    category: "live-music",
    vibes: ['live', 'social', 'chill'],
    location: "Jaffa",
    openNow: true,
    closingTime: "03:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    description: "A bohemian bar and live music venue in the heart of Jaffa. Eclectic performances from local and international artists. Great for discovering new music in an intimate setting.",
    pulseRating: 4.6,
    pulseReviews: 134,
  },
  {
    id: 9,
    name: "Teder.fm",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'chill', 'live'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "19:00",
    closingTime: "02:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Welcome Drink",
      description: "Free welcome shot for Pulse users",
      expiresAt: "21:00",
    },
    isNew: false,
    description: "An outdoor urban garden bar with a radio station vibe. Live broadcasts, DJ sets, and a relaxed atmosphere under string lights. Perfect for summer evenings.",
    pulseRating: 4.6,
    pulseReviews: 201,
  },
  {
    id: 10,
    name: "Spicehaus",
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'romantic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "23:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: true,
    description: "A cozy cafe with Middle Eastern influences and aromatic spices. Known for their unique coffee blends and homemade pastries. Great for a quiet, romantic afternoon.",
    pulseRating: 4.5,
    pulseReviews: 87,
  },
  // Nature & Parks - Real curated places
  {
    id: 11,
    name: "Yarkon Park",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    category: "nature",
    vibes: ['chill', 'romantic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "22:00",
    hasActiveBenefit: true,
    hasEvents: false,
    benefit: {
      title: "Boat Rental Discount",
      description: "20% off paddle boats for couples",
      expiresAt: "18:00",
    },
    isNew: false,
    googleRating: 4.5,
    pulseRating: 4.8,
    pulseReviews: 127,
    natureDetails: {
      about: "Tel Aviv's largest urban park stretching along the Yarkon River. Perfect for romantic walks, picnics, and outdoor activities. Features beautiful gardens, a tropical garden, and rock garden.",
      trails: [
        { name: "River Walk", distance: "3.5 km", difficulty: "Easy", duration: "1 hour", description: "Scenic path along the Yarkon River with shaded areas" },
        { name: "Botanical Loop", distance: "2 km", difficulty: "Easy", duration: "45 min", description: "Walk through the tropical and rock gardens" },
      ],
      equipment: ["Comfortable walking shoes", "Sunscreen", "Water bottle", "Picnic blanket"],
      entryFee: { free: true, note: "Free entry. Boat rentals and activities cost extra." },
      bestTime: "Morning or late afternoon",
      facilities: ["Restrooms", "Cafes", "Boat rentals", "Bike rentals", "Playgrounds"],
    },
  },
  {
    id: 12,
    name: "Carmel Beach Promenade",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    category: "nature",
    vibes: ['romantic', 'chill'],
    location: "Haifa",
    openNow: true,
    closingTime: "00:00",
    hasActiveBenefit: false,
    hasEvents: false,
    benefit: null,
    isNew: false,
    googleRating: 4.7,
    pulseRating: 4.9,
    pulseReviews: 89,
    natureDetails: {
      about: "Beautiful Mediterranean beach promenade with stunning sunset views. The perfect spot for a romantic evening walk along the sea with cafes and restaurants nearby.",
      trails: [
        { name: "Beach Promenade", distance: "2.5 km", difficulty: "Easy", duration: "45 min", description: "Flat coastal walk with sea views and beach access" },
        { name: "Carmel Cliffs Path", distance: "4 km", difficulty: "Moderate", duration: "1.5 hours", description: "Scenic trail along the cliffs above the beach" },
      ],
      equipment: ["Comfortable sandals or walking shoes", "Swimsuit", "Towel", "Sunscreen", "Light jacket for evening"],
      entryFee: { free: true, note: "Free access to beach and promenade" },
      bestTime: "Sunset hours for the best views",
      facilities: ["Restrooms", "Showers", "Beach chairs rental", "Restaurants", "Parking"],
    },
  },
  {
    id: 13,
    name: "Ein Gedi Nature Reserve",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    category: "nature",
    vibes: ['romantic', 'chill'],
    location: "Dead Sea",
    openNow: true,
    closingTime: "17:00",
    hasActiveBenefit: true,
    hasEvents: false,
    benefit: {
      title: "Couples Entry",
      description: "2 for 1 entry with Pulse app",
      expiresAt: "15:00",
    },
    isNew: true,
    googleRating: 4.8,
    pulseRating: 4.7,
    pulseReviews: 203,
    natureDetails: {
      about: "A desert oasis with stunning waterfalls and natural pools. Home to ibex, hyrax, and diverse wildlife. One of Israel's most beautiful nature reserves, where King David once hid from Saul.",
      trails: [
        { name: "Nahal David Short Trail", distance: "1.5 km", difficulty: "Easy", duration: "1 hour", description: "To David's Waterfall - the most popular trail with a refreshing waterfall" },
        { name: "Nahal David Full Trail", distance: "4 km", difficulty: "Moderate", duration: "2-3 hours", description: "Includes Dodim Cave and upper waterfalls" },
        { name: "Nahal Arugot Trail", distance: "6 km", difficulty: "Moderate", duration: "3-4 hours", description: "Hidden waterfall trail, less crowded and more adventurous" },
        { name: "Dry Canyon Trail", distance: "2 km", difficulty: "Challenging", duration: "2 hours", description: "Dramatic canyon with ladders and climbing sections" },
      ],
      equipment: ["Hiking shoes (water-resistant)", "Hat", "Sunscreen", "2+ liters of water per person", "Swimsuit for waterfalls", "Snacks"],
      entryFee: { free: false, adult: 29, child: 15, note: "Entry fee required. Combo tickets available with nearby attractions." },
      bestTime: "Early morning to avoid crowds and heat",
      facilities: ["Visitor center", "Restrooms", "Snack bar", "Parking", "Lockers"],
    },
  },
  {
    id: 14,
    name: "Rothschild Boulevard Gardens",
    image: "https://images.unsplash.com/photo-1476673160081-cf065607f449?auto=format&fit=crop&w=800&q=80",
    category: "nature",
    vibes: ['social', 'chill'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "23:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    googleRating: 4.4,
    pulseRating: 4.6,
    pulseReviews: 156,
    natureDetails: {
      about: "Tel Aviv's most iconic boulevard, lined with Bauhaus buildings and shaded by ficus trees. Perfect for a cultural stroll with cafes, kiosks, and street performers along the way.",
      trails: [
        { name: "Boulevard Walk", distance: "2 km", difficulty: "Easy", duration: "30-45 min", description: "Flat walk along the tree-lined boulevard from Habima to Neve Tzedek" },
        { name: "Bauhaus Architecture Tour", distance: "3 km", difficulty: "Easy", duration: "1.5 hours", description: "Self-guided tour of UNESCO World Heritage Bauhaus buildings" },
      ],
      equipment: ["Comfortable walking shoes", "Camera for architecture photos", "Water bottle"],
      entryFee: { free: true, note: "Free public space, open 24/7" },
      bestTime: "Late afternoon or evening for best atmosphere",
      facilities: ["Cafes & kiosks", "Public benches", "Bike rental stations", "Restrooms in cafes"],
    },
  },
  {
    id: 15,
    name: "Gan Meir Park",
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
    category: "nature",
    vibes: ['chill', 'social'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "22:00",
    hasActiveBenefit: false,
    hasEvents: false,
    benefit: null,
    isNew: false,
    googleRating: 4.3,
    pulseRating: 4.5,
    pulseReviews: 78,
    natureDetails: {
      about: "A charming urban park in the heart of Tel Aviv, known for its inclusive atmosphere and beautiful gardens. Features a dog park, playground, and is surrounded by cafes and restaurants.",
      trails: [
        { name: "Park Loop", distance: "0.8 km", difficulty: "Easy", duration: "15-20 min", description: "Relaxed walk around the park's paths and gardens" },
      ],
      equipment: ["Comfortable shoes", "Picnic supplies", "Book or games"],
      entryFee: { free: true, note: "Free public park" },
      bestTime: "Afternoon or early evening",
      facilities: ["Dog park", "Playground", "Public restrooms", "Nearby cafes", "Shaded seating areas"],
    },
  },
  // Couples Workshops
  {
    id: 16,
    name: "Pottery Together",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    category: "workshops",
    vibes: ['romantic', 'chill'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "18:00",
    closingTime: "21:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Date Night Special",
      description: "15% off couples pottery class",
      expiresAt: "20:00",
    },
    isNew: true,
    isWorkshop: true,
    workshopDetails: {
      date: "2026-01-26",
      time: "18:00",
      duration: "2.5 hours",
      price: 280,
      spotsLeft: 4,
      maxCouples: 8,
      includes: ["All materials", "Wine & snacks", "Take home your creation"],
      availableDates: [
        { date: "2026-01-26", time: "18:00", spotsLeft: 4 },
        { date: "2026-01-28", time: "18:00", spotsLeft: 6 },
        { date: "2026-02-02", time: "18:00", spotsLeft: 8 },
        { date: "2026-02-05", time: "19:00", spotsLeft: 3 },
      ],
    },
    googleRating: 4.9,
    pulseRating: 4.9,
    pulseReviews: 67,
  },
  {
    id: 17,
    name: "Cooking Class for Two",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    category: "workshops",
    vibes: ['social', 'romantic'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "19:00",
    closingTime: "22:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    isWorkshop: true,
    workshopDetails: {
      date: "2026-01-27",
      time: "19:00",
      duration: "3 hours",
      price: 350,
      spotsLeft: 2,
      maxCouples: 6,
      includes: ["Italian cuisine", "Wine pairing", "Recipe booklet"],
      availableDates: [
        { date: "2026-01-27", time: "19:00", spotsLeft: 2 },
        { date: "2026-01-30", time: "19:00", spotsLeft: 5 },
        { date: "2026-02-03", time: "19:00", spotsLeft: 6 },
      ],
    },
    googleRating: 4.8,
    pulseRating: 4.7,
    pulseReviews: 94,
  },
  {
    id: 18,
    name: "Wine & Paint Night",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
    category: "workshops",
    vibes: ['romantic', 'chill'],
    location: "Herzliya",
    openNow: false,
    opensAt: "20:00",
    closingTime: "23:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Pulse Exclusive",
      description: "Free bottle of wine for Pulse couples",
      expiresAt: "21:00",
    },
    isNew: true,
    isWorkshop: true,
    workshopDetails: {
      date: "2026-01-28",
      time: "20:00",
      duration: "2 hours",
      price: 220,
      spotsLeft: 6,
      maxCouples: 10,
      includes: ["Canvas & paints", "2 glasses of wine", "Light snacks"],
      availableDates: [
        { date: "2026-01-28", time: "20:00", spotsLeft: 6 },
        { date: "2026-01-31", time: "20:00", spotsLeft: 8 },
        { date: "2026-02-04", time: "20:00", spotsLeft: 10 },
        { date: "2026-02-07", time: "19:00", spotsLeft: 5 },
      ],
    },
    googleRating: 4.6,
    pulseRating: 4.8,
    pulseReviews: 52,
  },
  {
    id: 19,
    name: "Couples Yoga Retreat",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    category: "workshops",
    vibes: ['chill', 'romantic'],
    location: "Jaffa",
    openNow: false,
    opensAt: "07:00",
    closingTime: "09:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    isWorkshop: true,
    workshopDetails: {
      date: "2026-01-29",
      time: "07:00",
      duration: "2 hours",
      price: 180,
      spotsLeft: 8,
      maxCouples: 12,
      includes: ["Yoga mats", "Healthy breakfast", "Beach view"],
      availableDates: [
        { date: "2026-01-29", time: "07:00", spotsLeft: 8 },
        { date: "2026-02-01", time: "07:00", spotsLeft: 10 },
        { date: "2026-02-05", time: "07:00", spotsLeft: 12 },
      ],
    },
    googleRating: 4.7,
    pulseRating: 4.6,
    pulseReviews: 41,
  },
  {
    id: 20,
    name: "Chocolate Making Workshop",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80",
    category: "workshops",
    vibes: ['romantic', 'social'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "17:00",
    closingTime: "20:00",
    hasActiveBenefit: true,
    hasEvents: true,
    benefit: {
      title: "Sweet Deal",
      description: "Extra chocolate box to take home",
      expiresAt: "18:00",
    },
    isNew: false,
    isWorkshop: true,
    workshopDetails: {
      date: "2026-01-30",
      time: "17:00",
      duration: "2.5 hours",
      price: 260,
      spotsLeft: 3,
      maxCouples: 8,
      includes: ["Premium chocolate", "Champagne toast", "Gift box"],
      availableDates: [
        { date: "2026-01-30", time: "17:00", spotsLeft: 3 },
        { date: "2026-02-02", time: "17:00", spotsLeft: 6 },
        { date: "2026-02-06", time: "17:00", spotsLeft: 8 },
      ],
    },
    googleRating: 4.9,
    pulseRating: 5.0,
    pulseReviews: 38,
  },
  // Community-added places (isCommunityAdded: true)
  {
    id: 21,
    name: "Secret Garden Cafe",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['romantic', 'chill'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "22:00",
    hasActiveBenefit: false,
    hasEvents: false,
    benefit: null,
    isNew: false,
    isCommunityAdded: true,
    pulseRating: 4.9,
    pulseReviews: 23,
  },
  {
    id: 22,
    name: "Moonlight Dance Studio",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=800&q=80",
    category: "dance",
    vibes: ['romantic', 'social', 'dance'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "18:00",
    closingTime: "23:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    isCommunityAdded: true,
    pulseRating: 4.8,
    pulseReviews: 45,
  },
  {
    id: 23,
    name: "Rooftop Sunset Bar",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['romantic', 'chill'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "02:00",
    hasActiveBenefit: false,
    hasEvents: false,
    benefit: null,
    isNew: false,
    isCommunityAdded: true,
    pulseRating: 4.7,
    pulseReviews: 67,
  },
  {
    id: 24,
    name: "Hidden Jazz Club",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=800&q=80",
    category: "live-music",
    vibes: ['romantic', 'chill', 'live'],
    location: "Jaffa",
    openNow: false,
    opensAt: "20:00",
    closingTime: "01:00",
    hasActiveBenefit: false,
    hasEvents: true,
    benefit: null,
    isNew: false,
    isCommunityAdded: true,
    pulseRating: 4.6,
    pulseReviews: 31,
  },
];

/* =========================
   PlaceCard Component
   ========================= */
function PlaceCard({ place, onViewPlace, onSave, onScanQR, onSeeBenefits, isSaved, onRemove, showRemoveButton }) {
  const openStatus = place.openNow 
    ? `Open now · until ${place.closingTime}`
    : `Opens at ${place.opensAt}`;
  
  const isClosingSoon = place.openNow && 
    parseInt(place.closingTime) <= 2 && 
    parseInt(place.closingTime) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          mb: 2,
          position: 'relative',
        }}
      >
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 1 }}>
          {place.hasActiveBenefit && (
            <Chip
              icon={<Gift size={14} />}
              label="Perk"
              size="small"
              sx={{
                bgcolor: 'rgba(108,92,231,0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
          {place.isNew && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: 'rgba(108,92,231,0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
          {place.isCommunityAdded && (
            <Tooltip 
              title={
                <Box sx={{ p: 0.5, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.5, color: '#6C5CE7' }}>
                    💜 Pulse Pick
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                    Recommended by the Pulse community as a great date spot.
                  </Typography>
                </Box>
              }
              arrow
              enterTouchDelay={0}
              leaveTouchDelay={3000}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    px: 1.5,
                    py: 1,
                    maxWidth: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(108,92,231,0.2)',
                  },
                },
                arrow: {
                  sx: {
                    color: '#fff',
                    '&::before': {
                      border: '1px solid rgba(108,92,231,0.2)',
                    },
                  },
                },
              }}
            >
              <Chip
                icon={<Heart size={12} />}
                label="Pulse pick"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  color: '#6C5CE7',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  border: '1px solid rgba(108,92,231,0.3)',
                  '& .MuiChip-icon': { color: '#6C5CE7' },
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Save Button or Remove Button */}
        {showRemoveButton ? (
          <IconButton
            onClick={(e) => { e.stopPropagation(); onRemove?.(place.id); }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              bgcolor: 'rgba(239,68,68,0.9)',
              '&:hover': { bgcolor: '#ef4444' },
            }}
          >
            <Trash2 size={18} color="#fff" />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => onSave(place.id)}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {isSaved ? (
              <BookmarkCheck size={20} color="#6C5CE7" />
            ) : (
              <Bookmark size={20} color="#64748b" />
            )}
          </IconButton>
        )}

        {/* Image */}
        <CardMedia
          component="img"
          height="180"
          image={place.image}
          alt={place.name}
          sx={{ objectFit: 'cover' }}
        />

        {/* Content */}
        <CardContent sx={{ pb: 1 }}>
          {/* Name & Category */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
                {place.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                {place.category.replace('-', ' ')}
              </Typography>
            </Box>
          </Box>

          {/* Vibe Icons */}
          {place.vibes && place.vibes.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
            {place.vibes.map((vibe) => (
              <Box
                key={vibe}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(108,92,231,0.08)',
                  px: 1,
                  py: 0.25,
                  borderRadius: '8px',
                }}
              >
                <Typography sx={{ fontSize: '0.85rem' }}>
                  {VIBE_ICONS[vibe]?.icon}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                  {VIBE_ICONS[vibe]?.label}
                </Typography>
              </Box>
            ))}
          </Box>
          )}

          {/* Dual Rating System */}
          {(place.googleRating || place.pulseRating) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {place.googleRating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Google</Typography>
                  <Star size={12} fill="#facc15" color="#facc15" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {place.googleRating}
                  </Typography>
                </Box>
              )}
              {place.pulseRating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6C5CE7' }}>Pulse</Typography>
                  <Heart size={12} fill="#6C5CE7" color="#6C5CE7" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#6C5CE7' }}>
                    {place.pulseRating}
                  </Typography>
                  {place.pulseReviews && (
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      ({place.pulseReviews})
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Workshop Details */}
          {place.isWorkshop && place.workshopDetails && (
            <Box sx={{ 
              mb: 1.5, 
              p: 1.5, 
              bgcolor: 'rgba(168,85,247,0.08)', 
              borderRadius: '12px',
              border: '1px solid rgba(168,85,247,0.2)',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#a855f7' }}>
                  {new Date(place.workshopDetails.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {place.workshopDetails.time}
                </Typography>
                <Chip 
                  label={`${place.workshopDetails.spotsLeft} spots left`}
                  size="small"
                  sx={{ 
                    bgcolor: place.workshopDetails.spotsLeft <= 3 ? '#fef2f2' : '#f0fdf4',
                    color: place.workshopDetails.spotsLeft <= 3 ? '#ef4444' : '#22c55e',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                {place.workshopDetails.duration} · ₪{place.workshopDetails.price}/couple
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Includes: {place.workshopDetails.includes.join(' • ')}
              </Typography>
            </Box>
          )}

          {/* Location & Hours */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MapPin size={14} color="#64748b" />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {place.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={14} color={isClosingSoon ? '#ef4444' : '#22c55e'} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isClosingSoon ? '#ef4444' : '#22c55e',
                  fontWeight: 600,
                }}
              >
                {isClosingSoon ? 'Closing soon' : openStatus}
              </Typography>
            </Box>
          </Box>

          {/* Benefit Preview */}
          {place.hasActiveBenefit && place.benefit && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: 'rgba(108,92,231,0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(108,92,231,0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Gift size={16} color="#6C5CE7" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                  {place.benefit.title}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {place.benefit.description}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* CTAs */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0.5, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onViewPlace(place)}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            View place
          </Button>
          {place.hasActiveBenefit && (
            <Button
              variant="outlined"
              onClick={() => onSeeBenefits(place)}
              startIcon={<Gift size={16} />}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                '&:hover': {
                  borderColor: '#5b4cdb',
                  bgcolor: 'rgba(108,92,231,0.08)',
                },
              }}
            >
              Perks
            </Button>
          )}
          <IconButton
            onClick={() => onScanQR(place)}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              p: 1.25,
            }}
          >
            <QrCode size={20} color="#64748b" />
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  );
}

/* =========================
   QR Scan Dialog
   ========================= */
function QRScanDialog({ open, onClose, place }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraActive(false);
      setCameraError(err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : 'Could not access camera. Please try again.');
    }
  };

  // Auto-start camera when dialog opens
  useEffect(() => {
    if (open && !cameraActive && !stream) {
      startCamera();
    }
  }, [open]);

  // Connect stream to video element when stream is ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Cleanup on unmount or dialog close
  useEffect(() => {
    if (!open && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [open, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '75vh',
          width: '340px',
          m: 'auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1, pt: 2, fontSize: '1rem' }}>
        Scan QR at {place?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {cameraActive ? (
            <Box
              sx={{
                width: '100%',
                maxWidth: 280,
                mx: 'auto',
                borderRadius: '14px',
                overflow: 'hidden',
                bgcolor: '#000',
                mb: 2,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: 140,
                height: 140,
                mx: 'auto',
                bgcolor: '#f1f5f9',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #cbd5e1',
                mb: 2,
              }}
            >
              <QrCode size={60} color="#94a3b8" />
            </Box>
          )}
          {cameraError ? (
            <Typography variant="body2" sx={{ color: '#ef4444', mb: 0.5, fontSize: '0.85rem' }}>
              {cameraError}
            </Typography>
          ) : (
            <>
              <Typography variant="body1" sx={{ color: '#1a1a2e', fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                {cameraActive ? 'Scanning for QR code...' : 'Point your camera at the QR code'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {cameraActive ? 'Hold steady over the QR code' : 'Look for the Pulse QR code at the venue'}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={cameraActive ? handleClose : startCamera}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: cameraActive 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          }}
        >
          {cameraActive ? 'Close Camera' : 'Open Camera'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================
   Benefits Dialog
   ========================= */
function BenefitsDialog({ open, onClose, place }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraActive(false);
      setCameraError(err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : 'Could not access camera. Please try again.');
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    if (!open && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [open, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!place?.benefit) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh',
          width: '360px',
          m: 'auto',
          overflow: 'hidden',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          p: 2.5,
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Gift size={36} style={{ marginBottom: 6 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
          Pulse Perk
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {place?.name}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {cameraActive ? (
          /* Camera View */
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 280,
                mx: 'auto',
                borderRadius: '14px',
                overflow: 'hidden',
                bgcolor: '#000',
                mb: 2,
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
            {cameraError ? (
              <Typography variant="body2" sx={{ color: '#ef4444', fontSize: '0.85rem' }}>
                {cameraError}
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: '#1a1a2e', fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                  Scanning for QR code...
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Hold steady over the QR code
                </Typography>
              </>
            )}
          </Box>
        ) : (
          /* Benefits Info */
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
              {place?.benefit?.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.9rem' }}>
              {place?.benefit?.description}
            </Typography>

            {/* Terms */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#f8fafc',
                borderRadius: '10px',
                mb: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                Terms:
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 0.25, display: 'block', fontSize: '0.75rem' }}>
                • Valid only when physically present
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>
                • Must scan QR code to redeem
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>
                • Expires at {place?.benefit?.expiresAt}
              </Typography>
            </Box>

            {/* Expiry */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b' }}>
              <Clock size={16} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Valid until {place?.benefit?.expiresAt} today
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {cameraActive ? 'Back' : 'Close'}
        </Button>
        <Button
          variant="contained"
          startIcon={<QrCode size={16} />}
          onClick={cameraActive ? stopCamera : startCamera}
          sx={{
            py: 1,
            px: 2.5,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            background: cameraActive 
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            '&:hover': { 
              background: cameraActive 
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)' 
            },
          }}
        >
          {cameraActive ? 'Stop Camera' : 'Scan to Redeem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Sweet Gestures Section
   ========================= */
function SweetGesturesSection({ people, onSendGesture, onSeeMore, sentGestures = {} }) {
  const [showAll, setShowAll] = React.useState(false);
  const displayedPeople = showAll ? people : people.slice(0, 3);
  
  const handleSeeMore = () => {
    setShowAll(true);
    if (onSeeMore) {
      onSeeMore();
    }
  };
  
  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(168,85,247,0.08) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(108,92,231,0.12)',
      }}
    >
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} color="#fff" fill="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
              Sweet Gestures
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Send something special to someone nearby
            </Typography>
          </Box>
        </Box>
        <Chip
          label="New"
          size="small"
          sx={{
            bgcolor: 'rgba(108,92,231,0.15)',
            color: '#6C5CE7',
            fontWeight: 700,
            fontSize: '0.65rem',
          }}
        />
      </Box>

      {/* People List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayedPeople.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Box
                  component="img"
                  src={person.avatar}
                  alt={person.name}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                {person.isOnline && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      border: '3px solid #fff',
                    }}
                  />
                )}
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  {person.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPin size={12} color="#64748b" />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {person.distance} {person.unit} away
                  </Typography>
                </Box>
              </Box>

              {/* Gesture Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {GESTURE_TYPES.map((gesture) => {
                  const Icon = gesture.icon;
                  const isMain = gesture.id === 'coffee';
                  const isSent = Boolean(sentGestures[person.id]?.[gesture.id]);
                  return (
                    <motion.div
                      key={gesture.id}
                      whileHover={{ scale: isSent ? 1 : 1.1 }}
                      whileTap={{ scale: isSent ? 1 : 0.95 }}
                    >
                      <Tooltip 
                        title={isSent ? "Already sent to this person" : gesture.label}
                        arrow
                        placement="top"
                      >
                        <span>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSent) onSendGesture(person, gesture);
                            }}
                            disabled={isSent}
                            sx={{
                              width: isMain ? 52 : 40,
                              height: isMain ? 52 : 40,
                              borderRadius: isMain ? '16px' : '12px',
                              background: isMain ? gesture.gradient : 'transparent',
                              border: isMain ? 'none' : '1.5px solid #e2e8f0',
                              boxShadow: isMain ? `0 4px 16px ${gesture.shadowColor}` : 'none',
                              opacity: isSent ? 0.5 : 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: isMain ? gesture.gradient : 'rgba(108,92,231,0.08)',
                                borderColor: isMain ? 'transparent' : '#6C5CE7',
                              },
                              '&.Mui-disabled': {
                                background: isMain ? gesture.gradient : 'transparent',
                                border: isMain ? 'none' : '1.5px solid #e2e8f0',
                                opacity: 0.5,
                              },
                            }}
                          >
                            <Icon 
                              size={isMain ? 22 : 18} 
                              color={isMain ? '#fff' : '#64748b'} 
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* View More */}
      {!showAll && people.length > 3 && (
        <Button
          fullWidth
          onClick={handleSeeMore}
          endIcon={<ChevronRight size={18} />}
          sx={{
            mt: 2,
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#6C5CE7',
            bgcolor: 'rgba(108,92,231,0.08)',
            '&:hover': {
              bgcolor: 'rgba(108,92,231,0.15)',
            },
          }}
        >
          See more people nearby
        </Button>
      )}
    </Box>
  );
}

/* =========================
   Coffee Selection Dialog
   ========================= */
function CoffeeSelectionDialog({ open, onClose, person, onConfirm }) {
  const [selectedCafe, setSelectedCafe] = React.useState(null);
  const [selectedDrink, setSelectedDrink] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [useCustomMessage, setUseCustomMessage] = React.useState(false);

  // Default messages for coffee
  const defaultMessages = [
    "Coffee's on me! ☕ Enjoy!",
    "Thought you might need a pick-me-up! ☕",
    "Let's grab coffee together sometime? ☕",
  ];

  // Nearby cafes
  const nearbyCafes = [
    { id: 1, name: 'Cafe Nordoy', distance: '150m', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Cafelix', distance: '320m', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Spicehaus', distance: '450m', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=200&q=80' },
  ];

  // Popular drinks
  const drinks = [
    { id: 1, name: 'Espresso', icon: '☕', price: '₪12' },
    { id: 2, name: 'Cappuccino', icon: '☕', price: '₪16' },
    { id: 3, name: 'Latte', icon: '🥛', price: '₪18' },
    { id: 4, name: 'Americano', icon: '☕', price: '₪14' },
    { id: 5, name: 'Iced Coffee', icon: '🧊', price: '₪16' },
    { id: 6, name: 'Flat White', icon: '☕', price: '₪17' },
  ];

  const handleConfirm = () => {
    if (selectedCafe && selectedDrink && message) {
      onConfirm({ cafe: selectedCafe, drink: selectedDrink, message });
      setSelectedCafe(null);
      setSelectedDrink(null);
      setMessage('');
      setUseCustomMessage(false);
    }
  };

  const handleClose = () => {
    setSelectedCafe(null);
    setSelectedDrink(null);
    setMessage('');
    setUseCustomMessage(false);
    onClose();
  };

  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '100%',
          maxHeight: '72vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coffee size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.15rem' }}>
              Send Coffee to {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Choose a cafe and drink
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* Select Cafe */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Choose a nearby cafe
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {nearbyCafes.map((cafe) => (
              <Box
                key={cafe.id}
                onClick={() => setSelectedCafe(cafe)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedCafe?.id === cafe.id ? '#6C5CE7' : 'rgba(0,0,0,0.08)',
                  bgcolor: selectedCafe?.id === cafe.id ? 'rgba(108,92,231,0.05)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  component="img"
                  src={cafe.image}
                  alt={cafe.name}
                  sx={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', display: 'block' }}>
                    {cafe.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={14} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {cafe.distance}
                    </Typography>
                  </Box>
                </Box>
                {selectedCafe?.id === cafe.id && (
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#fff" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Select Drink */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Choose a drink
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {drinks.map((drink) => (
              <Box
                key={drink.id}
                onClick={() => setSelectedDrink(drink)}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedDrink?.id === drink.id ? '#6C5CE7' : 'rgba(0,0,0,0.08)',
                  bgcolor: selectedDrink?.id === drink.id ? 'rgba(108,92,231,0.05)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '28px', mb: 0.5 }}>{drink.icon}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', fontSize: '0.9rem' }}>
                  {drink.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {drink.price}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Message */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Add a message
          </Typography>
          {!useCustomMessage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {defaultMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  onClick={() => setMessage(msg)}
                  sx={{
                    p: 1.25,
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: message === msg ? '#6C5CE7' : 'rgba(0,0,0,0.08)',
                    bgcolor: message === msg ? 'rgba(108,92,231,0.05)' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {msg}
                </Box>
              ))}
              <Button
                size="small"
                onClick={() => setUseCustomMessage(true)}
                sx={{ textTransform: 'none', color: '#6C5CE7', fontSize: '0.95rem' }}
              >
                Write custom message...
              </Button>
            </Box>
          ) : (
            <Box>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid rgba(0,0,0,0.12)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  minHeight: '70px',
                  fontFamily: 'inherit',
                }}
              />
              <Button
                size="small"
                onClick={() => setUseCustomMessage(false)}
                sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}
              >
                Use suggested message
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: '#64748b', fontSize: '0.95rem' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedCafe || !selectedDrink || !message.trim()}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
            '&:disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
          }}
        >
          Send Coffee ☕
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================
   Flower Selection Dialog
   ========================= */
function FlowerSelectionDialog({ open, onClose, person, onConfirm }) {
  const [selectedShop, setSelectedShop] = React.useState(null);
  const [selectedFlower, setSelectedFlower] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [useCustomMessage, setUseCustomMessage] = React.useState(false);

  // Nearby flower shops
  const nearbyShops = [
    { id: 1, name: 'Bloom & Wild', distance: '200m', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Flower Market', distance: '350m', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Rose Garden', distance: '500m', image: 'https://images.unsplash.com/photo-1518882605630-8eb699b8a9c0?auto=format&fit=crop&w=200&q=80' },
  ];

  // Flower options
  const flowers = [
    { id: 1, name: 'Single Rose', icon: '🌹', price: '₪25', priceNum: 25 },
    { id: 2, name: 'Small Bouquet', icon: '💐', price: '₪65', priceNum: 65 },
    { id: 3, name: 'Mixed Flowers', icon: '🌸', price: '₪85', priceNum: 85 },
    { id: 4, name: 'Sunflower', icon: '🌻', price: '₪30', priceNum: 30 },
  ];

  // Default messages
  const defaultMessages = [
    "Thinking of you 💐",
    "Hope this brightens your day!",
    "You deserve something beautiful",
    "Just because... 🌸",
  ];

  const handleConfirm = () => {
    if (selectedShop && selectedFlower) {
      onConfirm({
        shop: selectedShop,
        flower: selectedFlower,
        message: message || defaultMessages[0],
      });
      setSelectedShop(null);
      setSelectedFlower(null);
      setMessage('');
      setUseCustomMessage(false);
    }
  };

  const handleClose = () => {
    setSelectedShop(null);
    setSelectedFlower(null);
    setMessage('');
    setUseCustomMessage(false);
    onClose();
  };

  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '100%',
          maxHeight: '72vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flower2 size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.15rem' }}>
              Send Flowers to {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Choose flowers and add a message
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* Select Shop */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Choose a flower shop
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {nearbyShops.map((shop) => (
              <Box
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedShop?.id === shop.id ? '#ec4899' : 'rgba(0,0,0,0.08)',
                  bgcolor: selectedShop?.id === shop.id ? 'rgba(236,72,153,0.05)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  component="img"
                  src={shop.image}
                  alt={shop.name}
                  sx={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', display: 'block' }}>
                    {shop.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={14} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {shop.distance}
                    </Typography>
                  </Box>
                </Box>
                {selectedShop?.id === shop.id && (
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#fff" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Select Flower */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Choose flowers
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {flowers.map((flower) => (
              <Box
                key={flower.id}
                onClick={() => setSelectedFlower(flower)}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1.5px solid',
                  borderColor: selectedFlower?.id === flower.id ? '#ec4899' : 'rgba(0,0,0,0.08)',
                  bgcolor: selectedFlower?.id === flower.id ? 'rgba(236,72,153,0.05)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '28px', mb: 0.5 }}>{flower.icon}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', fontSize: '0.9rem' }}>
                  {flower.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {flower.price}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Message */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Add a message
          </Typography>
          {!useCustomMessage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {defaultMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  onClick={() => setMessage(msg)}
                  sx={{
                    p: 1.25,
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: message === msg ? '#ec4899' : 'rgba(0,0,0,0.08)',
                    bgcolor: message === msg ? 'rgba(236,72,153,0.05)' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {msg}
                </Box>
              ))}
              <Button
                size="small"
                onClick={() => setUseCustomMessage(true)}
                sx={{ textTransform: 'none', color: '#ec4899', fontSize: '0.95rem' }}
              >
                Write custom message...
              </Button>
            </Box>
          ) : (
            <Box>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid rgba(0,0,0,0.12)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  minHeight: '70px',
                  fontFamily: 'inherit',
                }}
              />
              <Button
                size="small"
                onClick={() => setUseCustomMessage(false)}
                sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.95rem', mt: 0.5 }}
              >
                Use suggested message
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: '#64748b', fontSize: '0.95rem' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedShop || !selectedFlower || !message.trim()}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
            boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)',
            '&:disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
          }}
        >
          Continue 🌸
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Gift Selection Dialog
   ========================= */
function GiftSelectionDialog({ open, onClose, person, onConfirm }) {
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedVendor, setSelectedVendor] = React.useState(null);
  const [selectedGift, setSelectedGift] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [useCustomMessage, setUseCustomMessage] = React.useState(false);

  // Gift categories
  const giftCategories = [
    { id: 'chocolate', name: 'Chocolate', icon: '🍫' },
    { id: 'icecream', name: 'Ice Cream', icon: '🍦' },
    { id: 'dessert', name: 'Dessert', icon: '🧁' },
    { id: 'digital', name: 'Digital', icon: '🎁' },
  ];

  // Vendors by category
  const vendorsByCategory = {
    chocolate: [
      { id: 1, name: 'Max Brenner', distance: '250m', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=200&q=80' },
      { id: 2, name: 'Godiva', distance: '400m', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80' },
    ],
    icecream: [
      { id: 3, name: 'Golda', distance: '180m', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=200&q=80' },
      { id: 4, name: 'Anita', distance: '350m', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=200&q=80' },
    ],
    dessert: [
      { id: 5, name: 'Roladin', distance: '200m', image: 'https://images.unsplash.com/photo-1486427944544-d2c6e7e4d18a?auto=format&fit=crop&w=200&q=80' },
      { id: 6, name: 'Paul', distance: '300m', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
    ],
    digital: [
      { id: 7, name: 'Buy Me', distance: 'Online', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=200&q=80' },
      { id: 8, name: 'Bit', distance: 'Online', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=200&q=80' },
    ],
  };

  // Gifts by vendor
  const giftsByVendor = {
    1: [{ id: 1, name: 'Chocolate Box', price: '₪45', priceNum: 45, icon: '🍫' }, { id: 2, name: 'Truffle Set', price: '₪65', priceNum: 65, icon: '🍬' }],
    2: [{ id: 3, name: 'Premium Box', price: '₪85', priceNum: 85, icon: '🍫' }],
    3: [{ id: 4, name: 'Ice Cream Cup', price: '₪28', priceNum: 28, icon: '🍨' }],
    4: [{ id: 5, name: 'Gelato', price: '₪32', priceNum: 32, icon: '🍦' }],
    5: [{ id: 6, name: 'Cupcake', price: '₪22', priceNum: 22, icon: '🧁' }, { id: 7, name: 'Croissant', price: '₪18', priceNum: 18, icon: '🥐' }],
    6: [{ id: 8, name: 'Pain au Chocolat', price: '₪24', priceNum: 24, icon: '🥐' }],
    7: [{ id: 9, name: 'Coffee Gift', price: '₪25', priceNum: 25, icon: '☕' }],
    8: [{ id: 10, name: 'Gift Card ₪50', price: '₪50', priceNum: 50, icon: '💳' }, { id: 11, name: 'Gift Card ₪100', price: '₪100', priceNum: 100, icon: '💳' }],
  };

  const defaultMessages = [
    "A little something for you 🎁",
    "Sweet treat coming your way!",
    "Hope this makes you smile 😊",
    "Just because... 💝",
  ];

  const handleConfirm = () => {
    if (selectedGift && selectedVendor) {
      onConfirm({
        category: selectedCategory,
        vendor: selectedVendor,
        gift: selectedGift,
        message: message || defaultMessages[0],
      });
      setSelectedCategory(null);
      setSelectedVendor(null);
      setSelectedGift(null);
      setMessage('');
      setUseCustomMessage(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedVendor(null);
    setSelectedGift(null);
    setMessage('');
    setUseCustomMessage(false);
    onClose();
  };

  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '100%',
          maxHeight: '72vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Gift size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.15rem' }}>
              Send Gift to {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Choose a sweet surprise
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* Category Selection */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            What would you like to send?
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
            {giftCategories.map((cat) => (
              <Box
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedVendor(null); setSelectedGift(null); }}
                sx={{
                  p: 1,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: selectedCategory === cat.id ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                  bgcolor: selectedCategory === cat.id ? 'rgba(245,158,11,0.08)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '24px' }}>{cat.icon}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.8rem' }}>
                  {cat.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Vendor Selection */}
        {selectedCategory && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
              Choose where to order from
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {vendorsByCategory[selectedCategory]?.map((vendor) => (
                <Box
                  key={vendor.id}
                  onClick={() => { setSelectedVendor(vendor); setSelectedGift(null); }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: selectedVendor?.id === vendor.id ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                    bgcolor: selectedVendor?.id === vendor.id ? 'rgba(245,158,11,0.05)' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    component="img"
                    src={vendor.image}
                    alt={vendor.name}
                    sx={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', display: 'block' }}>
                      {vendor.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={12} color="#64748b" />
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {vendor.distance}
                      </Typography>
                    </Box>
                  </Box>
                  {selectedVendor?.id === vendor.id && (
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#fff" />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Gift Options */}
        {selectedVendor && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
              Choose an item
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {giftsByVendor[selectedVendor.id]?.map((gift) => (
                <Box
                  key={gift.id}
                  onClick={() => setSelectedGift(gift)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: selectedGift?.id === gift.id ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                    bgcolor: selectedGift?.id === gift.id ? 'rgba(245,158,11,0.05)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '28px', mb: 0.5 }}>{gift.icon}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', fontSize: '0.9rem' }}>
                    {gift.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {gift.price}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Message */}
        {selectedGift && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
              Add a message
            </Typography>
            {!useCustomMessage ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {defaultMessages.map((msg, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setMessage(msg)}
                    sx={{
                      p: 1.25,
                      borderRadius: '10px',
                      border: '2px solid',
                      borderColor: message === msg ? '#f59e0b' : 'rgba(0,0,0,0.08)',
                      bgcolor: message === msg ? 'rgba(245,158,11,0.05)' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {msg}
                  </Box>
                ))}
                <Button
                  size="small"
                  onClick={() => setUseCustomMessage(true)}
                  sx={{ textTransform: 'none', color: '#f59e0b', fontSize: '0.95rem', p: 0.5 }}
                >
                  Write custom message...
                </Button>
              </Box>
            ) : (
              <Box>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid rgba(0,0,0,0.12)',
                    fontSize: '0.95rem',
                    resize: 'none',
                    minHeight: '70px',
                    fontFamily: 'inherit',
                  }}
                />
                <Button
                  size="small"
                  onClick={() => setUseCustomMessage(false)}
                  sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.95rem', p: 0.5 }}
                >
                  Use suggested message
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: '#64748b', fontSize: '0.95rem' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedGift || !message.trim()}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
            '&:disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
          }}
        >
          Continue 🎁
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Add Date Spot Dialog (UGC)
   ========================= */
function AddDateSpotDialog({ open, onClose, onSubmit }) {
  const [step, setStep] = React.useState(1); // 1: Basic Info, 2: Details, 3: Photos, 4: Success
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    location: '',
    description: '',
    vibes: [],
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const categories = [
    { id: 'cafe', label: 'Cafe', icon: '☕' },
    { id: 'bar', label: 'Bar', icon: '🍷' },
    { id: 'nature', label: 'Nature & Parks', icon: '🌳' },
    { id: 'live-music', label: 'Live Music', icon: '🎵' },
    { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { id: 'activity', label: 'Activity', icon: '🎯' },
  ];

  const vibeOptions = [
    { id: 'romantic', label: 'Romantic', icon: '🕯️' },
    { id: 'chill', label: 'Chill', icon: '🌙' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'energetic', label: 'Energetic', icon: '⚡' },
    { id: 'live', label: 'Live Music', icon: '🎵' },
  ];

  const handleClose = () => {
    setStep(1);
    setFormData({ name: '', category: '', location: '', description: '', vibes: [], photos: [] });
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(4);
    onSubmit?.(formData);
  };

  const toggleVibe = (vibeId) => {
    setFormData(prev => ({
      ...prev,
      vibes: prev.vibes.includes(vibeId)
        ? prev.vibes.filter(v => v !== vibeId)
        : [...prev.vibes, vibeId],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          maxHeight: '75vh',
          m: 2,
        },
      }}
    >
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
            <Box sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1,
            }}>
              <MapPin size={22} color="#fff" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Add a Date Spot 📍
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Share your favorite place and earn <strong style={{ color: '#6C5CE7' }}>50 points!</strong>
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                Place Name *
              </Typography>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Cafe Nordoy"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                Category *
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {categories.map((cat) => (
                  <Box
                    key={cat.id}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      border: formData.category === cat.id ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                      bgcolor: formData.category === cat.id ? 'rgba(108,92,231,0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{cat.icon}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{cat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                Location *
              </Typography>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Tel Aviv, Rothschild Blvd"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              sx={{ py: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', fontSize: '0.85rem' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!formData.name || !formData.category || !formData.location}
              onClick={() => setStep(2)}
              sx={{
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                '&:disabled': { background: '#e2e8f0' },
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 2: Details & Vibes */}
      {step === 2 && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Tell us more ✨
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              What makes this place special for dates?
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, display: 'block' }}>
                Why is it great for dates?
              </Typography>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us what makes this place special..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 1, display: 'block' }}>
                Vibes (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {vibeOptions.map((vibe) => (
                  <Chip
                    key={vibe.id}
                    label={`${vibe.icon} ${vibe.label}`}
                    onClick={() => toggleVibe(vibe.id)}
                    sx={{
                      bgcolor: formData.vibes.includes(vibe.id) ? 'rgba(108,92,231,0.15)' : '#f1f5f9',
                      color: formData.vibes.includes(vibe.id) ? '#6C5CE7' : '#64748b',
                      fontWeight: 600,
                      border: formData.vibes.includes(vibe.id) ? '1px solid #6C5CE7' : '1px solid transparent',
                      '&:hover': { bgcolor: 'rgba(108,92,231,0.1)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(1)}
              sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setStep(3)}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 3: Photo Upload */}
      {step === 3 && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Add a Photo 📸
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Optional, but helps others discover this place
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                border: '2px dashed #e2e8f0',
                borderRadius: '16px',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#6C5CE7', bgcolor: 'rgba(108,92,231,0.04)' },
              }}
            >
              <Box sx={{ fontSize: '3rem', mb: 1 }}>📷</Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                Tap to upload a photo
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                JPG, PNG up to 5MB
              </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '1.5rem' }}>🎁</Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534' }}>
                    Earn 50 Points!
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d' }}>
                    You'll receive points once your spot is approved
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(2)}
              sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: '#dcfce7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}>
              <Check size={40} color="#22c55e" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
              Thanks for sharing! 🎉
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
              Your date spot is under review
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#f0fdf4', 
              borderRadius: '12px', 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              textAlign: 'left',
            }}>
              <Box sx={{ fontSize: '1.5rem' }}>🎁</Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534' }}>
                  50 Points Pending
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d' }}>
                  You'll receive them once approved (usually within 24h)
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                py: 1.5,
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              Done
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

/* =========================
   Nature Place Detail Dialog
   ========================= */
function NaturePlaceDetailDialog({ open, onClose, place, userMatches = [], onInviteMatch }) {
  const [step, setStep] = React.useState(1); // 1: Details, 2: Invite
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [inviteSent, setInviteSent] = React.useState(false);

  const availableMatches = userMatches.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.photoUrl,
  }));

  const handleClose = () => {
    setStep(1);
    setSelectedMatch(null);
    setInviteSent(false);
    onClose();
  };

  const handleInviteMatch = () => {
    if (selectedMatch && place) {
      onInviteMatch?.({
        match: selectedMatch,
        place: place,
      });
      setInviteSent(true);
    }
  };

  const handleWhatsAppInvite = () => {
    if (!place) return;
    const message = encodeURIComponent(
      `Hey! 🌿 Want to explore ${place.name} together?\n\n` +
      `📍 ${place.location}\n` +
      `${place.natureDetails?.entryFee?.free ? '✅ Free entry!' : `💰 Entry: ₪${place.natureDetails?.entryFee?.adult}/person`}\n\n` +
      `Let me know if you're interested! 🥾`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (!place || !place.natureDetails) return null;
  const details = place.natureDetails;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Moderate': return { bg: '#fef3c7', color: '#d97706' };
      case 'Challenging': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          maxHeight: '85vh',
          m: 2,
        },
      }}
    >
      {/* Step 1: Place Details */}
      {step === 1 && (
        <>
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={place.image}
              alt={place.name}
              sx={{ width: '100%', height: 140, objectFit: 'cover' }}
            />
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}
            >
              <X size={18} />
            </IconButton>
            {/* Entry Fee Badge */}
            <Chip
              label={details.entryFee?.free ? '✅ Free Entry' : `₪${details.entryFee?.adult}/person`}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                bgcolor: details.entryFee?.free ? 'rgba(34,197,94,0.9)' : 'rgba(108,92,231,0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          </Box>
          
          <DialogContent sx={{ pt: 1.5, pb: 1, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.25 }}>
              {place.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <MapPin size={12} /> {place.location} · Best time: {details.bestTime}
            </Typography>

            {/* About Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 0.5 }}>
                📖 About
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {details.about}
              </Typography>
            </Box>

            {/* Trails Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 0.75 }}>
                🥾 Trails & Routes
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {details.trails.map((trail, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: '10px',
                      p: 1.25,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                        {trail.name}
                      </Typography>
                      <Chip
                        label={trail.difficulty}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: getDifficultyColor(trail.difficulty).bg,
                          color: getDifficultyColor(trail.difficulty).color,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600, display: 'block', mb: 0.25 }}>
                      {trail.distance} · {trail.duration}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                      {trail.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Equipment Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 0.5 }}>
                🎒 Don't Forget to Bring
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {details.equipment.map((item, idx) => (
                  <Chip
                    key={idx}
                    label={item}
                    size="small"
                    sx={{
                      bgcolor: '#fef3c7',
                      color: '#92400e',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 24,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Entry Fee Details */}
            <Box sx={{ mb: 2, bgcolor: details.entryFee?.free ? '#f0fdf4' : '#faf5ff', borderRadius: '10px', p: 1.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 0.25 }}>
                💰 Entry Fee
              </Typography>
              {details.entryFee?.free ? (
                <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                  Free entry! {details.entryFee.note}
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 700, fontSize: '0.85rem' }}>
                    Adult: ₪{details.entryFee.adult} · Child: ₪{details.entryFee.child}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {details.entryFee.note}
                  </Typography>
                </>
              )}
            </Box>

            {/* Facilities */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 0.5 }}>
                🏛️ Facilities
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {details.facilities.join(' • ')}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setStep(2)}
              sx={{
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              🥾 Invite Someone to Join
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 2: Invite */}
      {step === 2 && !inviteSent && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 2.5, pb: 1 }}>
            <Box sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              bgcolor: '#f0fdf4', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 1,
            }}>
              <span style={{ fontSize: '1.5rem' }}>🌿</span>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Invite to {place.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Who would you like to explore with?
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            {/* Invite a Match */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 1 }}>
              💜 Invite a Pulse Match
            </Typography>
            {availableMatches.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                {availableMatches.map((match) => (
                  <Box
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1,
                      borderRadius: '10px',
                      border: selectedMatch?.id === match.id ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                      bgcolor: selectedMatch?.id === match.id ? 'rgba(108,92,231,0.08)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Avatar src={match.avatar} sx={{ width: 40, height: 40 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{match.name}</Typography>
                    {selectedMatch?.id === match.id && (
                      <Check size={18} color="#6C5CE7" style={{ marginLeft: 'auto' }} />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                No matches yet. Start swiping to find someone!
              </Typography>
            )}

            {/* Invite via WhatsApp */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', display: 'block', mb: 1 }}>
              📱 Or invite a friend
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleWhatsAppInvite}
              startIcon={<MessageCircle size={18} />}
              sx={{
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#25D366',
                color: '#25D366',
                '&:hover': { bgcolor: 'rgba(37,211,102,0.08)', borderColor: '#25D366' },
              }}
            >
              Share via WhatsApp
            </Button>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(1)}
              sx={{ py: 0.75, borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleInviteMatch}
              disabled={!selectedMatch}
              sx={{
                py: 0.75,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              Send Invite
            </Button>
          </DialogActions>
        </>
      )}

      {/* Invite Sent Confirmation */}
      {step === 2 && inviteSent && (
        <>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              width: 70, 
              height: 70, 
              borderRadius: '50%', 
              bgcolor: '#dcfce7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}>
              <Check size={36} color="#22c55e" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
              Invite Sent! 🌿
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              {selectedMatch?.name} received your invite to explore {place.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
              Continue chatting to plan your adventure!
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              Done
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

/* =========================
   Workshop Booking Dialog
   ========================= */
function WorkshopBookingDialog({ open, onClose, workshop, onBook, userMatches = [] }) {
  const [step, setStep] = React.useState(1); // 1: Date Selection, 2: Invite +1, 3: Payment, 4: Confirmation
  const [selectedDate, setSelectedDate] = React.useState(null); // Selected date object
  const [inviteMethod, setInviteMethod] = React.useState(null); // 'match', 'contact', 'solo'
  const [selectedMatch, setSelectedMatch] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState(null); // 'apple', 'card'
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvv, setCardCvv] = React.useState('');

  // Available dates for this workshop
  const availableDates = workshop?.workshopDetails?.availableDates || [];

  // Use real matches from props, map to simpler format
  const availableMatches = userMatches.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.photoUrl,
  }));

  // Handle WhatsApp invite
  const handleWhatsAppInvite = () => {
    if (!workshop) return;
    const message = encodeURIComponent(
      `Hey! 💕 I just booked a couples workshop and thought of you!\n\n` +
      `📍 ${workshop.name}\n` +
      `📅 ${workshop.workshopDetails?.date ? new Date(workshop.workshopDetails.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}\n` +
      `⏰ ${workshop.workshopDetails?.time || ''}\n` +
      `📍 ${workshop.location}\n\n` +
      `Would you like to join me? 🎨`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setInviteMethod('contact');
  };

  // Handle SMS invite
  const handleSMSInvite = () => {
    if (!workshop) return;
    const message = encodeURIComponent(
      `Hey! I booked ${workshop.name} workshop on ${workshop.workshopDetails?.date ? new Date(workshop.workshopDetails.date).toLocaleDateString() : ''}. Want to join me?`
    );
    window.open(`sms:?body=${message}`, '_blank');
    setInviteMethod('contact');
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDate(null);
    setInviteMethod(null);
    setSelectedMatch(null);
    setPaymentMethod(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    onClose();
  };

  const handleBook = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setStep(4);
    onBook?.({
      workshop,
      inviteMethod,
      invitedPerson: selectedMatch,
      selectedDate, // Include selected date in booking
    });
  };

  if (!workshop) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          maxHeight: '70vh',
          m: 2,
        },
      }}
    >
      {/* Step 1: Workshop Details */}
      {step === 1 && (
        <>
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={workshop.image}
              alt={workshop.name}
              sx={{ width: '100%', height: 100, objectFit: 'cover' }}
            />
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}
            >
              <X size={18} />
            </IconButton>
          </Box>
          <DialogContent sx={{ pt: 1, pb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.25 }}>
              {workshop.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
              {workshop.location}
            </Typography>

            {workshop.workshopDetails && (
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: '10px', p: 1.5, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>Date & Time</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {new Date(workshop.workshopDetails.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                      {workshop.workshopDetails.time} · {workshop.workshopDetails.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>Price</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                      ₪{workshop.workshopDetails.price}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>per couple</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ borderTop: '1px solid #e2e8f0', pt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Includes: {workshop.workshopDetails.includes.join(' • ')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                  <Users size={14} color="#64748b" />
                  <Typography variant="caption" sx={{ color: workshop.workshopDetails.spotsLeft <= 3 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                    {workshop.workshopDetails.spotsLeft} spots left
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setStep(2)}
              sx={{
                py: 0.75,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              Book This Workshop
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 2: Invite +1 */}
      {step === 2 && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Invite Your +1 💕
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Who would you like to join you?
            </Typography>
          </DialogTitle>
          <DialogContent>
            {/* Invite from matches */}
            {availableMatches.length > 0 ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>
                  From your matches
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, overflowX: 'auto', pb: 1 }}>
                  {availableMatches.map((match) => (
                <Box
                  key={match.id}
                  onClick={() => { setSelectedMatch(match); setInviteMethod('match'); }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: '12px',
                    border: selectedMatch?.id === match.id ? '2px solid #6C5CE7' : '2px solid transparent',
                    bgcolor: selectedMatch?.id === match.id ? 'rgba(108,92,231,0.08)' : 'transparent',
                  }}
                >
                  <Box
                    component="img"
                    src={match.avatar}
                    alt={match.name}
                    sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', mb: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{match.name}</Typography>
                  </Box>
                ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2, textAlign: 'center' }}>
                No matches yet. Invite someone via WhatsApp!
              </Typography>
            )}

            {/* Other options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant={inviteMethod === 'contact' ? 'contained' : 'outlined'}
                onClick={handleWhatsAppInvite}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  justifyContent: 'flex-start',
                  px: 2,
                  ...(inviteMethod === 'contact' ? {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  } : {
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                  }),
                }}
              >
                📱 Invite via WhatsApp
              </Button>
              <Button
                fullWidth
                variant={inviteMethod === 'solo' ? 'contained' : 'outlined'}
                onClick={() => { setInviteMethod('solo'); setSelectedMatch(null); }}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  justifyContent: 'flex-start',
                  px: 2,
                  ...(inviteMethod === 'solo' ? {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  } : {
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                  }),
                }}
              >
                🙋 I'll decide later
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(1)}
              sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!inviteMethod}
              onClick={() => setStep(3)}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                '&:disabled': { background: '#e2e8f0' },
              }}
            >
              Continue
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Confirm Booking 💳
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ overflow: 'auto' }}>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: '16px', p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{workshop.name}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {workshop.workshopDetails && new Date(workshop.workshopDetails.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {workshop.workshopDetails?.time}
              </Typography>
              {selectedMatch && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid #e2e8f0' }}>
                  <Box
                    component="img"
                    src={selectedMatch.avatar}
                    alt={selectedMatch.name}
                    sx={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    With {selectedMatch.name}
                  </Typography>
                  <Chip label="Invite pending" size="small" sx={{ ml: 'auto', bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }} />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                ₪{workshop.workshopDetails?.price}
              </Typography>
            </Box>

            {/* Payment methods */}
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>Payment method</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Apple Pay" 
                icon={<Box component="span" sx={{ fontSize: '16px' }}></Box>}
                onClick={() => setPaymentMethod('apple')}
                sx={{ 
                  flex: 1, 
                  py: 2, 
                  fontWeight: 600,
                  cursor: 'pointer',
                  bgcolor: paymentMethod === 'apple' ? '#6C5CE7' : '#f1f5f9',
                  color: paymentMethod === 'apple' ? 'white' : '#1a1a2e',
                  '&:hover': { bgcolor: paymentMethod === 'apple' ? '#5b4cdb' : '#e2e8f0' },
                }} 
              />
              <Chip 
                label="Credit Card" 
                icon={<CreditCard size={16} />}
                onClick={() => setPaymentMethod('card')}
                sx={{ 
                  flex: 1, 
                  py: 2, 
                  fontWeight: 600,
                  cursor: 'pointer',
                  bgcolor: paymentMethod === 'card' ? '#6C5CE7' : '#f1f5f9',
                  color: paymentMethod === 'card' ? 'white' : '#1a1a2e',
                  '&:hover': { bgcolor: paymentMethod === 'card' ? '#5b4cdb' : '#e2e8f0' },
                }} 
              />
            </Box>

            {/* Credit Card Form */}
            {paymentMethod === 'card' && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  fullWidth
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&:hover fieldset': { borderColor: '#6C5CE7' },
                      '&.Mui-focused fieldset': { borderColor: '#6C5CE7' },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&:hover fieldset': { borderColor: '#6C5CE7' },
                        '&.Mui-focused fieldset': { borderColor: '#6C5CE7' },
                      },
                    }}
                  />
                  <TextField
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&:hover fieldset': { borderColor: '#6C5CE7' },
                        '&.Mui-focused fieldset': { borderColor: '#6C5CE7' },
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setStep(2)}
              sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBook}
              disabled={isProcessing || !paymentMethod || (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv))}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              {isProcessing ? 'Processing...' : `Pay ₪${workshop.workshopDetails?.price || 0}`}
            </Button>
          </DialogActions>
        </>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <>
          <DialogContent sx={{ textAlign: 'center', py: 2.5 }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: '#dcfce7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
            }}>
              <Check size={32} color="#22c55e" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
              Booking Confirmed! 🎉
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
              You're all set for {workshop.name}
            </Typography>
            
            {selectedMatch && (
              <Box sx={{ 
                bgcolor: '#fef3c7', 
                borderRadius: '10px', 
                p: 1.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                textAlign: 'left',
                mb: 1.5,
              }}>
                <Box sx={{ fontSize: '1.2rem' }}>⏳</Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.8rem' }}>
                    Waiting for {selectedMatch.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a16207', fontSize: '0.7rem' }}>
                    We'll notify you when they respond
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Add to Calendar button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Calendar size={16} />}
              onClick={() => {
                const date = workshop.workshopDetails?.date ? new Date(workshop.workshopDetails.date) : new Date();
                const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
                const title = encodeURIComponent(workshop.name);
                const details = encodeURIComponent(`Couples Workshop at ${workshop.location}`);
                const location = encodeURIComponent(workshop.location);
                const startStr = date.toISOString().replace(/-|:|\.\d+/g, '');
                const endStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
                window.open(calendarUrl, '_blank');
              }}
              sx={{
                py: 1,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                '&:hover': { bgcolor: 'rgba(108,92,231,0.08)' },
              }}
            >
              Add to Calendar
            </Button>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              Done
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

/* =========================
   Workshop Rating Dialog
   ========================= */
function WorkshopRatingDialog({ open, onClose, workshop, onSubmit, onRemove }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    onSubmit?.({ rating, review });
    setRating(0);
    setReview('');
  };

  const handleRemove = () => {
    onRemove?.();
    onClose();
  };

  if (!workshop) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          m: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 2, pb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.25 }}>
          How was your experience? 💜
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Rate {workshop.name}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Workshop image */}
        <Box
          component="img"
          src={workshop.image}
          alt={workshop.name}
          sx={{
            width: '100%',
            height: 80,
            objectFit: 'cover',
            borderRadius: '10px',
            mb: 1.5,
          }}
        />

        {/* Star Rating */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              onClick={() => setRating(star)}
              sx={{
                p: 0.25,
                color: star <= rating ? '#6C5CE7' : '#e2e8f0',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.15)' },
              }}
            >
              <Star size={28} fill={star <= rating ? '#6C5CE7' : 'none'} />
            </IconButton>
          ))}
        </Box>

        {/* Review text */}
        <Box
          component="textarea"
          placeholder="Share your experience (optional)..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          sx={{
            width: '100%',
            minHeight: 60,
            p: 1,
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            '&:focus': { borderColor: '#6C5CE7' },
          }}
        />

        {/* Remove workshop option */}
        <Button
          fullWidth
          variant="text"
          startIcon={<Trash2 size={14} />}
          onClick={handleRemove}
          sx={{
            mt: 1.5,
            py: 0.5,
            color: '#ef4444',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8rem',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' },
          }}
        >
          Remove from My Workshops
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ py: 0.75, borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderColor: '#e2e8f0', color: '#64748b' }}
        >
          Later
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          sx={{
            py: 0.75,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================
   Say Hi Message Dialog
   ========================= */
function SayHiDialog({ open, onClose, person, onConfirm }) {
  const [message, setMessage] = React.useState('');
  const [useCustomMessage, setUseCustomMessage] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // AI-suggested messages based on context
  const aiSuggestions = [
    `Hey ${person?.name}! I noticed we're both nearby - would love to chat! 👋`,
    `Hi ${person?.name}! Your profile caught my eye. How's your day going? 😊`,
    `Hey! I'm ${person?.name ? 'curious about you' : 'here'} - want to grab a coffee sometime? ☕`,
    `Hi there! Something tells me we'd have great conversations 💬`,
  ];

  // Quick casual openers
  const quickOpeners = [
    "Hey! 👋",
    "Hi there! 😊",
    "Hello! How's it going?",
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 800));
    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setMessage(randomSuggestion);
    setIsGenerating(false);
  };

  const handleConfirm = () => {
    if (message) {
      onConfirm({ message });
      setMessage('');
      setUseCustomMessage(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setUseCustomMessage(false);
    onClose();
  };

  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '100%',
          maxHeight: '72vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.15rem' }}>
              Say Hi to {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Start a conversation
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* AI Suggestions */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>
              ✨ AI Suggestions
            </Typography>
            <Button
              size="small"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              sx={{ textTransform: 'none', color: '#8b5cf6', fontSize: '0.85rem', p: 0.5, minWidth: 'auto' }}
            >
              {isGenerating ? '...' : '🔄 New'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {aiSuggestions.slice(0, 3).map((msg, idx) => (
              <Box
                key={idx}
                onClick={() => setMessage(msg)}
                sx={{
                  p: 1.25,
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: message === msg ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
                  bgcolor: message === msg ? 'rgba(139,92,246,0.05)' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#1a1a2e',
                }}
              >
                {msg}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Quick Openers */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Quick openers
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {quickOpeners.map((msg, idx) => (
              <Chip
                key={idx}
                label={msg}
                onClick={() => setMessage(msg)}
                size="small"
                sx={{
                  bgcolor: message === msg ? 'rgba(139,92,246,0.15)' : 'rgba(0,0,0,0.04)',
                  border: message === msg ? '2px solid #8b5cf6' : '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  height: '32px',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Custom Message */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Or write your own
          </Typography>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Say something nice to ${person.name}...`}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid rgba(0,0,0,0.12)',
              fontSize: '0.95rem',
              resize: 'none',
              minHeight: '70px',
              fontFamily: 'inherit',
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: '#64748b', fontSize: '0.95rem' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!message.trim()}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
            '&:disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
          }}
        >
          Send 💬
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Payment Flow Dialog
   ========================= */
function PaymentFlowDialog({ open, onClose, person, gestureType, gestureDetails, onConfirmPayment }) {
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Get gesture info based on type
  const getGestureInfo = () => {
    switch (gestureType) {
      case 'coffee':
        return {
          icon: Coffee,
          color: '#6C5CE7',
          gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          itemName: gestureDetails?.drink?.name || 'Coffee',
          vendorName: gestureDetails?.cafe?.name || 'Cafe',
          price: gestureDetails?.drink?.price || '₪0',
        };
      case 'flower':
        return {
          icon: Flower2,
          color: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
          itemName: gestureDetails?.flower?.name || 'Flowers',
          vendorName: gestureDetails?.shop?.name || 'Flower Shop',
          price: gestureDetails?.flower?.price || '₪0',
        };
      case 'gift':
        return {
          icon: Gift,
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
          itemName: gestureDetails?.gift?.name || 'Gift',
          vendorName: gestureDetails?.gift?.vendor || 'Vendor',
          price: gestureDetails?.gift?.price || '₪0',
        };
      default:
        return { icon: Gift, color: '#6C5CE7', gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)', itemName: 'Item', vendorName: 'Vendor', price: '₪0' };
    }
  };

  const info = getGestureInfo();
  const Icon = info.icon;

  const handleSubmit = async () => {
    if (!cardNumber || !expiry || !cvv) return;
    
    setIsProcessing(true);
    // Simulate payment token generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production: Use Stripe/payment provider to create payment token
    const paymentToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    onConfirmPayment({
      paymentToken,
      gestureType,
      gestureDetails,
    });
    
    setIsProcessing(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  const handleClose = () => {
    setCardNumber('');
    setExpiry('');
    setCvv('');
    onClose();
  };

  if (!person) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '100%',
          maxHeight: '72vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: info.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} color="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', fontSize: '1.15rem' }}>
              Confirm Payment
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Sending to {person.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* Order Summary */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: 'rgba(0,0,0,0.02)',
            border: '1.5px solid rgba(0,0,0,0.06)',
            mb: 2.5,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5, display: 'block', fontSize: '0.95rem' }}>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              {info.itemName}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>
              {info.price}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            From {info.vendorName}
          </Typography>
        </Box>

        {/* Important Notice */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: 'rgba(34, 197, 94, 0.08)',
            border: '1.5px solid rgba(34, 197, 94, 0.2)',
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Check size={16} color="#22c55e" style={{ marginTop: 2 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#22c55e', display: 'block', fontSize: '0.9rem' }}>
                You will only be charged if {person.name} accepts
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                If declined or expired, no charge will be made.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Card Details */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'block', fontSize: '0.95rem' }}>
            Payment Details
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, display: 'block', fontSize: '0.85rem' }}>
              Card Number
            </Typography>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid rgba(0,0,0,0.12)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, display: 'block', fontSize: '0.85rem' }}>
                Expiry
              </Typography>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                placeholder="MM/YY"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid rgba(0,0,0,0.12)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, display: 'block', fontSize: '0.85rem' }}>
                CVV
              </Typography>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid rgba(0,0,0,0.12)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          disabled={isProcessing}
          sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: '#64748b', fontSize: '0.95rem' }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!cardNumber || !expiry || !cvv || isProcessing}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: info.gradient,
            boxShadow: `0 4px 16px ${info.color}66`,
            '&:disabled': { background: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.26)' },
          }}
        >
          {isProcessing ? '...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Gesture Sent Dialog
   ========================= */
function GestureSentDialog({ open, onClose, person, gesture, coffeeDetails }) {
  if (!person || !gesture) return null;

  const Icon = gesture.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '14px',
          maxWidth: 280,
          width: '280px',
          overflow: 'hidden',
          m: 'auto',
        },
      }}
    >
      {/* Animated Header */}
      <Box
        sx={{
          background: gesture.gradient,
          p: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating particles animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: -100, 
              opacity: [0, 1, 0],
              x: Math.sin(i) * 30,
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              left: `${20 + i * 12}%`,
              bottom: 0,
            }}
          >
            <Sparkles size={16} color="rgba(255,255,255,0.6)" />
          </motion.div>
        ))}
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '14px',
              bgcolor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon size={26} color="#fff" />
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff', mb: 0.25, fontSize: '0.95rem' }}>
            Gesture Sent! 💫
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem' }}>
            {gesture.label} to {person.name}
          </Typography>
        </motion.div>
      </Box>

      <DialogContent sx={{ p: 1.5, pt: 1, textAlign: 'center' }}>
        {/* Person Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <Box
            component="img"
            src={person.avatar}
            alt={person.name}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.8rem' }}>
              {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
              Will be notified soon
            </Typography>
          </Box>
        </Box>

        {coffeeDetails && (
          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: 'rgba(108,92,231,0.08)',
              border: '1px solid rgba(108,92,231,0.15)',
              mb: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 700, display: 'block', mb: 0.25, fontSize: '0.65rem' }}>
              Your Coffee Invitation
            </Typography>
            <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 600, fontSize: '0.75rem' }}>
              {coffeeDetails.drink.name} at {coffeeDetails.cafe.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
              {coffeeDetails.cafe.distance} away
            </Typography>
          </Box>
        )}
        <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, fontSize: '0.7rem', lineHeight: 1.3, display: 'block' }}>
          {person.name} will receive your gesture and can respond. 🤞
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 1.5, pb: 1.5, pt: 0, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            py: 0.75,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            background: gesture.gradient,
            boxShadow: `0 4px 16px ${gesture.shadowColor}`,
          }}
        >
          Awesome!
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Main ExploreScreen
   ========================= */
export default function ExploreScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedPlaces, setSavedPlaces] = useState(() => {
    // Load saved place IDs from localStorage on init
    try {
      const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
      return saved.map(p => p.id);
    } catch { return []; }
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  // Sweet Gestures state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedGesture, setSelectedGesture] = useState(null);
  const [showGestureDialog, setShowGestureDialog] = useState(false);
  
  // Gesture messages store
  const addGestureMessage = useGestureMessagesStore((state) => state.addGestureMessage);
  const canSendGesture = useGestureMessagesStore((state) => state.canSendGesture);
  const consumeGesture = useGestureMessagesStore((state) => state.useGesture);
  const startGestureProcess = useGestureMessagesStore((state) => state.startGestureProcess);
  const cancelGestureProcess = useGestureMessagesStore((state) => state.cancelGestureProcess);
  const gestureInProgress = useGestureMessagesStore((state) => state.gestureInProgress);
  const isPulsePro = useGestureMessagesStore((state) => state.isPulsePro);
  const pointsBalance = useGestureMessagesStore((state) => state.pointsBalance);
  const monthlyGestureUsage = useGestureMessagesStore((state) => state.monthlyGestureUsage);
  const [showGestureLimitDialog, setShowGestureLimitDialog] = useState(false);
  const [showCoffeeDialog, setShowCoffeeDialog] = useState(false);
  const [showFlowerDialog, setShowFlowerDialog] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSayHiDialog, setShowSayHiDialog] = useState(false);
  const [coffeeDetails, setCoffeeDetails] = useState(null);
  const [flowerDetails, setFlowerDetails] = useState(null);
  const [giftDetails, setGiftDetails] = useState(null);
  const [currentGestureType, setCurrentGestureType] = useState(null);
  const [currentGestureDetails, setCurrentGestureDetails] = useState(null);
  // sentGestures is now managed by the store for persistence
  const sentGestures = useGestureMessagesStore((state) => state.sentGestures);
  const markGestureSent = useGestureMessagesStore((state) => state.markGestureSent);
  
  // Workshop booking state
  const [showWorkshopBookingDialog, setShowWorkshopBookingDialog] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  
  // Nature place detail state
  const [showNaturePlaceDialog, setShowNaturePlaceDialog] = useState(false);
  const [selectedNaturePlace, setSelectedNaturePlace] = useState(null);
  
  // Purchased workshops state (persisted in localStorage) - includes demo completed workshop
  const [purchasedWorkshops, setPurchasedWorkshops] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("purchased_workshops") || "[]");
      // Add demo completed workshop if not already present
      const demoCompletedWorkshop = {
        id: 'demo-completed-1',
        name: "Wine & Paint Night",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        category: "workshops",
        isWorkshop: true,
        location: "Tel Aviv",
        workshopDetails: {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          time: "19:00",
          duration: "2.5 hours",
          price: 180,
          includes: ["Wine tasting", "Art supplies", "Light snacks"],
          spotsLeft: 0,
        },
        purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        needsRating: true,
      };
      if (!saved.find(w => w.id === 'demo-completed-1')) {
        return [demoCompletedWorkshop, ...saved];
      }
      return saved;
    } catch { return []; }
  });
  
  // Workshop rating dialog state
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [workshopToRate, setWorkshopToRate] = useState(null);
  
  // Add Date Spot (UGC) state
  const [showAddDateSpotDialog, setShowAddDateSpotDialog] = useState(false);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide toast after 1 second
  React.useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, open: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [toast.open]);

  // Show rating dialog when entering My Workshops if there are completed workshops needing rating
  React.useEffect(() => {
    if (activeFilter === 'my-workshops') {
      const workshopNeedingRating = purchasedWorkshops.find(w => w.status === 'completed' && w.needsRating);
      if (workshopNeedingRating) {
        setWorkshopToRate(workshopNeedingRating);
        setShowRatingDialog(true);
      }
    }
  }, [activeFilter, purchasedWorkshops]);

  // Filter places based on active filter
  const filteredPlaces = useMemo(() => {
    if (activeFilter === 'all') return MOCK_PLACES;
    if (activeFilter === 'saved') {
      // Show saved places - combine MOCK_PLACES that are saved + places saved directly from localStorage
      const savedFromMock = MOCK_PLACES.filter(place => 
        savedPlaces.includes(place.id) || savedPlaces.includes(String(place.id))
      );
      
      // Get full saved places from localStorage (includes nature places saved from detail screen)
      try {
        const fullSavedPlaces = JSON.parse(localStorage.getItem("saved_places") || "[]");
        // Add places that aren't in MOCK_PLACES (saved from detail screens)
        const additionalSaved = fullSavedPlaces.filter(sp => 
          !MOCK_PLACES.some(mp => mp.id === sp.id || String(mp.id) === String(sp.id))
        );
        return [...savedFromMock, ...additionalSaved];
      } catch (e) {
        return savedFromMock;
      }
    }
    if (activeFilter === 'near-me') {
      // Near Me: Progressive distance tiers with minimum 3 results rule
      // Quality constraints: only include places that passed moderation (pulseRating > 0 or no rating yet)
      const qualityFilter = (p) => !p.pulseRating || p.pulseRating >= 3.0;
      
      // Tier 1: Very close (1.5km) - Walking distance, spontaneous dates
      // Simulated by 'Tel Aviv' location
      const tier1Places = MOCK_PLACES.filter(p => 
        p.location === 'Tel Aviv' && qualityFilter(p)
      );
      if (tier1Places.length >= 3) {
        return tier1Places;
      }
      
      // Tier 2: Close (3km) - Short rides, light planning
      // Simulated by adding 'Jaffa' location
      const tier2Places = MOCK_PLACES.filter(p => 
        ['Tel Aviv', 'Jaffa'].includes(p.location) && qualityFilter(p)
      );
      if (tier2Places.length >= 3) {
        return tier2Places;
      }
      
      // Tier 3: Reasonable fallback (5km) - Still nearby and worth it
      // Simulated by adding 'Herzliya', 'Ramat Gan' locations
      const tier3Places = MOCK_PLACES.filter(p => 
        ['Tel Aviv', 'Jaffa', 'Herzliya', 'Ramat Gan'].includes(p.location) && qualityFilter(p)
      );
      if (tier3Places.length >= 3) {
        return tier3Places;
      }
      
      // Fallback: Show closest curated alternatives (never empty)
      // Include all quality places, sorted by simulated distance
      const allQualityPlaces = MOCK_PLACES.filter(qualityFilter);
      return allQualityPlaces.slice(0, Math.max(3, tier3Places.length));
    }
    if (activeFilter === 'my-workshops') {
      // Show purchased workshops
      return purchasedWorkshops;
    }
    // Category filter with cumulative AND logic
    const categoryPlaces = MOCK_PLACES.filter(place => place.category === activeFilter);
    return categoryPlaces;
  }, [activeFilter, savedPlaces, purchasedWorkshops]);

  // Sort: Unified ranking based on Pulse Rating (quality > source)
  // Community-added places are ranked TOGETHER with system places
  // Ranking is NEVER based on who added the place
  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      // 1. Pulse Rating (highest priority) - higher rating first
      const ratingA = a.pulseRating || 0;
      const ratingB = b.pulseRating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      
      // 2. Open now second
      if (a.openNow && !b.openNow) return -1;
      if (!a.openNow && b.openNow) return 1;
      
      // 3. Then with benefits (limited influence)
      if (a.hasActiveBenefit && !b.hasActiveBenefit) return -1;
      if (!a.hasActiveBenefit && b.hasActiveBenefit) return 1;
      
      // 4. Quality of reviews (more reviews = more trust)
      const reviewsA = a.pulseReviews || 0;
      const reviewsB = b.pulseReviews || 0;
      if (reviewsA !== reviewsB) return reviewsB - reviewsA;
      
      // 5. Then new
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      
      return 0;
    });
  }, [filteredPlaces]);

  // Handlers
  const handleViewPlace = useCallback((place) => {
    setSelectedPlace(place);
    // If it's a workshop, open booking dialog instead of navigating
    if (place.isWorkshop) {
      setSelectedWorkshop(place);
      setShowWorkshopBookingDialog(true);
      return;
    }
    // If it's a nature place with details, navigate to nature detail page
    if (place.category === 'nature' && place.natureDetails) {
      window.scrollTo(0, 0);
      navigate(`/nature/${place.id}`, { state: { place } });
      return;
    }
    // Navigate to business page (place detail)
    window.scrollTo(0, 0);
    navigate(`/business/${place.id}`, { state: { place } });
  }, [navigate]);

  const handleSave = useCallback((placeId) => {
    // Normalize to number for consistent comparison
    const normalizedId = typeof placeId === 'string' ? parseInt(placeId) : placeId;
    const isCurrentlySaved = savedPlaces.some(id => id === normalizedId || id === placeId || String(id) === String(placeId));
    const place = MOCK_PLACES.find(p => p.id === placeId || p.id === normalizedId);
    
    if (isCurrentlySaved) {
      // Remove from state - filter out any matching ID
      setSavedPlaces(prev => prev.filter(id => id !== normalizedId && id !== placeId && String(id) !== String(placeId)));
      setToast({ open: true, message: 'Removed from saved', severity: 'info' });
      // Remove from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
        const updated = saved.filter(p => p.id !== placeId && p.id !== normalizedId && String(p.id) !== String(placeId));
        localStorage.setItem("saved_places", JSON.stringify(updated));
      } catch (e) { console.error("Error removing saved place:", e); }
    } else {
      // Add to state
      setSavedPlaces(prev => [...prev, normalizedId]);
      setToast({ open: true, message: 'Saved!', severity: 'success' });
      // Save to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
        if (!saved.find(p => p.id === placeId || p.id === normalizedId || String(p.id) === String(placeId))) {
          saved.push({
            id: normalizedId,
            name: place?.name || "Unknown Place",
            category: place?.category || "Place",
            address: place?.address || "",
            coverImage: place?.image || "",
          });
          localStorage.setItem("saved_places", JSON.stringify(saved));
        }
      } catch (e) { console.error("Error saving place:", e); }
    }
    
    // Auto-hide toast after 2 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }));
    }, 2000);
  }, [savedPlaces]);

  const handleScanQR = useCallback((place) => {
    setSelectedPlace(place);
    setShowQRDialog(true);
  }, []);

  const handleSeeBenefits = useCallback((place) => {
    setSelectedPlace(place);
    setShowBenefitsDialog(true);
  }, []);

  // Sweet Gestures handler - opens dialog, does NOT consume free gesture yet
  const handleSendGesture = useCallback((person, gesture) => {
    // Check if user can send gesture (limits)
    const gestureStatus = canSendGesture();
    
    // If free gesture is available OR user has points, open the dialog
    // Free gesture will only be consumed when user actually SENDS
    if (gestureStatus.canSend) {
      setSelectedPerson(person);
      setSelectedGesture(gesture);
      openGestureDialog(gesture);
      return;
    }
    
    // If no free gesture and no points, show limit dialog
    setSelectedPerson(person);
    setSelectedGesture(gesture);
    setShowGestureLimitDialog(true);
  }, [canSendGesture]);
  
  // Helper to open the appropriate gesture dialog
  const openGestureDialog = useCallback((gesture) => {
    if (gesture.id === 'coffee') {
      setShowCoffeeDialog(true);
    } else if (gesture.id === 'flower') {
      setShowFlowerDialog(true);
    } else if (gesture.id === 'note') {
      setShowGiftDialog(true);
    } else if (gesture.id === 'hi') {
      setShowSayHiDialog(true);
    }
  }, []);

  // Handle coffee selection confirmation - go to payment
  const handleCoffeeConfirm = useCallback((details) => {
    setCoffeeDetails(details);
    setShowCoffeeDialog(false);
    setCurrentGestureType('coffee');
    setCurrentGestureDetails({ cafe: details.cafe, drink: details.drink, message: details.message });
    setShowPaymentDialog(true);
  }, []);

  // Handle flower selection confirmation - go to payment
  const handleFlowerConfirm = useCallback((details) => {
    setFlowerDetails(details);
    setShowFlowerDialog(false);
    setCurrentGestureType('flower');
    setCurrentGestureDetails({ shop: details.shop, flower: details.flower, message: details.message });
    setShowPaymentDialog(true);
  }, []);

  // Handle gift selection confirmation - go to payment
  const handleGiftConfirm = useCallback((details) => {
    setGiftDetails(details);
    setShowGiftDialog(false);
    setCurrentGestureType('gift');
    setCurrentGestureDetails({ category: details.category, gift: details.gift, message: details.message });
    setShowPaymentDialog(true);
  }, []);

  // Handle payment confirmation - send gesture to backend
  const handlePaymentConfirm = useCallback(async (paymentData) => {
    setShowPaymentDialog(false);
    
    // Consume free gesture NOW (only when user actually sends)
    const gestureStatus = canSendGesture();
    if (gestureStatus.canSend && gestureStatus.reason === 'free') {
      consumeGesture();
    }
    
    // Get the message from current gesture details
    const gestureMessage = currentGestureDetails?.message || '';
    
    // Save gesture message to store (will appear in chat)
    if (selectedPerson && gestureMessage) {
      addGestureMessage(selectedPerson.id, {
        gestureType: paymentData.gestureType,
        message: gestureMessage,
        details: currentGestureDetails,
      }, {
        id: selectedPerson.id,
        name: selectedPerson.name,
        age: selectedPerson.age || '',
        photoUrl: selectedPerson.avatar || selectedPerson.photoUrl || selectedPerson.image,
      });
    }
    
    // Mark gesture as sent for this person (persisted in store)
    markGestureSent(selectedPerson.id, paymentData.gestureType);
    
    // Update selected gesture for the sent dialog
    const gestureInfo = GESTURE_TYPES.find(g => g.id === paymentData.gestureType);
    setSelectedGesture(gestureInfo);
    
    // Show success dialog
    setShowGestureDialog(true);
    
    // Navigate to chat after a short delay
    setTimeout(() => {
      navigate('/chat');
    }, 1500);
  }, [selectedPerson, currentGestureDetails, addGestureMessage, markGestureSent, navigate, canSendGesture, consumeGesture]);

  // Handle Say Hi confirmation - send message
  const handleSayHiConfirm = useCallback((details) => {
    setShowSayHiDialog(false);
    
    // Consume free gesture NOW (only when user actually sends)
    const gestureStatus = canSendGesture();
    if (gestureStatus.canSend && gestureStatus.reason === 'free') {
      consumeGesture();
    }
    
    // Save message to store (will appear in chat)
    if (selectedPerson && details.message) {
      addGestureMessage(selectedPerson.id, {
        gestureType: 'sayhi',
        message: details.message,
        details: {},
      }, {
        id: selectedPerson.id,
        name: selectedPerson.name,
        age: selectedPerson.age || '',
        photoUrl: selectedPerson.avatar || selectedPerson.photoUrl || selectedPerson.image,
      });
    }
    
    // Mark hi gesture as sent for this person (persisted in store)
    markGestureSent(selectedPerson.id, 'hi');
    
    // Show success dialog
    const gestureInfo = GESTURE_TYPES.find(g => g.id === 'hi');
    setSelectedGesture(gestureInfo);
    setShowGestureDialog(true);
    
    // Navigate to chat after a short delay
    setTimeout(() => {
      navigate('/chat');
    }, 1500);
  }, [selectedPerson, addGestureMessage, markGestureSent, navigate, canSendGesture, consumeGesture]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', pb: SAFE_BOTTOM }}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={120} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} variant="rounded" width={80} height={36} sx={{ borderRadius: '18px', flexShrink: 0 }} />
            ))}
          </Box>
          {[1,2,3].map(i => (
            <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '20px', mb: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  // Fixed header height: pt:3 (24px) + h4 (~40px) + body1 (~24px) + pb:2 (16px) = ~104px + safe area
  const FIXED_HEADER_HEIGHT = 110;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafbfc',
        pb: SAFE_BOTTOM,
        position: 'relative',
      }}
    >
      {/* Fixed Header Area - Title + Filters (does NOT scroll) */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Page Title */}
        <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a2e', mb: 0.5 }}>
              {t('explore')}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Places worth stepping into
            </Typography>
          </Box>
        </Box>

        {/* Filter Chips - Fixed, stays in place */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Row 1: Main filters */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              pb: 0.5,
            }}
          >
            {FILTER_CATEGORIES_ROW1.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.id;
              return (
                <Chip
                  key={cat.id}
                  icon={<Icon size={16} />}
                  label={t(cat.labelKey)}
                  onClick={() => setActiveFilter(cat.id)}
                  sx={{
                    flexShrink: 0,
                    fontWeight: 600,
                    borderRadius: '18px',
                    bgcolor: isActive ? '#6C5CE7' : '#f1f5f9',
                    color: isActive ? '#fff' : '#64748b',
                    '& .MuiChip-icon': {
                      color: isActive ? '#fff' : '#64748b',
                    },
                    '&:hover': {
                      bgcolor: isActive ? '#5b4cdb' : '#e2e8f0',
                    },
                  }}
                />
              );
            })}
          </Box>
          {/* Row 2: Category filters */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {FILTER_CATEGORIES_ROW2.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.id;
              return (
                <Chip
                  key={cat.id}
                  icon={<Icon size={14} />}
                  label={t(cat.labelKey)}
                  onClick={() => setActiveFilter(cat.id)}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    fontWeight: 500,
                    borderRadius: '14px',
                    bgcolor: isActive ? '#6C5CE7' : '#f8fafc',
                    color: isActive ? '#fff' : '#94a3b8',
                    '& .MuiChip-icon': {
                      color: isActive ? '#fff' : '#94a3b8',
                    },
                    '&:hover': {
                      bgcolor: isActive ? '#5b4cdb' : '#f1f5f9',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Scrollable Content Area - only places scroll */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Places Feed */}
        <Box sx={{ px: 3, py: 2 }}>
        {/* Add Date Spot Button + Results count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {sortedPlaces.length} places {activeFilter !== 'all' && `in ${activeFilter.replace('-', ' ')}`}
          </Typography>
          <Button
            size="small"
            startIcon={<MapPin size={14} />}
            onClick={() => setShowAddDateSpotDialog(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#6C5CE7',
              fontSize: '0.8rem',
              '&:hover': { bgcolor: 'rgba(108,92,231,0.08)' },
            }}
          >
            Share a great date idea
          </Button>
        </Box>

        {/* Place Cards - No infinite scroll */}
        <AnimatePresence mode="popLayout">
          {sortedPlaces.map((place, index) => (
            <React.Fragment key={place.id}>
              <PlaceCard
                place={place}
                onViewPlace={handleViewPlace}
                onSave={handleSave}
                onScanQR={handleScanQR}
                onSeeBenefits={handleSeeBenefits}
                isSaved={savedPlaces.some(id => id === place.id || String(id) === String(place.id))}
                showRemoveButton={activeFilter === 'my-workshops'}
                onRemove={(id) => {
                  const updated = purchasedWorkshops.filter(w => w.id !== id);
                  setPurchasedWorkshops(updated);
                  localStorage.setItem("purchased_workshops", JSON.stringify(updated));
                  setToast({ open: true, message: 'Workshop removed', severity: 'info' });
                }}
              />
              {/* Sweet Gestures Section - appears after 3rd place */}
              {index === 2 && (
                <SweetGesturesSection 
                  people={NEARBY_PEOPLE} 
                  onSendGesture={handleSendGesture}
                  sentGestures={sentGestures}
                />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {sortedPlaces.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 48, mb: 2 }}>🔍</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
              No places found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Try a different filter
            </Typography>
          </Box>
        )}

        {/* End of list message */}
        {sortedPlaces.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              That's all for now ✨
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              Check back later for more places
            </Typography>
          </Box>
        )}
        </Box>
      </Box>

      {/* QR Scan Dialog */}
      <QRScanDialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        place={selectedPlace}
      />

      {/* Benefits Dialog */}
      <BenefitsDialog
        open={showBenefitsDialog}
        onClose={() => setShowBenefitsDialog(false)}
        place={selectedPlace}
      />

      {/* Coffee Selection Dialog */}
      <CoffeeSelectionDialog
        open={showCoffeeDialog}
        onClose={() => { setShowCoffeeDialog(false); cancelGestureProcess(); }}
        person={selectedPerson}
        onConfirm={handleCoffeeConfirm}
      />

      {/* Flower Selection Dialog */}
      <FlowerSelectionDialog
        open={showFlowerDialog}
        onClose={() => { setShowFlowerDialog(false); cancelGestureProcess(); }}
        person={selectedPerson}
        onConfirm={handleFlowerConfirm}
      />

      {/* Gift Selection Dialog */}
      <GiftSelectionDialog
        open={showGiftDialog}
        onClose={() => { setShowGiftDialog(false); cancelGestureProcess(); }}
        person={selectedPerson}
        onConfirm={handleGiftConfirm}
      />

      {/* Payment Flow Dialog */}
      <PaymentFlowDialog
        open={showPaymentDialog}
        onClose={() => { setShowPaymentDialog(false); cancelGestureProcess(); }}
        person={selectedPerson}
        gestureType={currentGestureType}
        gestureDetails={currentGestureDetails}
        onConfirmPayment={handlePaymentConfirm}
      />

      {/* Say Hi Dialog */}
      <SayHiDialog
        open={showSayHiDialog}
        onClose={() => { setShowSayHiDialog(false); cancelGestureProcess(); }}
        person={selectedPerson}
        onConfirm={handleSayHiConfirm}
      />

      {/* Gesture Sent Dialog */}
      <GestureSentDialog
        open={showGestureDialog}
        onClose={() => {
          setShowGestureDialog(false);
          setCoffeeDetails(null);
        }}
        person={selectedPerson}
        gesture={selectedGesture}
        coffeeDetails={coffeeDetails}
      />

      {/* Workshop Booking Dialog */}
      <WorkshopBookingDialog
        open={showWorkshopBookingDialog}
        onClose={() => setShowWorkshopBookingDialog(false)}
        workshop={selectedWorkshop}
        userMatches={demoMatches}
        onBook={(bookingData) => {
          // Save purchased workshop to localStorage with selected date
          const purchaseData = {
            ...bookingData.workshop,
            purchaseDate: new Date().toISOString(),
            status: 'upcoming', // 'upcoming', 'completed'
            invitedPerson: bookingData.invitedPerson,
            selectedDate: bookingData.selectedDate, // Store selected date
            workshopDetails: {
              ...bookingData.workshop.workshopDetails,
              date: bookingData.selectedDate?.date || bookingData.workshop.workshopDetails?.date,
              time: bookingData.selectedDate?.time || bookingData.workshop.workshopDetails?.time,
            },
          };
          const updated = [...purchasedWorkshops, purchaseData];
          setPurchasedWorkshops(updated);
          localStorage.setItem("purchased_workshops", JSON.stringify(updated));
          
          // If invited a match, save workshop reminder for chat
          if (bookingData.invitedPerson) {
            const workshopReminders = JSON.parse(localStorage.getItem("workshop_reminders") || "[]");
            workshopReminders.push({
              matchId: bookingData.invitedPerson.id,
              matchName: bookingData.invitedPerson.name,
              workshopName: bookingData.workshop.name,
              workshopDate: bookingData.selectedDate?.date || bookingData.workshop.workshopDetails?.date,
              workshopTime: bookingData.selectedDate?.time || bookingData.workshop.workshopDetails?.time,
              workshopLocation: bookingData.workshop.location,
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem("workshop_reminders", JSON.stringify(workshopReminders));
          }
          
          setToast({ open: true, message: 'Workshop booked successfully! 🎉', severity: 'success' });
        }}
      />

      {/* Add Date Spot Dialog (UGC) */}
      <AddDateSpotDialog
        open={showAddDateSpotDialog}
        onClose={() => setShowAddDateSpotDialog(false)}
        onSubmit={(spotData) => {
          setToast({ open: true, message: 'Date spot submitted! 50 points pending approval 🎉', severity: 'success' });
        }}
      />

      {/* Nature Place Detail Dialog */}
      <NaturePlaceDetailDialog
        open={showNaturePlaceDialog}
        onClose={() => {
          setShowNaturePlaceDialog(false);
          setSelectedNaturePlace(null);
        }}
        place={selectedNaturePlace}
        userMatches={demoMatches}
        onInviteMatch={(inviteData) => {
          // Send invite message to chat
          const message = `Hey! 🌿 Want to explore ${inviteData.place.name} together? It looks amazing!\n\n📍 ${inviteData.place.location}\n${inviteData.place.natureDetails?.entryFee?.free ? '✅ Free entry!' : `💰 Entry: ₪${inviteData.place.natureDetails?.entryFee?.adult}/person`}`;
          
          // Save to gesture messages store to appear in chat
          const gestureMessagesStore = useGestureMessagesStore.getState();
          gestureMessagesStore.addGestureMessage(inviteData.match.id, {
            id: Date.now(),
            from: 'me',
            type: 'text',
            text: message,
            timestamp: Date.now(),
            status: 'sent',
            reactions: {},
          }, {
            id: inviteData.match.id,
            name: inviteData.match.name,
            photoUrl: inviteData.match.avatar,
          });
          
          setToast({ open: true, message: `Invite sent to ${inviteData.match.name}! 🌿`, severity: 'success' });
        }}
      />

      {/* Workshop Rating Dialog */}
      <WorkshopRatingDialog
        open={showRatingDialog}
        onClose={() => {
          setShowRatingDialog(false);
          setWorkshopToRate(null);
        }}
        workshop={workshopToRate}
        onSubmit={(ratingData) => {
          // Update workshop to mark as rated
          const updated = purchasedWorkshops.map(w => 
            w.id === workshopToRate?.id 
              ? { ...w, needsRating: false, userRating: ratingData.rating, userReview: ratingData.review }
              : w
          );
          setPurchasedWorkshops(updated);
          localStorage.setItem("purchased_workshops", JSON.stringify(updated));
          setShowRatingDialog(false);
          setWorkshopToRate(null);
          setToast({ open: true, message: 'Thanks for your review! ⭐', severity: 'success' });
        }}
        onRemove={() => {
          // Remove workshop from purchased list
          const updated = purchasedWorkshops.filter(w => w.id !== workshopToRate?.id);
          setPurchasedWorkshops(updated);
          localStorage.setItem("purchased_workshops", JSON.stringify(updated));
          setWorkshopToRate(null);
          setToast({ open: true, message: 'Workshop removed from your list', severity: 'info' });
        }}
      />

      {/* Gesture Limit Reached Dialog */}
      <Dialog
        open={showGestureLimitDialog}
        onClose={() => setShowGestureLimitDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxWidth: 340,
            width: '100%',
            p: 0,
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Gift size={28} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>
            Monthly Gesture Used
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            You've used your free gesture this month. Use points or upgrade to Pulse Pro for unlimited gestures.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pointsBalance >= 60 && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  // Consume points explicitly when user clicks
                  const result = consumeGesture();
                  if (result.success) {
                    setShowGestureLimitDialog(false);
                    // Open the gesture dialog - user chose to use points
                    openGestureDialog(selectedGesture);
                  }
                }}
                sx={{
                  py: 1.25,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                }}
              >
                Use 60 Points ({pointsBalance} available)
              </Button>
            )}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setShowGestureLimitDialog(false);
                navigate('/subscriptions');
              }}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
              }}
            >
              Upgrade to Pulse Pro ✨
            </Button>
            <Button
              fullWidth
              onClick={() => setShowGestureLimitDialog(false)}
              sx={{
                py: 1,
                textTransform: 'none',
                color: '#64748b',
              }}
            >
              Maybe Later
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Toast - Bottom of screen, modern style */}
      {toast.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: toast.severity === 'success' ? '#1a1a2e' : toast.severity === 'info' ? '#475569' : '#1a1a2e',
              color: '#fff',
              borderRadius: '24px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 2.5, 
              py: 1,
            }}
          >
            {toast.severity === 'success' && <Check size={16} color="#22c55e" />}
            {toast.message}
          </Box>
        </Box>
      )}
    </Box>
  );
}
