import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { openPayPlusWindow } from '../services/payplus';
import { TAB_SCROLL_EVENT } from '../components/TabNavigation';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Collapse,
  Autocomplete,
  Badge,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Tooltip,
  Checkbox,
  MenuItem,
  Select,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MapPin,
  Calendar,
  Plus,
  SlidersHorizontal,
  CalendarClock,
  Sun,
  Music,
  Map as MapIcon,
  List as ListIcon,
  LocateFixed,
  Heart,
  HeartOff,
  Wine,
  PartyPopper,
  Users,
  TreePine,
  Mic2,
  MessageCircle,
  UserPlus,
  Sparkles,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { demoMatches } from "./MatchesScreen";
import useGestureMessagesStore from "../store/gestureMessagesStore";
import useEventInvitesStore from "../store/eventInvitesStore";
import { useAuth } from "../context/AuthContext";

const resolvePublicImageUrl = (url) => {
  if (!url) return url;
  if (typeof url === "string" && url.startsWith("/")) return `${process.env.PUBLIC_URL}${url}`;
  return url;
};

/* ----------------------------- Mock data --------------------------------- */
// Vibe types per Pulse spec
const VIBE_TYPES = ['Chill', 'Social', 'Flirty', 'Deep', 'Energetic'];

// Demo people going to events
// isMatch = mutual match (both liked each other)
// interestedInYou = they liked you but you haven't liked them back yet
export const DEMO_ATTENDEES = [
  {
    id: "a1",
    name: "Maya",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    isMatch: true,
    interestedInYou: false, // Already matched, so not in "interested" list
    gender: "female",
    age: 26,
    location: "Tel Aviv",
    jobTitle: "Product Designer",
    education: "Shenkar",
    height: 165,
    lookingFor: ["Relationship"],
    hobbies: ["Live music", "Rooftop sunsets", "Coffee"],
    photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Taurus",
    languages: ["Hebrew", "English"],
    causes: ["Environment", "Education"],
    qualities: ["Humor", "Kindness", "Openness"],
    prompts: [
      { question: "I geek out on...", answer: "Design systems and tiny UX details." },
      { question: "Perfect first date...", answer: "A walk, a coffee, and a playlist swap." },
    ],
    favoriteSongs: ["Chill Vibes", "Morning Coffee", "Workout Mix"],
    drinking: "I drink sometimes",
    smoking: "Never",
    children: "Not sure",
    religion: "Traditional",
    politics: "Moderate",
  },
  {
    id: "a2",
    name: "Noam",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    isMatch: true,
    interestedInYou: false, // Already matched
    gender: "male",
    age: 26,
    location: "Tel Aviv",
    jobTitle: "Software Engineer",
    education: "Tel Aviv University",
    height: 178,
    lookingFor: ["New connections"],
    hobbies: ["Dancing", "Running", "Sushi"],
    photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Leo",
    languages: ["Hebrew", "English"],
    causes: ["Tech for good"],
    qualities: ["Curiosity", "Confidence"],
    prompts: [
      { question: "The one thing I won't shut up about...", answer: "EDM nights and good ramen." },
      { question: "My most controversial opinion is...", answer: "Pineapple belongs on pizza." },
    ],
    favoriteSongs: ["Energy Up", "Late Night Drive"],
    drinking: "Socially",
    smoking: "Never",
    children: "Not sure",
    religion: "Secular",
    politics: "Center",
  },
  {
    id: "a3",
    name: "Amit",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: true, // Liked you, waiting for your response
    gender: "male",
    age: 28,
    location: "Ramat Gan",
    jobTitle: "Account Manager",
    education: "IDC Herzliya",
    height: 181,
    lookingFor: ["Casual"],
    hobbies: ["Food markets", "Gym", "Podcasts"],
    photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Virgo",
    languages: ["Hebrew", "English"],
    causes: ["Business", "Health"],
    qualities: ["Stability", "Humor"],
    prompts: [
      { question: "Most spontaneous thing I've done...", answer: "Booked a weekend trip the same day." },
      { question: "A green flag is...", answer: "Kindness to waiters." },
    ],
    favoriteSongs: ["Daily Focus", "Weekend Energy"],
    drinking: "Sometimes",
    smoking: "Never",
    children: "Not sure",
    religion: "Traditional",
    politics: "Moderate",
  },
  {
    id: "a4",
    name: "Shira",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: true, // Liked you, waiting for your response
    gender: "female",
    age: 26,
    location: "Givatayim",
    jobTitle: "Marketing",
    education: "Bar-Ilan",
    height: 168,
    lookingFor: ["Relationship"],
    hobbies: ["Pilates", "Brunch", "Concerts"],
    photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Aquarius",
    languages: ["Hebrew", "English"],
    causes: ["Women in tech", "Education"],
    qualities: ["Empathy", "Curiosity"],
    prompts: [
      { question: "My perfect Sunday...", answer: "Brunch, walk, and a concert at night." },
      { question: "Let's debate...", answer: "Best brunch spot in TLV." },
    ],
    favoriteSongs: ["Indie Pop", "Live Sessions"],
    drinking: "Socially",
    smoking: "Never",
    children: "Want someday",
    religion: "Secular",
    politics: "Liberal",
  },
  {
    id: "a5",
    name: "Yoni",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: true, // Liked you, waiting for your response
    gender: "male",
    age: 29,
    location: "Tel Aviv",
    jobTitle: "Founder",
    education: "Technion",
    height: 183,
    lookingFor: ["Relationship"],
    hobbies: ["Startups", "Travel", "Wine"],
    photos: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Aries",
    languages: ["Hebrew", "English"],
    causes: ["Tech for good", "Entrepreneurship"],
    qualities: ["Ambition", "Openness"],
    prompts: [
      { question: "I'm known for...", answer: "Turning ideas into reality." },
      { question: "A fun fact about me...", answer: "I can pack for a weekend in 5 minutes." },
    ],
    favoriteSongs: ["Startup Focus", "Late Night Coding"],
    drinking: "I drink sometimes",
    smoking: "Never",
    children: "Don't have",
    religion: "Secular",
    politics: "Center",
  },
  {
    id: "a6",
    name: "Noa",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    isMatch: true,
    interestedInYou: false, // Already matched
    gender: "female",
    age: 25,
    location: "Herzliya",
    jobTitle: "UX Researcher",
    education: "Bezalel",
    height: 162,
    lookingFor: ["Casual"],
    hobbies: ["Beach", "Yoga", "Festivals"],
    photos: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Libra",
    languages: ["Hebrew", "English", "French"],
    causes: ["Mental health"],
    qualities: ["Humor", "Kindness"],
    prompts: [
      { question: "Two truths and a lie...", answer: "I love yoga, I hate coffee, I can surf." },
      { question: "The quickest way to my heart...", answer: "Good music + good vibes." },
    ],
    favoriteSongs: ["Festival Mode", "Chill Beats"],
    drinking: "Rarely",
    smoking: "Never",
    children: "Not sure",
    religion: "Secular",
    politics: "Progressive",
  },
  {
    id: "a7",
    name: "Daniel",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: true, // Liked you, waiting for your response
    gender: "male",
    age: 27,
    location: "Ramat Gan",
    jobTitle: "Data Analyst",
    education: "Ben-Gurion University",
    height: 176,
    lookingFor: ["New friends"],
    hobbies: ["Board games", "Hiking", "Tech meetups"],
    photos: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Capricorn",
    languages: ["Hebrew", "English"],
    causes: ["Education"],
    qualities: ["Curiosity", "Stability"],
    prompts: [
      { question: "My ideal night...", answer: "Board games and good company." },
      { question: "I'll know it's a match if...", answer: "We can laugh at the same jokes." },
    ],
    favoriteSongs: ["Lo-Fi Focus", "Hiking Playlist"],
    drinking: "Socially",
    smoking: "Never",
    children: "Not sure",
    religion: "Traditional",
    politics: "Moderate",
  },
  {
    id: "a8",
    name: "Yael",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: false, // Just attending, no interest yet
    gender: "female",
    age: 26,
    location: "Tel Aviv",
    jobTitle: "HR",
    education: "Reichman University",
    height: 170,
    lookingFor: ["Relationship"],
    hobbies: ["Dancing", "Art", "Coffee"],
    photos: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Gemini",
    languages: ["Hebrew", "English"],
    causes: ["Animal rights"],
    qualities: ["Empathy", "Openness"],
    prompts: [
      { question: "A random skill I have...", answer: "I can spot good coffee from far away." },
      { question: "My love language is...", answer: "Quality time." },
    ],
    favoriteSongs: ["Indie Folk", "Study Focus"],
    drinking: "Sometimes",
    smoking: "Never",
    children: "Want someday",
    religion: "Secular",
    politics: "Liberal",
  },
  {
    id: "a9",
    name: "Omer",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: false, // Just attending, no interest yet
    gender: "male",
    age: 28,
    location: "Jaffa",
    jobTitle: "Photographer",
    education: "Self-taught",
    height: 180,
    lookingFor: ["Casual"],
    hobbies: ["Photography", "Food", "Movies"],
    photos: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Pisces",
    languages: ["Hebrew", "English"],
    causes: ["Arts"],
    qualities: ["Creativity", "Curiosity"],
    prompts: [
      { question: "The best photo I've ever taken...", answer: "Sunset in Jaffa." },
      { question: "My go-to comfort movie...", answer: "Anything with a great soundtrack." },
    ],
    favoriteSongs: ["Soundtrack Favorites", "Golden Hour"],
    drinking: "Socially",
    smoking: "Never",
    children: "Not sure",
    religion: "Secular",
    politics: "Center",
  },
  {
    id: "a10",
    name: "Tamar",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    isMatch: false,
    interestedInYou: false, // Just attending, no interest yet
    gender: "female",
    age: 27,
    location: "Tel Aviv",
    jobTitle: "Content Creator",
    education: "Open University",
    height: 164,
    lookingFor: ["Relationship"],
    hobbies: ["Wellness", "Live music", "Cooking"],
    photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"],
    zodiac: "Sagittarius",
    languages: ["Hebrew", "English"],
    causes: ["Wellness"],
    qualities: ["Optimism", "Confidence"],
    prompts: [
      { question: "My favorite way to recharge...", answer: "A long walk + a good playlist." },
      { question: "If I cook for you...", answer: "It means I really like you." },
    ],
    favoriteSongs: ["Feel Good", "Kitchen Dancing"],
    drinking: "Sometimes",
    smoking: "Never",
    children: "Not sure",
    religion: "Traditional",
    politics: "Moderate",
  },
];

export const EVENTS = [
  // Large parties
  { id: "lp1", title: "Summer Festival", category: "large", price: 149, date: "2027-03-28", time: "16:00", venue: "Central Park", country: "USA", region: "New York", coords: { lat: 40.7812, lng: -73.9665 }, cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-at-a-concert-4248-large.mp4", tags: ["Outdoor", "Live Music", "Dancing"], blurb: "All-day stages, food trucks and fireworks.", details: "Multiple stages, 40+ artists, VIP lounge, family area, and late-night DJ set.", badges: ["Verified"], hostedBy: "NYC Events Co.", capacity: 5000, whoFor: "Music lovers, festival goers, anyone looking for a fun summer day", vibe: "Energetic", attendees: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"] },
  { id: "lp2", title: "Mega Dance Night", category: "large", price: 99, date: "2027-03-14", time: "21:00", venue: "Sky Dome", country: "USA", region: "Metro", coords: { lat: 40.7306, lng: -73.9352 }, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-in-a-club-4819-large.mp4", tags: ["DJ", "Dancing", "Drinks"], blurb: "Top DJs with immersive light show.", details: "Doors 21:00 • Main act 23:30 • Dress code: casual chic.", badges: ["18+"], hostedBy: "NightLife Productions", capacity: 2000, whoFor: "EDM fans, night owls, people who love to dance", vibe: "Energetic", attendees: ["a2", "a4", "a8", "a9"] },
  // Small / Private
  { id: "sp1", title: "Private Loft Party", category: "small", price: 60, date: "2027-03-15", time: "20:00", venue: "Maple St. 123", country: "USA", region: "Uptown", coords: { lat: 40.7644, lng: -73.9747 }, cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop", tags: ["Social", "Drinks"], blurb: "Intimate house vibes, 80 guests max.", details: "BYOB, rooftop chill zone, quiet room available.", badges: ["New"], hostedBy: "The Loft Collective", capacity: 80, whoFor: "People seeking intimate connections in a relaxed setting", vibe: "Flirty", attendees: ["a1", "a2"] },
  { id: "sp2", title: "Acoustic Night", category: "small", price: 45, date: "2027-03-20", time: "20:30", venue: "Indie Bar", country: "USA", region: "City Center", coords: { lat: 40.741, lng: -73.9897 }, cover: "https://images.unsplash.com/photo-1464375117522-1311dd6d0cd2?q=80&w=1600&auto=format&fit=crop", tags: ["Live Music", "Social"], blurb: "Unplugged sets & candlelight atmosphere.", details: "Limited seating • First set at 20:30 • Open mic at 22:30.", hostedBy: "Indie Sessions", capacity: 50, whoFor: "Music appreciators, acoustic lovers, creative souls", vibe: "Chill", attendees: ["a3"] },
  // Events with a Twist
  { id: "tw1", title: "Night Food Market", category: "twist", price: 0, date: "2027-03-19", time: "18:00", venue: "Downtown Plaza", country: "USA", region: "Downtown", coords: { lat: 40.7128, lng: -74.006 }, cover: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-people-walking-by-a-food-stand-at-night-4401-large.mp4", tags: ["Outdoor", "Social"], blurb: "Global cuisines, live demos, indie bands.", details: "30+ vendors, vegan options, chef talks, tasting bracelets available.", badges: ["Family"], hostedBy: "Foodies United", capacity: 1000, whoFor: "Food enthusiasts, social butterflies, anyone hungry", vibe: "Social", attendees: ["a1", "a4", "a5"] },
  { id: "tw2", title: "Museum Late Hours", category: "twist", price: 30, date: "2027-03-16", time: "19:00", venue: "City Museum", country: "USA", region: "Museum District", coords: { lat: 40.7794, lng: -73.9632 }, cover: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1600&auto=format&fit=crop", tags: ["Talks", "Social"], blurb: "Special curation + ambient DJ set.", details: "Guided tours every hour • Café open till midnight.", hostedBy: "City Museum", capacity: 300, whoFor: "Art lovers, curious minds, those seeking deeper conversations", vibe: "Deep", attendees: ["a2", "a3"] },
  // Sports
  { id: "spx1", title: "Tennis Tournament", category: "sports", price: 70, date: "2027-03-13", time: "10:00", venue: "Grand Arena", country: "USA", region: "Sports Park", coords: { lat: 40.8296, lng: -73.9262 }, cover: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Social"], blurb: "Quarterfinals • Center court seats available.", details: "Gates 10:00 • No outside drinks • Family bundle discounts.", hostedBy: "Sports League", capacity: 800, whoFor: "Sports fans, tennis enthusiasts", vibe: "Energetic", attendees: [] },
  { id: "spx2", title: "Sunset 5K Run", category: "sports", price: 35, date: "2027-03-29", time: "19:00", venue: "Beachfront", country: "USA", region: "Beach", coords: { lat: 40.583, lng: -73.8283 }, cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Social"], blurb: "Scenic route along the coast, medals for finishers.", details: "Packet pickup from 16:00 • Start 19:00 • Hydration stations.", hostedBy: "Run Club", capacity: 500, whoFor: "Runners, fitness lovers, sunset chasers", vibe: "Energetic", attendees: ["a5"] },
  // Tel Aviv venue-specific events (for Explore places)
  { id: "tlv1", title: "Underground Beats @ Kuli Alma", category: "large", price: 80, date: "2027-03-21", time: "23:00", venue: "Kuli Alma", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0636, lng: 34.7705 }, cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop", tags: ["DJ", "Dancing", "Underground"], blurb: "Eclectic DJ sets in Tel Aviv's iconic underground venue.", details: "Doors 23:00 • Multiple rooms • Art installations.", badges: ["18+"], hostedBy: "Kuli Alma", capacity: 400, whoFor: "Alternative music lovers, night owls", vibe: "Energetic", attendees: ["a1", "a2"] },
  { id: "tlv2", title: "Techno Warehouse @ The Block", category: "large", price: 120, date: "2027-03-27", time: "23:30", venue: "The Block", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0500, lng: 34.7600 }, cover: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1600&auto=format&fit=crop", tags: ["Techno", "Dancing", "International DJs"], blurb: "World-class techno in Tel Aviv's premier club.", details: "International headliner • Funktion-One sound • Till sunrise.", badges: ["18+", "Verified"], hostedBy: "The Block TLV", capacity: 1500, whoFor: "Techno enthusiasts, serious dancers", vibe: "Energetic", attendees: ["a3", "a4"] },
  { id: "tlv3", title: "Chill Vibes @ Sputnik", category: "small", price: 0, date: "2027-03-17", time: "21:00", venue: "Sputnik", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0700, lng: 34.7750 }, cover: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1600&auto=format&fit=crop", tags: ["Social", "Drinks", "Casual"], blurb: "Laid-back evening at Tel Aviv's favorite dive bar.", details: "No cover • Great drinks • Meet new people.", badges: [], hostedBy: "Sputnik Bar", capacity: 100, whoFor: "Casual drinkers, social butterflies", vibe: "Chill", attendees: ["a1", "a5"] },
  { id: "tlv4", title: "Live Jazz @ Pastel", category: "small", price: 50, date: "2027-03-24", time: "20:30", venue: "Pastel", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0720, lng: 34.7800 }, cover: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop", tags: ["Live Music", "Jazz", "Intimate"], blurb: "Intimate jazz performance in candlelit setting.", details: "Limited seating • Two sets • Wine bar open.", hostedBy: "Pastel TLV", capacity: 60, whoFor: "Jazz lovers, romantic date night", vibe: "Chill", attendees: ["a2", "a3"] },
  { id: "tlv5", title: "Rooftop Party @ Beit Maariv", category: "large", price: 70, date: "2027-03-22", time: "22:00", venue: "Beit Maariv", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0680, lng: 34.7850 }, cover: "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?q=80&w=1600&auto=format&fit=crop", tags: ["Rooftop", "Dancing", "Views"], blurb: "Dance under the stars with city views.", details: "Multiple floors • Rooftop bar • Dress to impress.", badges: ["18+"], hostedBy: "Beit Maariv", capacity: 500, whoFor: "Party lovers, rooftop enthusiasts", vibe: "Energetic", attendees: ["a4", "a5"] },
  { id: "tlv6", title: "Open Mic @ Anna Loulou", category: "small", price: 30, date: "2027-03-18", time: "21:00", venue: "Anna Loulou", country: "Israel", region: "Jaffa", coords: { lat: 32.0530, lng: 34.7550 }, cover: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1600&auto=format&fit=crop", tags: ["Live Music", "Open Mic", "Alternative"], blurb: "Showcase your talent at Jaffa's legendary bar.", details: "Sign up from 20:00 • All genres welcome • Great cocktails.", hostedBy: "Anna Loulou Bar", capacity: 80, whoFor: "Musicians, artists, creative souls", vibe: "Social", attendees: ["a1", "a3"] },
  { id: "tlv7", title: "Sunset Sessions @ Teder.fm", category: "small", price: 0, date: "2027-03-15", time: "17:00", venue: "Teder.fm", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0580, lng: 34.7650 }, cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Radio", "Chill"], blurb: "Live radio broadcast with sunset drinks.", details: "Free entry • Food trucks • Chill vibes till late.", badges: ["Family"], hostedBy: "Teder.fm", capacity: 200, whoFor: "Music lovers, sunset chasers", vibe: "Chill", attendees: ["a2", "a4"] },
  { id: "tlv8", title: "Levinsky Food Fest @ Spicehaus", category: "twist", price: 0, date: "2027-03-30", time: "18:00", venue: "Spicehaus", country: "Israel", region: "Tel Aviv", coords: { lat: 32.0620, lng: 34.7720 }, cover: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1600&auto=format&fit=crop", tags: ["Food", "Social", "Market"], blurb: "Culinary journey through Levinsky Market.", details: "Tasting menu • Chef demos • Live music.", badges: ["Family"], hostedBy: "Spicehaus", capacity: 150, whoFor: "Foodies, culture lovers", vibe: "Social", attendees: ["a1", "a5"] },
];

/* --------------------------- Tabs meta -------------------------------- */
const BASE_TABS = [
  { key: "large", label: "Large Parties" },
  { key: "small", label: "Small / Private" },
  { key: "twist", label: "Events with a Twist" },
  { key: "sports", label: "Sports" },
];
const EXTRA_TABS = [
  { key: "saved", label: "Saved" },
  { key: "purchased", label: "Purchased" },
];
const ALL_TABS = [...BASE_TABS, ...EXTRA_TABS];

/* ------------------------- Utils ---------------------------- */
function Row({ icon: Icon, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
      <Icon size={16} aria-hidden />
      <Typography variant="body2" noWrap>{children}</Typography>
    </Stack>
  );
}
const fmtDate = (s) => new Date(s).toLocaleDateString();

// Pulse-style date format: "Thu · May 30 · 21:00"
const fmtPulseDate = (dateStr, time = "21:00") => {
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()} · ${time}`;
};

// Check if event is happening today
const isHappeningTonight = (dateStr) => isSameYMD(new Date(dateStr), new Date());

// Pulse spec: 30 days window, 15-25 events max
const EVENTS_WINDOW_DAYS = 30;
const EVENTS_MAX_COUNT = 25;
const PAST_EVENT_VISIBILITY_HOURS = 24;

// Get event end datetime (uses end_datetime if available, otherwise date + time + 3 hours default duration)
const getEventEndTime = (ev) => {
  if (ev.end_datetime) return new Date(ev.end_datetime);
  const startTime = ev.time || "20:00";
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date(ev.date);
  endDate.setHours(hours + 3, minutes, 0, 0); // Default 3 hour duration
  return endDate;
};

// Check if event is past (now > end_datetime)
const isEventPast = (ev) => {
  const endTime = getEventEndTime(ev);
  return new Date() > endTime;
};

// Check if past event is still within 24h visibility window
const isPastEventVisible = (ev) => {
  if (!isEventPast(ev)) return true; // Not past, always visible
  const endTime = getEventEndTime(ev);
  const visibilityEnd = new Date(endTime.getTime() + PAST_EVENT_VISIBILITY_HOURS * 60 * 60 * 1000);
  return new Date() <= visibilityEnd;
};

// Check if event should be expired (past + beyond 24h window)
const isEventExpired = (ev) => {
  if (!isEventPast(ev)) return false;
  return !isPastEventVisible(ev);
};

// Filter events within 30 days window (excludes expired events)
const isWithin30Days = (dateStr) => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + EVENTS_WINDOW_DAYS);
  return eventDate >= today && eventDate <= thirtyDaysLater;
};

// Vibe icons mapping
const VIBE_ICONS = {
  'Live Music': { icon: Music, color: '#dc2626' },
  'Drinks': { icon: Wine, color: '#7c3aed' },
  'Dancing': { icon: PartyPopper, color: '#6C5CE7' },
  'Social': { icon: Users, color: '#0ea5e9' },
  'Outdoor': { icon: TreePine, color: '#16a34a' },
  'DJ': { icon: Mic2, color: '#f59e0b' },
  'Talks': { icon: MessageCircle, color: '#6366f1' },
};

// "Good Match" copy options
const GOOD_MATCH_COPY = [
  "Looks like your kind of evening.",
  "Feels very… you.",
  "Matches your usual energy.",
  "Your vibe tends to show up here.",
];
const isSameYMD = (d1, d2) => d1.getFullYear()===d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate();
const isWeekend = (d) => { const day = d.getDay(); return day === 5 || day === 6; };
const haversineKm = (a, b) => {
  if (!a || !b) return Infinity;
  const R = 6371, dLat=((b.lat-a.lat)*Math.PI)/180, dLng=((b.lng-a.lng)*Math.PI)/180;
  const lat1=(a.lat*Math.PI)/180, lat2=(b.lat*Math.PI)/180;
  const c = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(c), Math.sqrt(1-c));
};
// טקסט לכתובת
const eventAddress = (ev) => [ev.venue, ev.region, ev.country].filter(Boolean).join(", ");
// Google Maps: רשימה (עד 9 נק')
function buildGoogleMapsUrl(list, userLocation) {
  const maxPts = 9;
  const addrs = list.slice(0, maxPts).map(eventAddress).filter(Boolean);
  if (!addrs.length) return null;
  const dest = encodeURIComponent(addrs[0]);
  const waypoints = addrs.length > 1 ? `&waypoints=${encodeURIComponent(addrs.slice(1).join("|"))}` : "";
  const origin = userLocation ? `&origin=${encodeURIComponent(`${userLocation.lat},${userLocation.lng}`)}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}${waypoints}`;
}
// Google Maps: אירוע ראשי + יתר האירועים
function buildMapsUrlWithPrimary(primary, allEvents, userLocation) {
  const others = allEvents.filter((e) => e.id !== primary.id);
  const ordered = [primary, ...others];
  return buildGoogleMapsUrl(ordered, userLocation);
}
// Google Calendar template URL (add directly)
function googleCalendarUrl(ev) {
  const start = new Date(ev.date + "T20:00:00");
  const end   = new Date(ev.date + "T23:00:00");
  const pad = (n) => String(n).padStart(2,"0");
  const toUTC = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const dates = `${toUTC(start)}/${toUTC(end)}`;
  const base  = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = [
    `text=${encodeURIComponent(ev.title)}`,
    `details=${encodeURIComponent(ev.details || "")}`,
    `location=${encodeURIComponent(eventAddress(ev))}`,
    `dates=${dates}`,
  ].join("&");
  return `${base}&${params}`;
}

/* ----------------------------- Event Card (Pulse Spec) -------------------------------- */
function EventCard({ ev, onBuy, onToggleFav, isFav, onOpenCalendar, onOpenMaps, distanceKm, onInvitePlus1, showGoodMatch, onViewDetails, plusOnePartner }) {
  const [open, setOpen] = useState(false);
  
  // Check if event is past
  const isPast = isEventPast(ev);
  
  // Status badge logic - Past takes priority - white bg with purple text/border style
  const getStatusBadge = () => {
    if (isPast) return { label: "Past", color: "#6b7280", bg: "rgba(255,255,255,0.95)" };
    if (isHappeningTonight(ev.date)) return { label: "Happening tonight", color: "#6C5CE7", bg: "rgba(255,255,255,0.95)" };
    if (ev.soldOut) return { label: "Sold out", color: "#6b7280", bg: "rgba(255,255,255,0.95)" };
    if (ev.price === 0) return { label: "Free", color: "#6C5CE7", bg: "rgba(255,255,255,0.95)" };
    return { label: "Paid", color: "#6C5CE7", bg: "rgba(255,255,255,0.95)" };
  };
  const status = getStatusBadge();

  // Get vibe icons for this event
  const vibeIcons = (ev.tags || []).filter(tag => VIBE_ICONS[tag]).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)", 
          overflow: "hidden", 
          bgcolor: "#fff", 
          position: "relative",
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0,0,0,0.06)',
          outline: 'none',
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' },
          // Visual de-emphasis for past events
          ...(isPast && {
            opacity: 0.7,
            filter: 'grayscale(30%)',
          }),
          '&:hover': {
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            borderColor: 'rgba(0,0,0,0.1)',
          },
        }}
      >
      {/* Save button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
      >
        <Tooltip title={isFav ? "Remove from saved" : "Save"} placement="left" arrow>
          <IconButton
            aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggleFav?.(ev.id); 
              if (navigator?.vibrate) navigator.vibrate(10);
            }}
            size="small"
            sx={{ 
              bgcolor: isFav ? "#6C5CE7" : "rgba(255,255,255,0.95)", 
              color: isFav ? "#fff" : "#6C5CE7", 
              backdropFilter: 'blur(12px)',
              boxShadow: isFav ? "0 4px 16px rgba(102,126,234,0.4)" : "0 4px 12px rgba(0,0,0,0.12)",
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: isFav ? "#5568d3" : "white",
                transform: 'rotate(10deg)',
              },
            }}
          >
            {isFav ? <HeartOff size={16} /> : <Heart size={16} fill="none" />}
          </IconButton>
        </Tooltip>
      </motion.div>

      {/* "Good Match for You" badge - at top of image */}
      {showGoodMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
        >
          <Box sx={{ 
            position: "absolute", 
            top: 8, 
            left: 8, 
            zIndex: 2, 
            px: 1.5, 
            py: 0.5, 
            borderRadius: "8px", 
            background: "#fff", 
            color: "#6C5CE7", 
            fontSize: "0.7rem", 
            fontWeight: 600, 
            display: "flex", 
            alignItems: "center", 
            gap: 0.5,
            border: '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <Sparkles size={11} />
            {GOOD_MATCH_COPY[Math.floor(Math.random() * GOOD_MATCH_COPY.length)]}
          </Box>
        </motion.div>
      )}

      {/* Status badge - below save button */}
      <motion.div
        initial={{ scale: 0, x: -20 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <Box sx={{ 
          position: "absolute", 
          top: showGoodMatch ? 44 : 8, 
          left: 8, 
          zIndex: 2, 
          px: 1.5, 
          py: 0.5, 
          borderRadius: "8px", 
          bgcolor: status.bg, 
          color: status.color, 
          fontSize: "0.75rem", 
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${status.color}30`,
          boxShadow: `0 2px 8px ${status.color}20`,
        }}>
          {status.label}
        </Box>
      </motion.div>

      <CardActionArea 
        onClick={() => onViewDetails ? onViewDetails(ev) : setOpen((v) => !v)}
        sx={{
          outline: 'none',
          '&:focus': { outline: 'none', backgroundColor: 'transparent' },
          '&:focus-visible': { outline: 'none', backgroundColor: 'transparent' },
          '&.Mui-focusVisible': { outline: 'none', backgroundColor: 'transparent' },
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
          '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0.02 },
          '& .MuiCardActionArea-focusHighlight': { backgroundColor: 'rgba(0,0,0,0.5)' },
        }}
      >
        {/* Video loop (muted) or cover image per Pulse spec */}
        {ev.videoUrl ? (
          <Box sx={{ height: 180, overflow: 'hidden', position: 'relative' }}>
            <video
              src={ev.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              poster={resolvePublicImageUrl(ev.cover)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ) : (
          ev.cover && <CardMedia component="img" height="180" image={resolvePublicImageUrl(ev.cover)} alt={ev.title} loading="lazy" style={{ objectFit: "cover" }} />
        )}
        <CardContent sx={{ pb: 1 }}>
          {/* Title */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 900, 
              mb: 0.5,
              color: '#1a1a2e',
            }} 
            noWrap
          >
            {ev.title}
          </Typography>

          {!!plusOnePartner?.name && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'block', mb: 0.5 }}>
              Going with +1: {plusOnePartner.name}
            </Typography>
          )}

          {/* Pulse-style date: Thu · May 30 · 21:00 */}
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {fmtPulseDate(ev.date, ev.time || "20:00")}
          </Typography>

          {/* Location (general only - city/region per spec) */}
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {ev.region || ev.venue}
            {typeof distanceKm === "number" && isFinite(distanceKm) && ` · ${distanceKm.toFixed(1)} km`}
          </Typography>

          {/* Vibe icons (descriptive, not filters per spec) */}
          {vibeIcons.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
              {vibeIcons.map((tag) => {
                const vibe = VIBE_ICONS[tag];
                const Icon = vibe.icon;
                return (
                  <Box key={tag} sx={{ display: "flex", alignItems: "center", gap: 0.25, color: vibe.color, fontSize: "0.7rem" }}>
                    <Icon size={12} />
                    <span>{tag}</span>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Regular tags for non-vibe tags */}
          {!!ev.tags?.filter(t => !VIBE_ICONS[t]).length && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }} flexWrap="wrap">
              {ev.tags.filter(t => !VIBE_ICONS[t]).slice(0, 3).map((t) => <Chip key={t} size="small" label={t} sx={{ fontSize: "0.65rem" }} />)}
            </Stack>
          )}

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{ev.details}</Typography>
          </Collapse>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack spacing={1} sx={{ width: "100%" }}>
          <Stack direction="row" spacing={1}>
            {/* Primary CTA - context dependent */}
            <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="small" 
                variant="contained" 
                fullWidth 
                onClick={() => {
                  onBuy(ev);
                  if (navigator?.vibrate) navigator.vibrate([10, 5, 10]);
                }}
                disabled={ev.soldOut || isPast}
                sx={{ 
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)', 
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)',
                    boxShadow: '0 6px 16px rgba(108,92,231,0.4)',
                  },
                  '&:disabled': {
                    background: '#e5e7eb',
                    color: '#9ca3af',
                  },
                }}
              >
                {isPast ? "EVENT ENDED" : ev.soldOut ? "SOLD OUT" : ev.price === 0 ? "JOIN" : "BUY TICKET"}
              </Button>
            </motion.div>
          </Stack>
          <Stack direction="row" spacing={1}>
            {/* +1 (Bring someone) - always visible per spec */}
            <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<UserPlus size={14} />}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onInvitePlus1?.(ev); 
                  if (navigator?.vibrate) navigator.vibrate(8);
                }}
                sx={{ 
                  flex: 1, 
                  fontSize: "0.75rem", 
                  fontWeight: 600,
                  borderColor: "rgba(108,92,231,0.3)", 
                  color: "#6C5CE7", 
                  background: "rgba(108,92,231,0.08)", 
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: "rgba(108,92,231,0.12)",
                    borderColor: "#6C5CE7",
                  } 
                }}
              >
                +1
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => {
                  onOpenCalendar?.(ev);
                  if (navigator?.vibrate) navigator.vibrate(8);
                }} 
                sx={{ 
                  minWidth: 'auto', 
                  px: 1.5, 
                  borderColor: "rgba(108,92,231,0.3)", 
                  color: "#6C5CE7", 
                  background: "rgba(108,92,231,0.08)", 
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: "rgba(108,92,231,0.12)",
                    borderColor: "#6C5CE7",
                  } 
                }}
              >
                <Calendar size={14} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => {
                  onOpenMaps?.(ev);
                  if (navigator?.vibrate) navigator.vibrate(8);
                }} 
                sx={{ 
                  minWidth: 'auto', 
                  px: 1.5, 
                  borderColor: "rgba(108,92,231,0.3)", 
                  color: "#6C5CE7", 
                  background: "rgba(108,92,231,0.08)", 
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    background: "rgba(108,92,231,0.12)",
                    borderColor: "#6C5CE7",
                  } 
                }}
              >
                <MapPin size={14} />
              </Button>
            </motion.div>
          </Stack>
        </Stack>
      </CardActions>
    </Card>
    </motion.div>
  );
}

/* -------------------------- Category Section ----------------------------- */
function CategorySection({ title, events, onBuy, favs, onToggleFav, onOpenCalendar, userLocation, onOpenMaps, onInvitePlus1, onViewDetails }) {
  // "Good Match" badge shows on ~30% of events, randomly - must be before early return
  const goodMatchIds = useMemo(() => {
    if (!events?.length) return new Set();
    const shuffled = [...events].sort(() => Math.random() - 0.5);
    return new Set(shuffled.slice(0, Math.ceil(events.length * 0.3)).map(e => e.id));
  }, [events]);

  if (!events?.length) return null;
  
  return (
    <Box sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 4,
                height: 32,
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 900,
                color: '#1a1a2e',
              }}
            >
              {title}
            </Typography>
          </Box>
          <Chip 
            label={`${events.length} events`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: '#f1f5f9',
              color: '#64748b',
              border: 'none',
            }}
          />
        </Stack>
      </motion.div>
      <Grid container spacing={2.5}>
        {events.map((ev) => {
          const distanceKm = userLocation && ev.coords ? haversineKm(userLocation, ev.coords) : undefined;
          return (
            <Grid key={ev.id} item xs={12} sm={6} md={4}>
              <EventCard
                ev={ev}
                onBuy={onBuy}
                onToggleFav={onToggleFav}
                isFav={favs.has(ev.id)}
                onOpenCalendar={onOpenCalendar}
                onOpenMaps={(primary) => onOpenMaps(primary)}
                distanceKm={distanceKm}
                onInvitePlus1={onInvitePlus1}
                showGoodMatch={goodMatchIds.has(ev.id)}
                onViewDetails={onViewDetails}
              />
            </Grid>
          );
        })}
      </Grid>
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
}

/* ------------------------ Swipe Deck (Purchased) ------------------------- */
function SwipeDeck({ users, onLike, onSkip, onOpenProfile }) {
  const [deck, setDeck] = useState(users || []);
  useEffect(() => setDeck(users || []), [users]);

  const handleSwipe = (u, dir) => {
    setDeck((d) => d.filter((x) => x.id !== u.id));
    dir === "right" ? onLike?.(u) : onSkip?.(u);
  };

  // מציגים 3 עליונות בלבד לשכבות יפות
  const top = deck.slice(0, 3);

  return (
    <Box sx={{ position: "relative", height: { xs: 210, sm: 230 } }}>
      {top.map((u, i) => {
        const isTop = i === 0;
        const z = 10 - i;
        const yOffset = i * 10;
        return (
          <motion.div
            key={u.id}
            drag={isTop ? "x" : false}
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x);
              const dir = info.offset.x > 0 ? "right" : "left";
              if (power > 160) {
                handleSwipe(u, dir);
              }
            }}
            whileTap={{ scale: isTop ? 1.02 : 1 }}
            style={{
              position: "absolute",
              inset: 0,
              y: yOffset,
              zIndex: z,
            }}
          >
            <Card
              sx={{
                minHeight: { xs: 190, sm: 210 },
                overflow: "hidden",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
                bgcolor: "#fff",
                border: "1px solid rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "row",
                cursor: 'pointer',
              }}
              onClick={() => onOpenProfile?.(u)}
            >
              <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.25 }}>
                  {u.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mb: 0.75,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.bio}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Attends: {(u.eventIds || []).map((id)=>EVENTS.find(e=>e.id===id)?.title).filter(Boolean).join(", ")}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pt: 1.25 }}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={(e) => { e.stopPropagation(); handleSwipe(u, "right"); }}
                      sx={{
                        borderRadius: "10px",
                        py: 0.75,
                        textTransform: "none",
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #5a4bd1 0%, #9333ea 100%)" },
                      }}
                    >
                      Like
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleSwipe(u, "left"); }}
                      sx={{
                        borderRadius: "10px",
                        py: 0.75,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#e2e8f0",
                        color: "#64748b",
                        "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                      }}
                    >
                      Skip
                    </Button>
                  </Box>
                </Box>
              </CardContent>

              <Box
                sx={{
                  width: 140,
                  minWidth: 140,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "0 20px 20px 0",
                }}
                onClick={(e) => { e.stopPropagation(); onOpenProfile?.(u); }}
              >
                <Box
                  component="img"
                  src={u.photo || "https://via.placeholder.com/500x300"}
                  alt={u.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/500x300";
                  }}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Card>
          </motion.div>
        );
      })}
      {deck.length === 0 && (
        <Alert severity="success" sx={{ position: "absolute", inset: 0, m: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          No more people – come back later!
        </Alert>
      )}
    </Box>
  );
}

/* --------------------------- Purchase Dialog ----------------------------- */
function TicketPurchaseDialog({ open, onClose, event, onPurchased }) {
  const [qty, setQty] = useState(1);

  const price = Number(event?.price || 0);
  const total = Math.max(1, Number(qty || 1)) * price;

  const handlePayWithPayPlus = () => {
    // Open PayPlus payment page
    openPayPlusWindow({
      type: 'event',
      itemId: String(event?.id),
      itemName: event?.title || 'Event Ticket',
      amount: price,
      quantity: qty,
      description: `Ticket for ${event?.title}`,
      metadata: {
        eventId: event?.id,
        eventTitle: event?.title,
        eventDate: event?.date,
      },
    });
    
    // Mark as purchased (in production, this would happen after payment confirmation)
    onPurchased?.(String(event?.id));
    onClose?.({ ok: true, eventId: event.id, qty, total });
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose?.(null)} 
      maxWidth="xs"
      PaperProps={{
        sx: {
          maxHeight: '72vh',
          width: '320px',
          m: 'auto',
          borderRadius: '14px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
      }}
    >
      <DialogTitle sx={{ py: 1.5, px: 2, fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}>
        Purchase Tickets
      </DialogTitle>
      <DialogContent sx={{ py: 1.5, px: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{event?.title}</Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>{event?.date} • {event?.venue}</Typography>
          </Box>
          
          <TextField 
            label="Quantity" 
            type="number" 
            value={qty} 
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} 
            inputProps={{ min: 1 }} 
            fullWidth 
            size="small" 
          />
          
          <Divider />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: '#64748b' }}>Price per ticket:</Typography>
            <Typography sx={{ fontWeight: 600 }}>₪{price.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Total:</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#6C5CE7' }}>₪{total.toFixed(2)}</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ py: 1.5, px: 2, flexDirection: 'column', gap: 1 }}>
        <Button 
          onClick={handlePayWithPayPlus} 
          variant="contained" 
          fullWidth
          sx={{ 
            py: 1.25,
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)' },
          }}
        >
          Buy Ticket
        </Button>
        <Button 
          onClick={() => onClose?.(null)} 
          color="inherit" 
          fullWidth
          sx={{ fontSize: '0.85rem' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* --------------------------- +1 Invite Dialog (Pulse Spec) ----------------------------- */
function PlusOneInviteDialog({ open, onClose, event, matches = [], purchased }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [payForInvitee, setPayForInvitee] = useState(false);
  const isPurchased = purchased?.has(event?.id);
  
  const sendInvite = () => {
    if (!selectedMatch) return;
    // In real app, this would send through internal messaging
    onClose?.({ 
      sent: true, 
      matchId: selectedMatch, 
      paidByInviter: !!payForInvitee,
      eventId: event?.id,
      eventTitle: event?.title,
      eventDate: event?.date,
      eventVenue: event?.venue,
      eventCover: event?.cover,
      eventTime: event?.time,
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose?.(null)} 
      maxWidth="xs"
      PaperProps={{
        sx: {
          maxHeight: '75vh',
          width: '340px',
          m: 'auto',
          borderRadius: '14px',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, py: 1.25, px: 2, fontSize: '0.9rem' }}>
        Invite to {event?.title}
      </DialogTitle>
      <DialogContent dividers sx={{ py: 1.25, px: 2 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: 'block', mb: 1 }}>
          {isPurchased 
            ? "I'm already going — want to come with me?"
            : "Thinking of going to this — want to join?"}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={payForInvitee}
              onChange={(e) => setPayForInvitee(e.target.checked)}
            />
          }
          label={<Typography variant="caption">I’ll buy your ticket too</Typography>}
          sx={{ mb: 1, alignItems: 'center' }}
        />
        
        {matches.length === 0 ? (
          <Alert severity="info" sx={{ py: 0.5, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
            No matches yet. Start connecting first!
          </Alert>
        ) : (
          <Stack spacing={0.75}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Select a match:</Typography>
            {matches.map((m) => (
              <Box 
                key={m.id}
                onClick={() => setSelectedMatch(m.id)}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  border: selectedMatch === m.id ? "2px solid #d1d5db" : "1px solid #e5e7eb",
                  bgcolor: selectedMatch === m.id ? "rgba(108,92,231,0.05)" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box 
                  component="img"
                  src={resolvePublicImageUrl(m.photoUrl)}
                  alt={m.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/64";
                  }}
                  sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#e5e7eb", flexShrink: 0, objectFit: 'cover' }} 
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{m.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.interests?.slice(0, 3).join(', ') || m.tagline}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ py: 0.75, px: 1.5 }}>
        <Button onClick={() => onClose?.(null)} color="inherit" size="small" sx={{ fontSize: '0.75rem' }}>Cancel</Button>
        <Button 
          onClick={sendInvite} 
          variant="contained" 
          disabled={!selectedMatch}
          size="small"
          startIcon={<UserPlus size={14} />}
          sx={{ fontSize: '0.75rem' }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* --------------------------- Event Details Dialog (Pulse Spec) ----------------------------- */
function EventDetailsDialog({ open, onClose, event, purchased, onBuy, onInvitePlus1, onSave, isSaved }) {
  if (!event) return null;
  
  const isPurchased = purchased?.has(event.id);
  const eventAttendees = (event.attendees || []).map(id => DEMO_ATTENDEES.find(a => a.id === id)).filter(Boolean);
  // Sort: matches first per spec
  const sortedAttendees = [...eventAttendees].sort((a, b) => (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0));
  
  const vibeColors = {
    Chill: '#0ea5e9',
    Social: '#22c55e', 
    Flirty: '#6C5CE7',
    Deep: '#8b5cf6',
    Energetic: '#f59e0b',
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs"
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
      PaperProps={{ 
        sx: { 
          borderRadius: '14px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.06)',
          maxHeight: '80vh',
          width: '340px',
          margin: 'auto',
          overflowY: 'auto',
        },
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.3 },
      }}
    >
      {/* Hero - Video or Image */}
      <Box sx={{ position: 'relative' }}>
        {event.videoUrl ? (
          <video
            src={event.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={event.cover}
            style={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        ) : (
          <Box
            component="img"
            src={event.cover}
            alt={event.title}
            sx={{ width: '100%', height: 160, objectFit: 'cover' }}
          />
        )}
        <IconButton 
          onClick={onClose} 
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
        >
          <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
            {event.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {fmtPulseDate(event.date, event.time || "20:00")}
          </Typography>
        </CardContent>
        
        {/* Location (general only per spec) */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
          <MapPin size={16} />
          <Typography variant="body2">{event.region || event.venue}</Typography>
        </Stack>

        {/* Neighborhood-level map per Pulse spec (zoom 14 = neighborhood level) */}
        {event.coords && (
          <Box sx={{ mt: 1.25, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
            <iframe
              title="Event location"
              width="100%"
              height="120"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps?q=${event.coords.lat},${event.coords.lng}&z=15&output=embed`}
            />
          </Box>
        )}

        {/* Vibe badge */}
        {event.vibe && (
          <Chip 
            label={event.vibe}
            size="small"
            sx={{ 
              mt: 1.5, 
              bgcolor: `${vibeColors[event.vibe]}15`,
              color: vibeColors[event.vibe],
              fontWeight: 600,
            }}
          />
        )}

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {event.details || event.blurb}
        </Typography>

        {/* Event Info */}
        <Stack spacing={1.5}>
          {event.hostedBy && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Hosted by</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.hostedBy}</Typography>
            </Box>
          )}
          
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Price</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {event.price === 0 ? 'Free' : `₪${event.price}`}
              </Typography>
            </Box>
            {event.capacity && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Capacity</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.capacity} people</Typography>
              </Box>
            )}
          </Stack>

          {/* Who's it for (informational only per spec) */}
          {event.whoFor && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Who's it for</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {event.whoFor}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* People Going - visible only after joining per spec */}
        {isPurchased && sortedAttendees.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              People you might enjoy meeting first
            </Typography>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {sortedAttendees.map((attendee) => (
                <Box key={attendee.id} sx={{ textAlign: 'center', minWidth: 70 }}>
                  <Box
                    component="img"
                    src={attendee.photo}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: attendee.isMatch ? '2px solid #d1d5db' : '2px solid #e5e7eb',
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {attendee.name}
                  </Typography>
                  {attendee.isMatch && (
                    <Typography variant="caption" sx={{ color: '#6C5CE7', fontSize: '0.6rem' }}>
                      Match
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
        {/* Primary CTA */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => { 
              onBuy?.(event); 
              onClose();
              if (navigator?.vibrate) navigator.vibrate([10, 5, 10]);
            }}
            disabled={event.soldOut || isPurchased}
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)',
                boxShadow: '0 6px 20px rgba(108,92,231,0.4)',
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            {isPurchased ? "You're going! ✓" : event.soldOut ? "SOLD OUT" : event.price === 0 ? "JOIN" : "BUY TICKET"}
          </Button>
        </motion.div>
        
        {/* Secondary CTAs */}
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<Heart size={16} />}
              onClick={() => {
                onSave?.(event.id);
                if (navigator?.vibrate) navigator.vibrate(10);
              }}
              sx={{ 
                flex: 1, 
                borderColor: "#6C5CE7", 
                color: "#6C5CE7", 
                background: "transparent", 
                fontWeight: 600,
                '&:hover': { 
                  background: "rgba(108,92,231,0.08)",
                  borderColor: "#5b4cdb",
                } 
              }}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </motion.div>
          <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<Share2 size={16} />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: event.title,
                    text: `Check out ${event.title} on ${fmtPulseDate(event.date, event.time || "20:00")}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
                if (navigator?.vibrate) navigator.vibrate(8);
              }}
              sx={{ 
                flex: 1, 
                borderColor: "#6C5CE7", 
                color: "#6C5CE7", 
                background: "transparent", 
                fontWeight: 600,
                '&:hover': { 
                  background: "rgba(108,92,231,0.08)",
                  borderColor: "#5b4cdb",
                } 
              }}
            >
              Share
            </Button>
          </motion.div>
          <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<UserPlus size={16} />}
              onClick={() => { 
                onInvitePlus1?.(event); 
                onClose();
                if (navigator?.vibrate) navigator.vibrate(8);
              }}
              sx={{ 
                flex: 1, 
                borderColor: "#6C5CE7", 
                color: "#6C5CE7", 
                background: "transparent", 
                fontWeight: 600,
                '&:hover': { 
                  background: "rgba(108,92,231,0.08)",
                  borderColor: "#5b4cdb",
                } 
              }}
            >
              +1
            </Button>
          </motion.div>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------- Main Page -------------------------------- */
export default function EventsByCategory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Ref for page start to scroll to
  const pageTopRef = useRef(null);

  // Scroll to top on mount (when navigating to Events)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Listen for tab scroll event - scroll to page start (top of page)
  useEffect(() => {
    const handleTabScroll = (e) => {
      if (e.detail?.tab === 'events') {
        // Scroll to absolute top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener(TAB_SCROLL_EVENT, handleTabScroll);
    return () => window.removeEventListener(TAB_SCROLL_EVENT, handleTabScroll);
  }, []);

  const pairsByEventId = useEventInvitesStore((s) => s.pairsByEventId);

  const resolvePlusOnePartner = useCallback(
    (eventId) => {
      const pair = pairsByEventId?.[String(eventId)];
      if (!pair) return null;
      if (pair.name) return { name: pair.name };

      const meId = user?.id;
      const aId = pair.me?.id;
      const bId = pair.other?.id;
      if (meId != null && aId != null && String(meId) === String(aId)) return pair.other;
      if (meId != null && bId != null && String(meId) === String(bId)) return pair.me;
      return pair.other || pair.me || null;
    },
    [pairsByEventId, user]
  );
  
  const [tab, setTab] = useState("large");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  
  // Check for eventId in URL params and open that event
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    const businessId = searchParams.get('businessId');
    if (eventId) {
      navigate(`/events/${eventId}`, { replace: true });
    }
  }, [searchParams]);
  
  // +1 Invite dialog state
  const [plusOneEvent, setPlusOneEvent] = useState(null);

  // סינון/מיון - Pulse spec: chronological order only (closest first)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("date_asc"); // Changed to chronological (closest first) per Pulse spec

  // פילטרים מהירים
  const [quickToday, setQuickToday] = useState(false);
  const [quickWeekend, setQuickWeekend] = useState(false);
  const [quickFree, setQuickFree] = useState(false);
  const [quickNear, setQuickNear] = useState(false);
  const [quickOutdoor, setQuickOutdoor] = useState(false);
  const [quickLive, setQuickLive] = useState(false);

  // מועדפים
  const [favs, setFavs] = useState(() => {
    try {
      const raw = localStorage.getItem("event_favs");
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set((parsed || []).map((x) => String(x)));
    }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem("event_favs", JSON.stringify(Array.from(favs))); }, [favs]);
  useEffect(() => {
    const syncFavsFromStorage = () => {
      try {
        const raw = localStorage.getItem('event_favs');
        const parsed = raw ? JSON.parse(raw) : [];
        setFavs(new Set((parsed || []).map((x) => String(x))));
      } catch {
        setFavs(new Set());
      }
    };

    const onFavsChanged = () => syncFavsFromStorage();
    const onStorage = (e) => {
      if (e?.key === 'event_favs') syncFavsFromStorage();
    };

    window.addEventListener('pulse:event_favs_changed', onFavsChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pulse:event_favs_changed', onFavsChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const toggleFav = (id) =>
    setFavs((prev) => {
      const key = String(id);
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  // רכישות
  const [purchased, setPurchased] = useState(() => {
    try { const raw = localStorage.getItem("event_purchased"); return new Set(raw ? JSON.parse(raw) : []); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem("event_purchased", JSON.stringify(Array.from(purchased))); }, [purchased]);

  // התאמות/מאצים (דמו)
  const [prefGender, setPrefGender] = useState("any"); // 'any' | 'female' | 'male'
  const [matches, setMatches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("event_matches") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("event_matches", JSON.stringify(matches)); }, [matches]);

  // מיקום
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [snack, setSnack] = useState("");

  const [likedProfiles, setLikedProfiles] = useState(() => {
    try {
      const raw = localStorage.getItem('pulse_profile_likes');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const syncLikesFromStorage = () => {
      try {
        const raw = localStorage.getItem('pulse_profile_likes');
        const parsed = raw ? JSON.parse(raw) : [];
        setLikedProfiles(Array.isArray(parsed) ? parsed : []);
      } catch {
        setLikedProfiles([]);
      }
    };

    const onLikesChanged = () => syncLikesFromStorage();
    const onStorage = (e) => {
      if (e?.key === 'pulse_profile_likes') syncLikesFromStorage();
    };

    window.addEventListener('pulse:profile_likes_changed', onLikesChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pulse:profile_likes_changed', onLikesChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  useEffect(() => {
    if (quickNear && !userLocation) {
      if (!navigator.geolocation) {
        setGeoError("Geolocation is not supported by your browser.");
        setQuickNear(false);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => { 
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); 
            setGeoError(""); 
          },
          (err) => { 
            // Provide user-friendly error messages based on error code
            let message = "Could not get your location.";
            if (err.code === 1) {
              message = "Location access denied. Please enable location permissions in your browser settings to use 'Near me' filter.";
            } else if (err.code === 2) {
              message = "Location unavailable. Please check your device's location settings.";
            } else if (err.code === 3) {
              message = "Location request timed out. Please try again.";
            }
            setGeoError(message); 
            setQuickNear(false); 
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
      }
    }
  }, [quickNear, userLocation]);

  const theme = useTheme();

  // קיבוץ לקטגוריות
  const dataByCat = useMemo(() => {
    const group = { large: [], small: [], twist: [], sports: [] };
    for (const ev of EVENTS) group[ev.category]?.push(ev);
    return group;
  }, []);

  // נגזרות לטופס
  const allTags = useMemo(() => { const s=new Set(); EVENTS.forEach((e)=>(e.tags||[]).forEach((t)=>s.add(t))); return Array.from(s).sort(); }, []);
  const allCountries = useMemo(() => { const s=new Set(EVENTS.map((e)=>e.country).filter(Boolean)); return Array.from(s).sort(); }, []);
  const allRegions = useMemo(() => { const s=new Set(EVENTS.map((e)=>e.region).filter(Boolean)); return Array.from(s).sort(); }, []);
  const priceBounds = useMemo(() => { const prices=EVENTS.map((e)=>Number(e.price||0)); return { min: Math.min(...prices), max: Math.max(...prices) }; }, []);

  const isFiltered = useMemo(() => (
    (selectedCategories && selectedCategories.length > 0) ||
    (selectedTags && selectedTags.length > 0) || country || region ||
    searchText.trim() || dateFrom || dateTo || priceMin || priceMax ||
    quickToday || quickWeekend || quickFree || quickNear || quickOutdoor || quickLive
  ), [selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive]);

  // Calculate which quick filters have results for the current tab
  const availableFilters = useMemo(() => {
    // Get base events for current tab (without quick filters applied)
    let baseEvents;
    if (tab === "saved") {
      baseEvents = EVENTS.filter((ev) => favs.has(String(ev.id)));
    } else if (tab === "purchased") {
      baseEvents = EVENTS.filter((ev) => purchased.has(String(ev.id)) && isPastEventVisible(ev));
    } else {
      const filtered30Days = EVENTS.filter((ev) => isWithin30Days(ev.date));
      const windowed = filtered30Days.length ? filtered30Days : EVENTS;
      baseEvents = windowed.filter((ev) => ev.category === tab);
    }

    // Check which filters would have results
    const hasToday = baseEvents.some((ev) => isSameYMD(new Date(ev.date), new Date()));
    const hasWeekend = baseEvents.some((ev) => isWeekend(new Date(ev.date)));
    const hasFree = baseEvents.some((ev) => Number(ev.price || 0) === 0);
    const hasOutdoor = baseEvents.some((ev) => (ev.tags || []).map((t) => String(t).toLowerCase()).includes("outdoor"));
    const hasLiveMusic = baseEvents.some((ev) => (ev.tags || []).map((t) => String(t).toLowerCase()).includes("live music"));
    // Near me is always available if we have events with coords
    const hasNearMe = baseEvents.some((ev) => ev.coords);

    return { hasToday, hasWeekend, hasFree, hasOutdoor, hasLiveMusic, hasNearMe };
  }, [tab, favs, purchased]);

  // סינון+מיון - Pulse spec: 30 days window, max 25 events
  // Note: 24h expiration rule applies ONLY to Purchased tab
  const visible = useMemo(() => {
    // מקור לפי טאב (כולל saved/purchased)
    let base;
    if (tab === "saved") {
      // Saved tab: show all saved events (no expiration)
      base = EVENTS.filter((ev) => favs.has(String(ev.id)));
    } else if (tab === "purchased") {
      // Purchased tab: show past events for 24h only, filter out expired
      base = EVENTS.filter((ev) => purchased.has(String(ev.id)) && isPastEventVisible(ev));
    } else {
      // Discovery tabs: show all events (no expiration, events reset monthly)
      // Apply 30 days window filter for regular tabs
      const filtered30Days = EVENTS.filter((ev) => isWithin30Days(ev.date));
      const windowed = filtered30Days.length ? filtered30Days : EVENTS;
      base = windowed.filter((ev) => ev.category === tab);
    }

    if (selectedCategories.length > 0) {
      const set = new Set(selectedCategories);
      base = base.filter((ev) => set.has(ev.category));
    }
    if (selectedTags.length > 0) {
      const set = new Set(selectedTags.map((t) => t.toLowerCase()));
      base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).some((t)=>set.has(t)));
    }
    if (country) base = base.filter((ev) => (ev.country || "").toLowerCase() === country.toLowerCase());
    if (region)  base = base.filter((ev) => (ev.region  || "").toLowerCase() === region.toLowerCase());

    const q = searchText.trim().toLowerCase();
    if (q) base = base.filter((ev) => ev.title.toLowerCase().includes(q) || (ev.venue||"").toLowerCase().includes(q) || (ev.tags||[]).some((t)=>String(t).toLowerCase().includes(q)) || (ev.region||"").toLowerCase().includes(q) || (ev.country||"").toLowerCase().includes(q));

    const toDate = (s) => (s ? new Date(s + "T00:00:00") : null);
    const fromD = toDate(dateFrom); const toD = toDate(dateTo);
    if (fromD) base = base.filter((ev) => new Date(ev.date) >= fromD);
    if (toD)   base = base.filter((ev) => new Date(ev.date) <= toD);

    const pMin = priceMin !== "" ? Number(priceMin) : null;
    const pMax = priceMax !== "" ? Number(priceMax) : null;
    if (pMin !== null) base = base.filter((ev) => Number(ev.price || 0) >= pMin);
    if (pMax !== null) base = base.filter((ev) => Number(ev.price || 0) <= pMax);
    if (quickFree) base = base.filter((ev) => Number(ev.price || 0) === 0);

    if (quickOutdoor) base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).includes("outdoor"));
    if (quickLive)    base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).includes("live music"));

    if (quickToday)   base = base.filter((ev) => isSameYMD(new Date(ev.date), new Date()));
    if (quickWeekend) base = base.filter((ev) => isWeekend(new Date(ev.date)));

    if (quickNear && userLocation) {
      base = base.filter((ev) => ev.coords)
        .map((ev) => ({ ev, d: haversineKm(userLocation, ev.coords) }))
        .filter(({ d }) => d <= 25)
        .sort((a, b) => a.d - b.d)
        .map(({ ev }) => ev);
    }

    const by = {
      date_desc: (a, b) => new Date(b.date) - new Date(a.date),
      date_asc:  (a, b) => new Date(a.date) - new Date(b.date),
      price_low: (a, b) => Number(a.price||0) - Number(b.price||0),
      price_high:(a, b) => Number(b.price||0) - Number(a.price||0),
      title_az:  (a, b) => a.title.localeCompare(b.title),
    }[sortBy] || ((a,b)=>0);

    // Pulse spec: max 25 events (15-25 range)
    return base.sort(by).slice(0, EVENTS_MAX_COUNT);
  }, [tab, favs, purchased, selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, sortBy, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive, userLocation]);

  const openBuy = (ev) => setSelectedEvent(ev);
  const closeBuy = (result) => {
    setSelectedEvent(null);
    if (result?.ok) { console.log("ORDER", result); setSnack("Order placed successfully."); }
  };
  const markPurchased = (eventId) => setPurchased((prev) => new Set(prev).add(String(eventId)));

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (selectedCategories.length) c++;
    if (selectedTags.length) c++;
    if (country) c++;
    if (region) c++;
    if (searchText.trim()) c++;
    if (dateFrom || dateTo) c++;
    if (priceMin !== "" || priceMax !== "") c++;
    if (quickToday) c++;
    if (quickWeekend) c++;
    if (quickFree) c++;
    if (quickNear) c++;
    if (quickOutdoor) c++;
    if (quickLive) c++;
    return c;
  }, [selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive]);

  const clearFilters = () => {
    setSelectedCategories([]); setSelectedTags([]); setCountry(""); setRegion("");
    setSearchText(""); setDateFrom(""); setDateTo(""); setPriceMin(""); setPriceMax("");
    setSortBy("date_desc"); setQuickToday(false); setQuickWeekend(false); setQuickFree(false);
    setQuickNear(false); setQuickOutdoor(false); setQuickLive(false);
  };

  // Toggle map (לפי הדרישה: פותח גוגל-מאפס עם כל האירועים)
  const openAllEventsInMaps = () => {
    const url = buildGoogleMapsUrl(EVENTS, userLocation);
    if (!url) return setSnack("No events to open in Google Maps.");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // פתיחת קלנדר (הוספה ישירה)
  const openCalendar = (ev) => {
    window.open(googleCalendarUrl(ev), "_blank", "noopener,noreferrer");
  };

  // כפתור המפה בכל כרטיס – האירוע + כל היתר
  const openMapsForEvent = (primary) => {
    const url = buildMapsUrlWithPrimary(primary, EVENTS, userLocation);
    if (!url) return setSnack("Couldn't build map URL.");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Saved/Purchased datasets
  // Saved: show all saved events (no expiration, events reset monthly)
  // Purchased: apply 24h expiration rule (past events visible for 24h only)
  const savedList = EVENTS.filter((ev) => favs.has(String(ev.id)));
  const purchasedList = EVENTS.filter((ev) => purchased.has(String(ev.id)) && isPastEventVisible(ev));

  // דמו "אנשים שתפגשו" (בממשק Purchased)
  const DEMO_USERS = [
    { id: "u2", name: "Noam",  age: 27, gender: "male",   bio: "EDM, runs, sushi",   eventIds: ["lp2","spx2"], photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" },
    { id: "u3", name: "Maya",  age: 25, gender: "female", bio: "Acoustic nights 🎸", eventIds: ["sp2"],         photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
    { id: "u4", name: "Amit",  age: 28, gender: "male",   bio: "Food markets 😋",    eventIds: ["tw1"],         photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop" },
  ];
  const suggestedUsers = DEMO_USERS.filter((u) => (prefGender==="any" ? true : u.gender===prefGender));
  const likeUser = (u) => setMatches((arr) => Array.from(new Set([...arr, u.id])));
  const skipUser = (u) => setMatches((arr) => arr.filter((id) => id !== u.id));

  return (
    <Box ref={pageTopRef} sx={{ minHeight: "100vh", bgcolor: "#fafbfc", pb: 10 }}>
      {/* Page Title - scrolls with content (like Explore) */}
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a2e', mb: 0.5 }}>
            Events
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Find amazing experiences & meet new people
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/events/new')}
          sx={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            fontWeight: 700,
            borderRadius: '12px',
            px: 2,
            py: 1,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)',
              boxShadow: '0 6px 16px rgba(108,92,231,0.4)',
            },
          }}
        >
          Add Event
        </Button>
      </Box>

      {/* Sticky Filters Bar (like Explore) */}
      <Box 
        sx={{ 
          position: "sticky", 
          top: 56, // Below main app header
          zIndex: 100, 
          bgcolor: "#fff", 
          borderBottom: "1px solid rgba(0,0,0,0.06)", 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          px: 3,
          py: 1.5,
        }}
      >
        {/* Category Tabs - Row 1 */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            pb: 1,
          }}
        >
          {ALL_TABS.map((c) => {
            const isActive = tab === c.key;
            return (
              <Chip
                key={c.key}
                label={c.label}
                onClick={() => {
                  setTab(c.key);
                  setQuickToday(false);
                  setQuickWeekend(false);
                  setQuickFree(false);
                  setQuickNear(false);
                  setQuickOutdoor(false);
                  setQuickLive(false);
                }}
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  borderRadius: '18px',
                  backgroundColor: isActive ? '#f3e8ff !important' : '#f1f5f9',
                  color: isActive ? '#7c3aed' : '#64748b',
                  border: isActive ? '1px solid #c4b5fd' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive ? '#f3e8ff !important' : '#e2e8f0',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Quick filter chips - Row 2 */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            mt: 1,
          }}
        >
          <Chip 
            icon={<CalendarClock size={14} />} 
            label="Today" 
            size="small"
            onClick={() => { setQuickToday((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickToday ? '#f3e8ff !important' : '#f8fafc',
              color: quickToday ? '#7c3aed' : '#94a3b8',
              border: quickToday ? '1px solid #c4b5fd' : '1px solid transparent',
              '& .MuiChip-icon': {
                color: quickToday ? '#7c3aed' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: quickToday ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
          <Chip 
            icon={<CalendarClock size={14} />} 
            label="Weekend" 
            size="small"
            onClick={() => { setQuickWeekend((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickWeekend ? '#f3e8ff !important' : '#f8fafc',
              color: quickWeekend ? '#7c3aed' : '#94a3b8',
              border: quickWeekend ? '1px solid #c4b5fd' : '1px solid transparent',
              '& .MuiChip-icon': {
                color: quickWeekend ? '#7c3aed' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: quickWeekend ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
          <Chip 
            label="Free" 
            size="small"
            onClick={() => { setQuickFree((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickFree ? '#f3e8ff !important' : '#f8fafc',
              color: quickFree ? '#7c3aed' : '#94a3b8',
              border: quickFree ? '1px solid #c4b5fd' : '1px solid transparent',
              '&:hover': {
                backgroundColor: quickFree ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
          <Chip 
            icon={<LocateFixed size={14} />} 
            label="Near me" 
            size="small"
            onClick={() => { setQuickNear((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickNear ? '#f3e8ff !important' : '#f8fafc',
              color: quickNear ? '#7c3aed' : '#94a3b8',
              border: quickNear ? '1px solid #c4b5fd' : '1px solid transparent',
              '& .MuiChip-icon': {
                color: quickNear ? '#7c3aed' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: quickNear ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
          <Chip 
            icon={<Sun size={14} />} 
            label="Outdoor" 
            size="small"
            onClick={() => { setQuickOutdoor((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickOutdoor ? '#f3e8ff !important' : '#f8fafc',
              color: quickOutdoor ? '#7c3aed' : '#94a3b8',
              border: quickOutdoor ? '1px solid #c4b5fd' : '1px solid transparent',
              '& .MuiChip-icon': {
                color: quickOutdoor ? '#7c3aed' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: quickOutdoor ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
          <Chip 
            icon={<Music size={14} />} 
            label="Live Music" 
            size="small"
            onClick={() => { setQuickLive((v) => !v); if (navigator?.vibrate) navigator.vibrate(5); }}
            sx={{
              flexShrink: 0,
              fontWeight: 500,
              borderRadius: '14px',
              backgroundColor: quickLive ? '#f3e8ff !important' : '#f8fafc',
              color: quickLive ? '#7c3aed' : '#94a3b8',
              border: quickLive ? '1px solid #c4b5fd' : '1px solid transparent',
              '& .MuiChip-icon': {
                color: quickLive ? '#7c3aed' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: quickLive ? '#f3e8ff !important' : '#f1f5f9',
              },
            }}
          />
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ px: 3, py: 2 }}>
        {geoError && <Alert severity="warning" sx={{ mb: 2 }}>{geoError}</Alert>}

        {/* Purchased tab עם החלקות */}
        {tab === "purchased" && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mr: 1 }}>Your Tickets</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>({purchasedList.length})</Typography>
            </Stack>
            {purchasedList.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>You haven’t bought tickets yet.</Alert>
            ) : (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {purchasedList.map((ev) => (
                  <Grid key={ev.id} item xs={12} sm={6} md={4}>
                    <EventCard
                      ev={ev}
                      onBuy={() => {}}
                      onToggleFav={toggleFav}
                      isFav={favs.has(String(ev.id))}
                      onOpenCalendar={openCalendar}
                      onOpenMaps={openMapsForEvent}
                      onInvitePlus1={(e) => setPlusOneEvent(e)}
                      onViewDetails={(e) => navigate(`/events/${e.id}`)}
                      plusOnePartner={resolvePlusOnePartner(ev.id)}
                    />

                  </Grid>
                ))}
              </Grid>
            )}

          </Box>
        )}

        {/* Saved tab */}
        {tab === "saved" && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Saved Events</Typography>
              <Button size="small" variant="outlined" startIcon={<MapIcon size={14} />} onClick={()=>{
                const url = buildGoogleMapsUrl(savedList, userLocation);
                if (!url) return setSnack("No favorites to open.");
                window.open(url, "_blank", "noopener,noreferrer");
              }}>
                Open favorites in Google Maps
              </Button>
            </Stack>
            {savedList.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                py: 6, 
                px: 3,
                textAlign: 'center',
              }}>
                <Box sx={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(102,126,234,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                }}>
                  <Heart size={28} color="#6C5CE7" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                  No saved events yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 280 }}>
                  Tap the heart on any event to save it here for easy access later
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setTab("all")}
                  sx={{ 
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: '12px',
                  }}
                >
                  Browse Events
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {savedList.map((ev) => (
                  <Grid key={ev.id} item xs={12} sm={6} md={4}>
                    <EventCard
                      ev={ev}
                      onBuy={openBuy}
                      onToggleFav={toggleFav}
                      isFav={favs.has(String(ev.id))}
                      onOpenCalendar={openCalendar}
                      onOpenMaps={openMapsForEvent}
                      onInvitePlus1={(e) => setPlusOneEvent(e)}
                      onViewDetails={(e) => navigate(`/events/${e.id}`)}
                      plusOnePartner={purchased.has(String(ev.id)) ? resolvePlusOnePartner(ev.id) : null}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* יתר הטאבים (all/קטגוריות) */}
        {tab !== "saved" && tab !== "purchased" && (
          isFiltered ? (
            visible.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>Nothing scheduled right now — new events are added regularly.</Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {visible.map((ev, idx) => {
                  const distanceKm = userLocation && ev.coords ? haversineKm(userLocation, ev.coords) : undefined;
                  return (
                    <Grid key={ev.id} item xs={12} sm={6} md={4}>
                      <EventCard
                        ev={ev}
                        onBuy={openBuy}
                        onToggleFav={toggleFav}
                        isFav={favs.has(String(ev.id))}
                        onOpenCalendar={openCalendar}
                        onOpenMaps={openMapsForEvent}
                        distanceKm={distanceKm}
                        onInvitePlus1={(ev) => setPlusOneEvent(ev)}
                        showGoodMatch={idx % 3 === 0}
                        onViewDetails={(ev) => navigate(`/events/${ev.id}`)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {EVENTS.filter((ev)=>ev.category===tab).map((ev) => (
                <Grid key={ev.id} item xs={12} sm={6} md={4}>
                  <EventCard
                    ev={ev}
                    onBuy={openBuy}
                    onToggleFav={toggleFav}
                    isFav={favs.has(String(ev.id))}
                    onOpenCalendar={openCalendar}
                    onOpenMaps={openMapsForEvent}
                    onViewDetails={(ev) => navigate(`/events/${ev.id}`)}
                    onInvitePlus1={(ev) => setPlusOneEvent(ev)}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Box>

      {/* רכישת כרטיסים */}
      <TicketPurchaseDialog open={!!selectedEvent} onClose={closeBuy} event={selectedEvent} onPurchased={markPurchased} />

      {/* +1 Invite Dialog */}
      <PlusOneInviteDialog 
        open={!!plusOneEvent} 
        onClose={(result) => {
          setPlusOneEvent(null);
          if (result?.sent) {
            // Find the match to get their info
            const matchUser = demoMatches.find(m => m.id === result.matchId);
            
            // Send invite message to chat using gestureMessagesStore
            if (matchUser) {
              const { addGestureMessage } = useGestureMessagesStore.getState();
              addGestureMessage(
                result.matchId,
                {
                  gestureType: 'event_invite',
                  message: result.paidByInviter
                    ? `Hey! I'm thinking of going to ${result.eventTitle} - want to join me? 🎉\nI can also buy your ticket if you want.`
                    : `Hey! I'm thinking of going to ${result.eventTitle} - want to join me? 🎉`,
                  details: {
                    eventId: result.eventId,
                    eventTitle: result.eventTitle,
                    eventDate: result.eventDate,
                    eventTime: result.eventTime,
                    eventVenue: result.eventVenue,
                    eventCover: result.eventCover,
                    paidByInviter: !!result.paidByInviter,
                  },
                },
                {
                  id: matchUser.id,
                  name: matchUser.name,
                  photoUrl: matchUser.photoUrl,
                }
              );
            }
            
            setSnack("Invite sent!");
            // Navigate to specific chat with the match after short delay
            setTimeout(() => {
              navigate(`/chat/${result.matchId}`);
            }, 1000);
          }
        }} 
        event={plusOneEvent}
        matches={demoMatches}
        purchased={purchased}
      />

      {/* דיאלוג סינון/מיון */}
      <Dialog 
        open={filtersOpen} 
        onClose={() => setFiltersOpen(false)} 
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '70vh',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ py: 1.5, px: 2, fontSize: '1rem', fontWeight: 700 }}>Filter & Sort</DialogTitle>
        <DialogContent dividers sx={{ py: 1.5, px: 2 }}>
          <Stack spacing={2}>
            <TextField 
              label="Search" 
              placeholder="Title, venue, tag..."
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              fullWidth 
              size="small"
            />
            <Autocomplete 
              multiple 
              size="small"
              options={BASE_TABS.filter((c)=>c.key!=="all").map((c)=>c.key)} 
              value={selectedCategories} 
              onChange={(_, val) => setSelectedCategories(val)}
              renderTags={(value, getTagProps) => value.map((opt, i) => <Chip size="small" variant="outlined" label={BASE_TABS.find((c)=>c.key===opt)?.label || opt} {...getTagProps({ index: i })} key={opt} />)}
              renderInput={(params) => <TextField {...params} label="Categories" size="small" />} 
            />
            <Autocomplete 
              multiple 
              size="small"
              options={allTags} 
              value={selectedTags} 
              onChange={(_, val) => setSelectedTags(val)}
              renderTags={(value, getTagProps) => value.map((opt, i) => <Chip size="small" variant="outlined" label={opt} {...getTagProps({ index: i })} key={opt} />)}
              renderInput={(params) => <TextField {...params} label="Tags" size="small" />} 
            />
            <Stack direction="row" spacing={1}>
              <TextField label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} sx={{ flex: 1 }} size="small" InputLabelProps={{ shrink: true }} />
              <TextField label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} sx={{ flex: 1 }} size="small" InputLabelProps={{ shrink: true }} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField label="Min ₪" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} sx={{ flex: 1 }} size="small" inputProps={{ min: 0 }} />
              <TextField label="Max ₪" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} sx={{ flex: 1 }} size="small" inputProps={{ min: 0 }} />
            </Stack>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151' }}>Sort by</Typography>
              <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)} name="sortby" sx={{ mt: 0.5 }}>
                <FormControlLabel value="date_desc" control={<Radio size="small" />} label={<Typography variant="body2">Date (newest)</Typography>} />
                <FormControlLabel value="date_asc"  control={<Radio size="small" />} label={<Typography variant="body2">Date (oldest)</Typography>} />
                <FormControlLabel value="price_low" control={<Radio size="small" />} label={<Typography variant="body2">Price (low → high)</Typography>} />
                <FormControlLabel value="price_high"control={<Radio size="small" />} label={<Typography variant="body2">Price (high → low)</Typography>} />
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ py: 1, px: 2 }}>
          <Button color="inherit" size="small" onClick={() => setFiltersOpen(false) || clearFilters()}>Clear</Button>
          <Button variant="contained" size="small" onClick={() => setFiltersOpen(false)}>Apply</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
