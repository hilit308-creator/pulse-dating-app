/**
 * ProfileSettings - Modern Profile Editor
 * 
 * Features:
 * - Profile photo gallery with drag-to-reorder
 * - Bio & interests editing
 * - Prompts management
 * - Profile verification
 * - Real-time profile strength indicator
 */

import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Snackbar,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  Shield,
  ShieldCheck,
  Star,
  Heart,
  Sparkles,
  Image,
  MessageSquare,
  Edit3,
  Check,
  Instagram,
  Trash2,
  GripVertical,
  Eye,
  ChevronRight,
  Zap,
  Briefcase,
  GraduationCap,
  MapPin,
  Home,
  Ruler,
  Dumbbell,
  Wine,
  Cigarette,
  Baby,
  Search,
  Users,
  Globe,
  Music,
  Compass,
  HandHeart,
  Mic,
  Moon,
  Sun,
  Brain,
  Utensils,
  Heart as HeartIcon,
  Dog,
  MessageCircle,
  Battery,
  Waves,
} from 'lucide-react';

// Constants
const MAX_PHOTOS = 6;
const MAX_INTERESTS = 10;
const MAX_BIO_LENGTH = 500;
const MAX_CAUSES = 3;
const MAX_QUALITIES = 3;

// About You fields
const ABOUT_YOU_FIELDS = [
  { key: 'work', icon: Briefcase, label: 'Work', placeholder: 'Add your job title' },
  { key: 'education', icon: GraduationCap, label: 'Education', placeholder: 'Add your school' },
  { key: 'location', icon: MapPin, label: 'Location', placeholder: 'Add your city' },
  { key: 'hometown', icon: Home, label: 'Hometown', placeholder: 'Where are you from?' },
];

// Height options - comprehensive range with both cm and feet/inches
const HEIGHT_OPTIONS = [
  { value: '150', label: '150 cm', imperial: "4'11\"" },
  { value: '152', label: '152 cm', imperial: "5'0\"" },
  { value: '155', label: '155 cm', imperial: "5'1\"" },
  { value: '157', label: '157 cm', imperial: "5'2\"" },
  { value: '160', label: '160 cm', imperial: "5'3\"" },
  { value: '163', label: '163 cm', imperial: "5'4\"" },
  { value: '165', label: '165 cm', imperial: "5'5\"" },
  { value: '168', label: '168 cm', imperial: "5'6\"" },
  { value: '170', label: '170 cm', imperial: "5'7\"" },
  { value: '173', label: '173 cm', imperial: "5'8\"" },
  { value: '175', label: '175 cm', imperial: "5'9\"" },
  { value: '178', label: '178 cm', imperial: "5'10\"" },
  { value: '180', label: '180 cm', imperial: "5'11\"" },
  { value: '183', label: '183 cm', imperial: "6'0\"" },
  { value: '185', label: '185 cm', imperial: "6'1\"" },
  { value: '188', label: '188 cm', imperial: "6'2\"" },
  { value: '190', label: '190 cm', imperial: "6'3\"" },
  { value: '193', label: '193 cm', imperial: "6'4\"" },
  { value: '195', label: '195 cm', imperial: "6'5\"" },
  { value: '198', label: '198 cm', imperial: "6'6\"" },
  { value: '200', label: '200 cm', imperial: "6'7\"" },
  { value: '203', label: '203 cm', imperial: "6'8\"" },
];

// More About You fields
const MORE_ABOUT_FIELDS = [
  { key: 'height', icon: Ruler, label: 'Height', type: 'height' },
  { key: 'exercise', icon: Dumbbell, label: 'Exercise', options: ['Active', 'Sometimes', 'Rarely', 'Never'] },
  { key: 'drinking', icon: Wine, label: 'Drinking', options: ['Never', 'Socially', 'Sometimes', 'Frequently'] },
  { key: 'smoking', icon: Cigarette, label: 'Smoking', options: ['Never', 'Sometimes', 'Trying to quit', 'Regularly'] },
  { key: 'lookingFor', icon: Search, label: 'Looking for', options: ['Fun', 'Casual dates', 'Long-term relationship', 'Friendship', 'Marriage'] },
  { key: 'kids', icon: Baby, label: 'Kids', options: ['Want someday', "Don't want", 'Have kids', 'Not sure'] },
];

// Causes options
const CAUSES_OPTIONS = [
  'Animal welfare', 'Climate & environment', 'Mental health', 'Education',
  'Equality', 'LGBTQ+', 'Disaster relief', 'Fight against hunger', 'Clean water',
];

// Qualities options
const QUALITIES_OPTIONS = [
  'Humor', 'Kindness', 'Openness', 'Ambition', 'Creativity',
  'Empathy', 'Honesty', 'Loyalty', 'Patience', 'Intelligence',
];

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Languages
const LANGUAGES = ['English', 'Hebrew', 'Spanish', 'French', 'German', 'Russian', 'Arabic', 'Chinese', 'Japanese', 'Italian'];

// Dating Intentions
const DATING_INTENTIONS = [
  { value: 'long-term', label: 'Long-term relationship', emoji: '💍', description: 'Looking for something serious' },
  { value: 'short-term', label: 'Short-term dating', emoji: '🌸', description: 'Open to seeing where it goes' },
  { value: 'casual', label: 'Casual', emoji: '🎉', description: 'Looking for fun, nothing serious' },
  { value: 'friends', label: 'New friends', emoji: '👋', description: 'Just want to meet cool people' },
  { value: 'figuring-out', label: 'Still figuring it out', emoji: '🤔', description: 'Not sure yet, and that\'s okay' },
];

// Love Languages
const LOVE_LANGUAGES = [
  { value: 'words', label: 'Words of Affirmation', emoji: '💬', description: 'Compliments and verbal encouragement' },
  { value: 'time', label: 'Quality Time', emoji: '⏰', description: 'Undivided attention together' },
  { value: 'gifts', label: 'Receiving Gifts', emoji: '🎁', description: 'Thoughtful presents and gestures' },
  { value: 'service', label: 'Acts of Service', emoji: '🛠️', description: 'Actions speak louder than words' },
  { value: 'touch', label: 'Physical Touch', emoji: '🤗', description: 'Hugs, kisses, and closeness' },
];

// Communication Style
const COMMUNICATION_STYLES = [
  { value: 'texter', label: 'Big texter', emoji: '💬' },
  { value: 'phone', label: 'Phone caller', emoji: '📞' },
  { value: 'video', label: 'Video chatter', emoji: '📹' },
  { value: 'in-person', label: 'Better in person', emoji: '🙋' },
];

// Pet Preferences
const PET_PREFERENCES = [
  { value: 'dog-lover', label: 'Dog lover', emoji: '🐕' },
  { value: 'cat-lover', label: 'Cat lover', emoji: '🐱' },
  { value: 'all-animals', label: 'All animals', emoji: '🐾' },
  { value: 'no-pets', label: 'No pets', emoji: '🚫' },
  { value: 'allergic', label: 'Allergic to pets', emoji: '🤧' },
];

// Social Battery
const SOCIAL_BATTERY = [
  { value: 'introvert', label: 'Introvert', emoji: '📖', description: 'Recharge alone' },
  { value: 'extrovert', label: 'Extrovert', emoji: '🎉', description: 'Energized by people' },
  { value: 'ambivert', label: 'Ambivert', emoji: '⚖️', description: 'Depends on the mood' },
];

// Sleep Schedule
const SLEEP_SCHEDULES = [
  { value: 'early-bird', label: 'Early bird', emoji: '🌅' },
  { value: 'night-owl', label: 'Night owl', emoji: '🦉' },
  { value: 'flexible', label: 'Flexible', emoji: '🌓' },
];

// Personality Types (MBTI)
const PERSONALITY_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

// Religion
const RELIGIONS = [
  'Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian',
  'Hindu', 'Jewish', 'Muslim', 'Spiritual', 'Other', 'Prefer not to say',
];

// Dietary Preferences
const DIETARY_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore', emoji: '🍖' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
];

// Mock data
const MOCK_USER = {
  name: 'Sarah',
  age: 28,
  photos: [
    { id: 1, url: 'https://i.pravatar.cc/400?img=1', isPrimary: true },
    { id: 2, url: 'https://i.pravatar.cc/400?img=5', isPrimary: false },
  ],
  bio: '',
  interests: [
    { emoji: '🍹', label: 'Bars' },
    { emoji: '🏖️', label: 'Beaches' },
    { emoji: '⛺', label: 'Camping' },
  ],
  prompts: [],
  verified: false,
};

const PROMPT_OPTIONS = [
  "The key to my heart is…",
  "My ideal weekend looks like…",
  "A fun fact about me…",
  "Friends describe me as…",
  "I'm looking for someone who…",
  "My love language is…",
  "I geek out on…",
  "You should message me if…",
];

const INTEREST_SUGGESTIONS = [
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '📚', label: 'Reading' },
  { emoji: '🏃', label: 'Running' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '🍳', label: 'Cooking' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🧘', label: 'Yoga' },
  { emoji: '📷', label: 'Photography' },
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Profile state
  const [photos, setPhotos] = useState(MOCK_USER.photos);
  const [bio, setBio] = useState(MOCK_USER.bio);
  const [interests, setInterests] = useState(MOCK_USER.interests);
  const [prompts, setPrompts] = useState(MOCK_USER.prompts);
  const [verified, setVerified] = useState(MOCK_USER.verified);
  const [smartPhotos, setSmartPhotos] = useState(true);
  
  // About You state
  const [aboutYou, setAboutYou] = useState({
    work: '', education: '', location: "Be'er Sheva", hometown: 'Jerusalem',
  });
  
  // More About You state
  const [moreAbout, setMoreAbout] = useState({
    height: '175 cm', exercise: 'Active', drinking: 'Socially',
    smoking: 'Never', lookingFor: 'Long-term relationship', kids: 'Want someday',
  });
  
  // Causes & Qualities state
  const [causes, setCauses] = useState([]);
  const [qualities, setQualities] = useState(['Humor', 'Kindness', 'Openness']);
  
  // Extras state
  const [starSign, setStarSign] = useState('Taurus');
  const [languages, setLanguages] = useState(['English', 'Hebrew']);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [spotifyArtists, setSpotifyArtists] = useState([]);
  const [instagramPhotos, setInstagramPhotos] = useState([]);
  const [showSpotifyDialog, setShowSpotifyDialog] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [connectingService, setConnectingService] = useState(null);
  
  // Advanced dating preferences state
  const [datingIntention, setDatingIntention] = useState('long-term');
  const [loveLanguage, setLoveLanguage] = useState('time');
  const [communicationStyle, setCommunicationStyle] = useState('texter');
  const [petPreference, setPetPreference] = useState('dog-lover');
  const [socialBattery, setSocialBattery] = useState('ambivert');
  const [sleepSchedule, setSleepSchedule] = useState('flexible');
  const [personalityType, setPersonalityType] = useState('');
  const [religion, setReligion] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [showVoiceIntro, setShowVoiceIntro] = useState(false);
  const [voiceIntroRecorded, setVoiceIntroRecorded] = useState(false);
  const [showDatingIntentionDialog, setShowDatingIntentionDialog] = useState(false);
  const [showLoveLanguageDialog, setShowLoveLanguageDialog] = useState(false);
  const [showLifestyleDialog, setShowLifestyleDialog] = useState(false);
  const [showHeightDialog, setShowHeightDialog] = useState(false);
  
  // UI state
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCausesDialog, setShowCausesDialog] = useState(false);
  const [showQualitiesDialog, setShowQualitiesDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(null);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showStarSignDialog, setShowStarSignDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Profile completion calculation
  const profileStrength = useMemo(() => {
    let score = 0;
    if (photos.length >= 1) score += 25;
    if (photos.length >= 3) score += 15;
    if (bio.length >= 50) score += 20;
    if (interests.length >= 3) score += 15;
    if (prompts.length >= 1) score += 15;
    if (verified) score += 10;
    return Math.min(score, 100);
  }, [photos, bio, interests, prompts, verified]);
  
  const getStrengthLabel = () => {
    if (profileStrength >= 90) return { text: 'Outstanding', color: '#22c55e' };
    if (profileStrength >= 70) return { text: 'Great', color: '#6C5CE7' };
    if (profileStrength >= 50) return { text: 'Good', color: '#f59e0b' };
    return { text: 'Getting started', color: '#ef4444' };
  };
  
  const strengthInfo = getStrengthLabel();
  
  // Handlers
  const handleBack = () => navigate(-1);
  
  const handlePhotoClick = (index) => {
    setActivePhotoIndex(index);
    setShowPhotoDialog(true);
  };
  
  const handleAddPhoto = () => {
    if (photos.length < MAX_PHOTOS) {
      setActivePhotoIndex(photos.length);
      setShowPhotoDialog(true);
    }
  };
  
  const handleSelectFromGallery = () => {
    setShowPhotoDialog(false);
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = {
          id: Date.now(),
          url: reader.result,
          isPrimary: photos.length === 0,
        };
        if (activePhotoIndex !== null && activePhotoIndex < photos.length) {
          setPhotos(prev => prev.map((p, i) => i === activePhotoIndex ? newPhoto : p));
        } else {
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSetPrimary = (index) => {
    setPhotos(prev => prev.map((p, i) => ({ ...p, isPrimary: i === index })));
  };
  
  const handleAddInterest = (interest) => {
    if (interests.length < MAX_INTERESTS && !interests.some(i => i.label === interest.label)) {
      setInterests(prev => [...prev, interest]);
    }
  };
  
  const handleRemoveInterest = (index) => {
    setInterests(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddPrompt = () => {
    if (selectedPrompt && promptAnswer.trim()) {
      setPrompts(prev => [...prev, { prompt: selectedPrompt, answer: promptAnswer.trim() }]);
      setSelectedPrompt(null);
      setPromptAnswer('');
      setShowPromptDialog(false);
    }
  };
  
  const handleRemovePrompt = (index) => {
    setPrompts(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleVerify = () => {
    setVerified(true);
    setShowVerifyDialog(false);
    setSnackbar({ open: true, message: '✓ Profile verified!' });
  };
  
  // Causes handlers
  const handleToggleCause = (cause) => {
    setCauses(prev => 
      prev.includes(cause) 
        ? prev.filter(c => c !== cause)
        : prev.length < MAX_CAUSES ? [...prev, cause] : prev
    );
  };
  
  // Qualities handlers
  const handleToggleQuality = (quality) => {
    setQualities(prev =>
      prev.includes(quality)
        ? prev.filter(q => q !== quality)
        : prev.length < MAX_QUALITIES ? [...prev, quality] : prev
    );
  };
  
  // About You handlers
  const handleUpdateAboutYou = (key, value) => {
    setAboutYou(prev => ({ ...prev, [key]: value }));
  };
  
  // More About handlers
  const handleUpdateMoreAbout = (key, value) => {
    setMoreAbout(prev => ({ ...prev, [key]: value }));
    setShowFieldDialog(null);
  };
  
  // Language handlers
  const handleAddLanguage = (lang) => {
    if (!languages.includes(lang) && languages.length < 5) {
      setLanguages(prev => [...prev, lang]);
    }
  };
  
  const handleRemoveLanguage = (lang) => {
    setLanguages(prev => prev.filter(l => l !== lang));
  };
  
  // Spotify connection handler
  const handleConnectSpotify = async () => {
    setConnectingService('spotify');
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock top artists data
    setSpotifyArtists([
      { name: 'The Weeknd', image: 'https://i.pravatar.cc/80?img=11' },
      { name: 'Dua Lipa', image: 'https://i.pravatar.cc/80?img=12' },
      { name: 'Drake', image: 'https://i.pravatar.cc/80?img=13' },
      { name: 'Taylor Swift', image: 'https://i.pravatar.cc/80?img=14' },
      { name: 'Bad Bunny', image: 'https://i.pravatar.cc/80?img=15' },
    ]);
    setSpotifyConnected(true);
    setConnectingService(null);
    setShowSpotifyDialog(false);
    setSnackbar({ open: true, message: '🎵 Spotify connected successfully!' });
  };
  
  const handleDisconnectSpotify = () => {
    setSpotifyConnected(false);
    setSpotifyArtists([]);
    setSnackbar({ open: true, message: 'Spotify disconnected' });
  };
  
  // Instagram connection handler
  const handleConnectInstagram = async () => {
    setConnectingService('instagram');
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock Instagram photos
    setInstagramPhotos([
      'https://picsum.photos/200?random=1',
      'https://picsum.photos/200?random=2',
      'https://picsum.photos/200?random=3',
      'https://picsum.photos/200?random=4',
      'https://picsum.photos/200?random=5',
      'https://picsum.photos/200?random=6',
    ]);
    setInstagramConnected(true);
    setConnectingService(null);
    setShowInstagramDialog(false);
    setSnackbar({ open: true, message: '📸 Instagram connected successfully!' });
  };
  
  const handleDisconnectInstagram = () => {
    setInstagramConnected(false);
    setInstagramPhotos([]);
    setSnackbar({ open: true, message: 'Instagram disconnected' });
  };
  
  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSnackbar({ open: true, message: 'Profile saved successfully!' });
  };
  
  // Section colors for different types
  const getSectionColor = (title) => {
    const colors = {
      'Photos': { bg: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)', light: 'rgba(108,92,231,0.1)' },
      'About Me': { bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', light: 'rgba(236,72,153,0.1)' },
      'Interests': { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', light: 'rgba(245,158,11,0.1)' },
      'Prompts': { bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', light: 'rgba(16,185,129,0.1)' },
      'Verification': { bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', light: 'rgba(59,130,246,0.1)' },
      'About You': { bg: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', light: 'rgba(139,92,246,0.1)' },
      'More About You': { bg: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)', light: 'rgba(20,184,166,0.1)' },
      'Causes & Communities': { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', light: 'rgba(239,68,68,0.1)' },
      'Qualities I Value': { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', light: 'rgba(245,158,11,0.1)' },
      'Star Sign': { bg: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)', light: 'rgba(139,92,246,0.1)' },
      'Languages': { bg: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', light: 'rgba(14,165,233,0.1)' },
      'Connected Accounts': { bg: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', light: 'rgba(34,197,94,0.1)' },
      'Dating Intention': { bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', light: 'rgba(236,72,153,0.1)' },
      'Love Language': { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', light: 'rgba(239,68,68,0.1)' },
      'Lifestyle': { bg: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', light: 'rgba(6,182,212,0.1)' },
      'Voice Intro': { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', light: 'rgba(245,158,11,0.1)' },
      'Additional Info': { bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', light: 'rgba(99,102,241,0.1)' },
    };
    return colors[title] || { bg: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)', light: 'rgba(108,92,231,0.1)' };
  };

  // Section component
  const Section = ({ icon: Icon, title, subtitle, children, action }) => {
    const sectionColor = getSectionColor(title);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            p: 2.5,
            mb: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: sectionColor.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Icon size={22} color="#fff" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {action}
          </Box>
          {children}
        </Box>
      </motion.div>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pb: 'calc(100px + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(248,250,252,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <IconButton onClick={handleBack}>
            <ArrowLeft size={22} color="#1a1a2e" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            Edit Profile
          </Typography>
          <IconButton onClick={() => setShowPreviewDialog(true)}>
            <Eye size={22} color="#6C5CE7" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Profile Strength Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 50%, #ec4899 100%)',
              borderRadius: '24px',
              p: 3,
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative elements */}
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
              <Sparkles size={120} color="#fff" />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Circular progress */}
              <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={80}
                  thickness={4}
                  sx={{ color: 'rgba(255,255,255,0.2)', position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={profileStrength}
                  size={80}
                  thickness={4}
                  sx={{ color: '#fff' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                    {profileStrength}%
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                  Profile Strength
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                  {strengthInfo.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {profileStrength < 100 ? 'Complete your profile to get more matches' : 'Your profile is fully optimized!'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Photos Section */}
        <Section
          icon={Camera}
          title="Photos"
          subtitle={`${photos.length}/${MAX_PHOTOS} photos`}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Box
                  onClick={() => handlePhotoClick(index)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: photo.isPrimary ? '3px solid #d1d5db' : '2px solid transparent',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <Avatar
                    src={photo.url}
                    variant="rounded"
                    sx={{ width: '100%', height: '100%' }}
                  />
                  
                  {photo.isPrimary && (
                    <Chip
                      label="Primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        height: 22,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#6C5CE7',
                        color: '#fff',
                      }}
                    />
                  )}
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <X size={14} color="#fff" />
                  </IconButton>
                </Box>
              </motion.div>
            ))}
            
            {photos.length < MAX_PHOTOS && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: photos.length * 0.1 }}
              >
                <Box
                  onClick={handleAddPhoto}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: '16px',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#6C5CE7',
                      backgroundColor: 'rgba(108,92,231,0.05)',
                    },
                  }}
                >
                  <Plus size={24} color="#94a3b8" />
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>
                    Add
                  </Typography>
                </Box>
              </motion.div>
            )}
          </Box>
          
          {/* Smart photos toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              p: 1.5,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Zap size={18} color="#6C5CE7" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  Smart Photos
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Auto-optimize photo order
                </Typography>
              </Box>
            </Box>
            <Switch
              size="small"
              checked={smartPhotos}
              onChange={(e) => setSmartPhotos(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </Box>
        </Section>

        {/* Bio Section */}
        <Section
          icon={Edit3}
          title="About Me"
          subtitle={`${bio.length}/${MAX_BIO_LENGTH}`}
        >
          <TextField
            multiline
            rows={4}
            placeholder="Write something about yourself that makes you unique..."
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
              },
            }}
          />
        </Section>

        {/* Interests Section */}
        <Section
          icon={Heart}
          title="Interests"
          subtitle={`${interests.length}/${MAX_INTERESTS} selected`}
          action={
            <IconButton
              size="small"
              onClick={() => setShowInterestDialog(true)}
              sx={{ backgroundColor: 'rgba(108,92,231,0.1)' }}
            >
              <Plus size={18} color="#6C5CE7" />
            </IconButton>
          }
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <AnimatePresence>
              {interests.map((interest, index) => (
                <motion.div
                  key={interest.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Chip
                    label={`${interest.emoji} ${interest.label}`}
                    onDelete={() => handleRemoveInterest(index)}
                    sx={{
                      borderRadius: '20px',
                      fontWeight: 500,
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      '& .MuiChip-deleteIcon': { color: '#94a3b8' },
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
          
          {interests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Add interests to help matches find you
              </Typography>
            </Box>
          )}
        </Section>

        {/* Prompts Section */}
        <Section
          icon={MessageSquare}
          title="Prompts"
          subtitle="Show your personality"
          action={
            <IconButton
              size="small"
              onClick={() => setShowPromptDialog(true)}
              sx={{ backgroundColor: 'rgba(108,92,231,0.1)' }}
            >
              <Plus size={18} color="#6C5CE7" />
            </IconButton>
          }
        >
          {prompts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                      {prompt.prompt}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a1a2e', mt: 0.5 }}>
                      {prompt.answer}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePrompt(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <Trash2 size={14} color="#94a3b8" />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
            </Box>
          ) : (
            <Box
              onClick={() => setShowPromptDialog(true)}
              sx={{
                p: 3,
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#6C5CE7', backgroundColor: 'rgba(108,92,231,0.02)' },
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Add prompts to showcase your personality
              </Typography>
            </Box>
          )}
        </Section>

        {/* Verification Section */}
        <Section
          icon={verified ? ShieldCheck : Shield}
          title="Verification"
          subtitle={verified ? 'Your profile is verified' : 'Verify to build trust'}
        >
          {verified ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
              }}
            >
              <ShieldCheck size={24} color="#22c55e" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534' }}>
                  Verified Profile
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d' }}>
                  Your identity has been confirmed
                </Typography>
              </Box>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowVerifyDialog(true)}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                '&:hover': { backgroundColor: 'rgba(108,92,231,0.05)' },
              }}
            >
              Verify my profile
            </Button>
          )}
        </Section>

        {/* About You Section */}
        <Section icon={Users} title="About You" subtitle="Basic info">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ABOUT_YOU_FIELDS.map((field) => (
              <Box
                key={field.key}
                onClick={() => setShowFieldDialog({ type: 'text', field })}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <field.icon size={18} color="#64748b" />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: aboutYou[field.key] ? '#1a1a2e' : '#94a3b8' }}>
                    {aboutYou[field.key] || 'Add'}
                  </Typography>
                  <ChevronRight size={16} color="#94a3b8" />
                </Box>
              </Box>
            ))}
          </Box>
        </Section>

        {/* More About You Section */}
        <Section icon={Compass} title="More About You" subtitle="Help people know you better">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {MORE_ABOUT_FIELDS.map((field) => (
              <Box
                key={field.key}
                onClick={() => field.type === 'height' ? setShowHeightDialog(true) : setShowFieldDialog({ type: 'select', field })}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  backgroundColor: field.key === 'height' ? 'rgba(108,92,231,0.08)' : '#f8fafc',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: field.key === 'height' ? '1px solid rgba(108,92,231,0.2)' : 'none',
                  '&:hover': { backgroundColor: field.key === 'height' ? 'rgba(108,92,231,0.12)' : '#f1f5f9' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: field.key === 'height' ? '#6C5CE7' : 'rgba(100,116,139,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <field.icon size={16} color={field.key === 'height' ? '#fff' : '#64748b'} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                    {moreAbout[field.key]}
                  </Typography>
                  <ChevronRight size={16} color="#94a3b8" />
                </Box>
              </Box>
            ))}
          </Box>
        </Section>

        {/* Causes & Communities Section */}
        <Section
          icon={HandHeart}
          title="Causes & Communities"
          subtitle={`${causes.length}/${MAX_CAUSES} selected`}
          action={
            <IconButton
              size="small"
              onClick={() => setShowCausesDialog(true)}
              sx={{ backgroundColor: 'rgba(108,92,231,0.1)' }}
            >
              <Plus size={18} color="#6C5CE7" />
            </IconButton>
          }
        >
          {causes.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {causes.map((cause) => (
                <Chip
                  key={cause}
                  label={cause}
                  onDelete={() => handleToggleCause(cause)}
                  sx={{
                    borderRadius: '20px',
                    fontWeight: 500,
                    backgroundColor: 'rgba(108,92,231,0.1)',
                    color: '#6C5CE7',
                    border: '1px solid rgba(108,92,231,0.2)',
                  }}
                />
              ))}
            </Box>
          ) : (
            <Box
              onClick={() => setShowCausesDialog(true)}
              sx={{
                p: 2,
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: '#6C5CE7' },
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Add causes you care about
              </Typography>
            </Box>
          )}
        </Section>

        {/* Qualities I Value Section */}
        <Section
          icon={Star}
          title="Qualities I Value"
          subtitle={`${qualities.length}/${MAX_QUALITIES} selected`}
          action={
            <IconButton
              size="small"
              onClick={() => setShowQualitiesDialog(true)}
              sx={{ backgroundColor: 'rgba(108,92,231,0.1)' }}
            >
              <Edit3 size={16} color="#6C5CE7" />
            </IconButton>
          }
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {qualities.map((quality) => (
              <Chip
                key={quality}
                label={quality}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              />
            ))}
          </Box>
        </Section>

        {/* Star Sign Section */}
        <Section icon={Sparkles} title="Star Sign">
          <Box
            onClick={() => setShowStarSignDialog(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
              {starSign}
            </Typography>
            <ChevronRight size={16} color="#94a3b8" />
          </Box>
        </Section>

        {/* Languages Section */}
        <Section
          icon={Globe}
          title="Languages"
          subtitle={`${languages.length} languages`}
          action={
            <IconButton
              size="small"
              onClick={() => setShowLanguageDialog(true)}
              sx={{ backgroundColor: 'rgba(108,92,231,0.1)' }}
            >
              <Plus size={18} color="#6C5CE7" />
            </IconButton>
          }
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {languages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                onDelete={() => handleRemoveLanguage(lang)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                }}
              />
            ))}
          </Box>
        </Section>

        {/* Connected Accounts Section */}
        <Section icon={Music} title="Connected Accounts" subtitle="Enrich your profile with social accounts">
          {/* Spotify */}
          <Box
            sx={{
              p: 2,
              backgroundColor: spotifyConnected ? '#f0fdf4' : '#f8fafc',
              borderRadius: '16px',
              border: spotifyConnected ? '2px solid #1db954' : '1px solid #e2e8f0',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: spotifyConnected ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(29,185,84,0.3)',
                  }}
                >
                  <Music size={22} color="#fff" />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Spotify
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {spotifyConnected ? 'Show your top artists' : 'Connect to display your music taste'}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant={spotifyConnected ? 'outlined' : 'contained'}
                onClick={() => spotifyConnected ? handleDisconnectSpotify() : setShowSpotifyDialog(true)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  ...(spotifyConnected ? {
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': { backgroundColor: 'rgba(239,68,68,0.05)' },
                  } : {
                    backgroundColor: '#1db954',
                    '&:hover': { backgroundColor: '#1aa34a' },
                  }),
                }}
              >
                {spotifyConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </Box>
            
            {/* Show top artists when connected */}
            {spotifyConnected && spotifyArtists.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                  Your Top Artists
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                  {spotifyArtists.map((artist, index) => (
                    <Box key={index} sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Avatar
                        src={artist.image}
                        sx={{
                          width: 52,
                          height: 52,
                          border: '2px solid #1db954',
                          mb: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#1a1a2e',
                          fontWeight: 500,
                          fontSize: '0.65rem',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 60,
                        }}
                      >
                        {artist.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Instagram */}
          <Box
            sx={{
              p: 2,
              backgroundColor: instagramConnected ? '#fef3f2' : '#f8fafc',
              borderRadius: '16px',
              border: instagramConnected ? '2px solid #e1306c' : '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: instagramConnected ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(225,48,108,0.3)',
                  }}
                >
                  <Instagram size={22} color="#fff" />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Instagram
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {instagramConnected ? 'Import photos to your profile' : 'Connect to import your photos'}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant={instagramConnected ? 'outlined' : 'contained'}
                onClick={() => instagramConnected ? handleDisconnectInstagram() : setShowInstagramDialog(true)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  ...(instagramConnected ? {
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': { backgroundColor: 'rgba(239,68,68,0.05)' },
                  } : {
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    '&:hover': { opacity: 0.9 },
                  }),
                }}
              >
                {instagramConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </Box>
            
            {/* Show Instagram photos when connected */}
            {instagramConnected && instagramPhotos.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                  Recent Photos (tap to import)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {instagramPhotos.slice(0, 6).map((photo, index) => (
                    <Box
                      key={index}
                      onClick={() => {
                        // Add photo to profile
                        if (photos.length < MAX_PHOTOS) {
                          setPhotos(prev => [...prev, { id: Date.now() + index, url: photo, isPrimary: false }]);
                          setSnackbar({ open: true, message: 'Photo added to profile!' });
                        }
                      }}
                      sx={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          '& .overlay': { opacity: 1 },
                        },
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Instagram ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        className="overlay"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <Plus size={20} color="#fff" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Section>

        {/* Dating Intention Section */}
        <Section icon={HeartIcon} title="Dating Intention" subtitle="What are you looking for?">
          <Box
            onClick={() => setShowDatingIntentionDialog(true)}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(108,92,231,0.2)',
              cursor: 'pointer',
              '&:hover': { borderColor: '#6C5CE7' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5">
                  {DATING_INTENTIONS.find(d => d.value === datingIntention)?.emoji}
                </Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {DATING_INTENTIONS.find(d => d.value === datingIntention)?.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {DATING_INTENTIONS.find(d => d.value === datingIntention)?.description}
                  </Typography>
                </Box>
              </Box>
              <ChevronRight size={20} color="#6C5CE7" />
            </Box>
          </Box>
        </Section>

        {/* Love Language Section */}
        <Section icon={Heart} title="Love Language" subtitle="How do you express love?">
          <Box
            onClick={() => setShowLoveLanguageDialog(true)}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(244,114,182,0.1) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(239,68,68,0.2)',
              cursor: 'pointer',
              '&:hover': { borderColor: '#ef4444' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5">
                  {LOVE_LANGUAGES.find(l => l.value === loveLanguage)?.emoji}
                </Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {LOVE_LANGUAGES.find(l => l.value === loveLanguage)?.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {LOVE_LANGUAGES.find(l => l.value === loveLanguage)?.description}
                  </Typography>
                </Box>
              </Box>
              <ChevronRight size={20} color="#ef4444" />
            </Box>
          </Box>
        </Section>

        {/* Lifestyle Section */}
        <Section icon={Waves} title="Lifestyle" subtitle="Your daily vibe">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Communication Style */}
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <MessageCircle size={24} color="#6C5CE7" style={{ marginBottom: 8 }} />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Communication
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {COMMUNICATION_STYLES.find(c => c.value === communicationStyle)?.emoji}{' '}
                {COMMUNICATION_STYLES.find(c => c.value === communicationStyle)?.label}
              </Typography>
            </Box>

            {/* Pet Preference */}
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <Dog size={24} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Pets
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {PET_PREFERENCES.find(p => p.value === petPreference)?.emoji}{' '}
                {PET_PREFERENCES.find(p => p.value === petPreference)?.label}
              </Typography>
            </Box>

            {/* Social Battery */}
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <Battery size={24} color="#22c55e" style={{ marginBottom: 8 }} />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Social
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {SOCIAL_BATTERY.find(s => s.value === socialBattery)?.emoji}{' '}
                {SOCIAL_BATTERY.find(s => s.value === socialBattery)?.label}
              </Typography>
            </Box>

            {/* Sleep Schedule */}
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <Moon size={24} color="#8b5cf6" style={{ marginBottom: 8 }} />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Schedule
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {SLEEP_SCHEDULES.find(s => s.value === sleepSchedule)?.emoji}{' '}
                {SLEEP_SCHEDULES.find(s => s.value === sleepSchedule)?.label}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowLifestyleDialog(true)}
            sx={{
              mt: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Edit Lifestyle Preferences
          </Button>
        </Section>

        {/* Voice Intro Section */}
        <Section icon={Mic} title="Voice Intro" subtitle="Let them hear your voice">
          <Box
            sx={{
              p: 3,
              background: voiceIntroRecorded 
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
                : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              border: voiceIntroRecorded ? '2px solid #22c55e' : '2px solid #f59e0b',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: voiceIntroRecorded ? '#22c55e' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Mic size={28} color="#fff" />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
              {voiceIntroRecorded ? 'Voice intro recorded!' : 'Record a 30-second intro'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
              {voiceIntroRecorded 
                ? 'Profiles with voice intros get 40% more matches'
                : 'Stand out by letting potential matches hear your voice'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setVoiceIntroRecorded(!voiceIntroRecorded);
                setSnackbar({ 
                  open: true, 
                  message: voiceIntroRecorded ? 'Voice intro removed' : '🎤 Voice intro saved!' 
                });
              }}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                backgroundColor: voiceIntroRecorded ? '#ef4444' : '#f59e0b',
                '&:hover': { backgroundColor: voiceIntroRecorded ? '#dc2626' : '#d97706' },
              }}
            >
              {voiceIntroRecorded ? 'Remove Recording' : 'Start Recording'}
            </Button>
          </Box>
        </Section>

        {/* Additional Info Section */}
        <Section icon={Brain} title="Additional Info" subtitle="Optional details">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Personality Type */}
            <Box
              onClick={() => {
                const types = ['', ...PERSONALITY_TYPES];
                const currentIndex = types.indexOf(personalityType);
                setPersonalityType(types[(currentIndex + 1) % types.length]);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f1f5f9' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Brain size={18} color="#8b5cf6" />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                  Personality Type (MBTI)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: personalityType ? '#1a1a2e' : '#94a3b8', fontWeight: 600 }}>
                  {personalityType || 'Add'}
                </Typography>
                <ChevronRight size={16} color="#94a3b8" />
              </Box>
            </Box>

            {/* Religion */}
            <Box
              onClick={() => {
                const options = ['', ...RELIGIONS];
                const currentIndex = options.indexOf(religion);
                setReligion(options[(currentIndex + 1) % options.length]);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f1f5f9' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Sparkles size={18} color="#6C5CE7" />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                  Religion
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: religion ? '#1a1a2e' : '#94a3b8' }}>
                  {religion || 'Add'}
                </Typography>
                <ChevronRight size={16} color="#94a3b8" />
              </Box>
            </Box>

            {/* Dietary Preference */}
            <Box
              onClick={() => {
                const options = ['', ...DIETARY_OPTIONS.map(d => d.value)];
                const currentIndex = options.indexOf(dietaryPreference);
                setDietaryPreference(options[(currentIndex + 1) % options.length]);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f1f5f9' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Utensils size={18} color="#22c55e" />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                  Dietary Preference
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: dietaryPreference ? '#1a1a2e' : '#94a3b8' }}>
                  {dietaryPreference 
                    ? `${DIETARY_OPTIONS.find(d => d.value === dietaryPreference)?.emoji} ${DIETARY_OPTIONS.find(d => d.value === dietaryPreference)?.label}`
                    : 'Add'}
                </Typography>
                <ChevronRight size={16} color="#94a3b8" />
              </Box>
            </Box>
          </Box>
        </Section>
      </Box>

      {/* Floating Save Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(248,250,252,1) 80%, rgba(248,250,252,0))',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            py: 1.75,
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            boxShadow: '0 8px 24px rgba(108,92,231,0.3)',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Photo Source Dialog */}
      <Dialog
        open={showPhotoDialog}
        onClose={() => setShowPhotoDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Photo</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Image size={18} />}
            onClick={handleSelectFromGallery}
            sx={{ mb: 1.5, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Choose from gallery
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Camera size={18} />}
            onClick={() => {
              setShowPhotoDialog(false);
              // Would trigger camera
            }}
            sx={{ mb: 1.5, py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Take a photo
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Instagram size={18} />}
            onClick={() => {
              setShowPhotoDialog(false);
              window.open('https://instagram.com', '_blank');
            }}
            sx={{ py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Import from Instagram
          </Button>
        </DialogContent>
      </Dialog>

      {/* Prompt Dialog */}
      <Dialog
        open={showPromptDialog}
        onClose={() => setShowPromptDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Prompt</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PROMPT_OPTIONS.filter(p => !prompts.some(pr => pr.prompt === p)).map((prompt) => (
              <Button
                key={prompt}
                variant={selectedPrompt === prompt ? 'contained' : 'outlined'}
                onClick={() => setSelectedPrompt(prompt)}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  ...(selectedPrompt === prompt && {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  }),
                }}
              >
                {prompt}
              </Button>
            ))}
          </Box>
          
          {selectedPrompt && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Your answer..."
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowPromptDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPrompt}
            disabled={!selectedPrompt || !promptAnswer.trim()}
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interest Dialog */}
      <Dialog
        open={showInterestDialog}
        onClose={() => setShowInterestDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Interests</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search or add custom interest..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newInterest.trim()) {
                handleAddInterest({ emoji: '⭐', label: newInterest.trim() });
                setNewInterest('');
              }
            }}
          />
          
          <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
            Suggestions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {INTEREST_SUGGESTIONS.filter(s => !interests.some(i => i.label === s.label)).map((suggestion) => (
              <Chip
                key={suggestion.label}
                label={`${suggestion.emoji} ${suggestion.label}`}
                onClick={() => handleAddInterest(suggestion)}
                sx={{
                  borderRadius: '20px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(108,92,231,0.1)' },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowInterestDialog(false)} sx={{ color: '#64748b' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog
        open={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Verify Your Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Shield size={36} color="#fff" />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Take a quick selfie to verify your identity. This helps build trust with potential matches.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Start Verification
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowVerifyDialog(false)}
            sx={{ color: '#64748b' }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              height: 350,
              backgroundImage: photos[0]?.url ? `url(${photos[0].url})` : 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                  {MOCK_USER.name}, {MOCK_USER.age}
                </Typography>
                {verified && <ShieldCheck size={20} color="#22c55e" />}
              </Box>
              {bio && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {bio.slice(0, 100)}{bio.length > 100 ? '...' : ''}
                </Typography>
              )}
            </Box>
          </Box>
          
          {interests.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interests.slice(0, 5).map((interest) => (
                <Chip
                  key={interest.label}
                  label={`${interest.emoji} ${interest.label}`}
                  size="small"
                  sx={{ borderRadius: '16px' }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth onClick={() => setShowPreviewDialog(false)} sx={{ color: '#64748b' }}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Causes Dialog */}
      <Dialog
        open={showCausesDialog}
        onClose={() => setShowCausesDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Select Causes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Choose up to {MAX_CAUSES} causes you care about
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {CAUSES_OPTIONS.map((cause) => (
              <Chip
                key={cause}
                label={cause}
                onClick={() => handleToggleCause(cause)}
                sx={{
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  backgroundColor: causes.includes(cause) ? '#6C5CE7' : '#f1f5f9',
                  color: causes.includes(cause) ? '#fff' : '#1a1a2e',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowCausesDialog(false)}
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Qualities Dialog */}
      <Dialog
        open={showQualitiesDialog}
        onClose={() => setShowQualitiesDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Qualities I Value</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Choose up to {MAX_QUALITIES} qualities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {QUALITIES_OPTIONS.map((quality) => (
              <Chip
                key={quality}
                label={quality}
                onClick={() => handleToggleQuality(quality)}
                sx={{
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  backgroundColor: qualities.includes(quality) ? '#f59e0b' : '#f1f5f9',
                  color: qualities.includes(quality) ? '#fff' : '#1a1a2e',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowQualitiesDialog(false)}
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field Edit Dialog */}
      <Dialog
        open={!!showFieldDialog}
        onClose={() => setShowFieldDialog(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{showFieldDialog?.field?.label}</DialogTitle>
        <DialogContent>
          {showFieldDialog?.type === 'text' ? (
            <TextField
              fullWidth
              placeholder={showFieldDialog?.field?.placeholder}
              defaultValue={aboutYou[showFieldDialog?.field?.key] || ''}
              onBlur={(e) => handleUpdateAboutYou(showFieldDialog?.field?.key, e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              autoFocus
            />
          ) : showFieldDialog?.type === 'select' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {showFieldDialog?.field?.options?.map((option) => (
                <Button
                  key={option}
                  variant={moreAbout[showFieldDialog?.field?.key] === option ? 'contained' : 'outlined'}
                  onClick={() => handleUpdateMoreAbout(showFieldDialog?.field?.key, option)}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 500,
                    justifyContent: 'flex-start',
                    ...(moreAbout[showFieldDialog?.field?.key] === option && {
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    }),
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowFieldDialog(null)} sx={{ color: '#64748b' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Star Sign Dialog */}
      <Dialog
        open={showStarSignDialog}
        onClose={() => setShowStarSignDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Select Star Sign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {ZODIAC_SIGNS.map((sign) => (
              <Button
                key={sign}
                variant={starSign === sign ? 'contained' : 'outlined'}
                onClick={() => {
                  setStarSign(sign);
                  setShowStarSignDialog(false);
                }}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                  ...(starSign === sign && {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  }),
                }}
              >
                {sign}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog
        open={showLanguageDialog}
        onClose={() => setShowLanguageDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Languages</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Select languages you speak (up to 5)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {LANGUAGES.filter(l => !languages.includes(l)).map((lang) => (
              <Chip
                key={lang}
                label={lang}
                onClick={() => handleAddLanguage(lang)}
                sx={{
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(108,92,231,0.1)' },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowLanguageDialog(false)} sx={{ color: '#64748b' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dating Intention Dialog */}
      <Dialog
        open={showDatingIntentionDialog}
        onClose={() => setShowDatingIntentionDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            What are you looking for?
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Be honest - it helps find better matches
          </Typography>
        </Box>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DATING_INTENTIONS.map((intention) => (
              <Box
                key={intention.value}
                onClick={() => {
                  setDatingIntention(intention.value);
                  setShowDatingIntentionDialog(false);
                }}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: datingIntention === intention.value ? '2px solid #d1d5db' : '1px solid #e2e8f0',
                  backgroundColor: datingIntention === intention.value ? 'rgba(108,92,231,0.1)' : '#fff',
                  '&:hover': { backgroundColor: 'rgba(108,92,231,0.05)' },
                }}
              >
                <Typography variant="h5">{intention.emoji}</Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {intention.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {intention.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Love Language Dialog */}
      <Dialog
        open={showLoveLanguageDialog}
        onClose={() => setShowLoveLanguageDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f472b6 100%)',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Your Love Language
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            How do you prefer to give and receive love?
          </Typography>
        </Box>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {LOVE_LANGUAGES.map((lang) => (
              <Box
                key={lang.value}
                onClick={() => {
                  setLoveLanguage(lang.value);
                  setShowLoveLanguageDialog(false);
                }}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: loveLanguage === lang.value ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  backgroundColor: loveLanguage === lang.value ? 'rgba(239,68,68,0.1)' : '#fff',
                  '&:hover': { backgroundColor: 'rgba(239,68,68,0.05)' },
                }}
              >
                <Typography variant="h5">{lang.emoji}</Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {lang.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {lang.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Lifestyle Dialog */}
      <Dialog
        open={showLifestyleDialog}
        onClose={() => setShowLifestyleDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
          Lifestyle Preferences
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Communication Style */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
            💬 Communication Style
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {COMMUNICATION_STYLES.map((style) => (
              <Chip
                key={style.value}
                label={`${style.emoji} ${style.label}`}
                onClick={() => setCommunicationStyle(style.value)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: communicationStyle === style.value ? '#6C5CE7' : '#f1f5f9',
                  color: communicationStyle === style.value ? '#fff' : '#1a1a2e',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>

          {/* Pet Preference */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
            🐾 Pet Preference
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {PET_PREFERENCES.map((pet) => (
              <Chip
                key={pet.value}
                label={`${pet.emoji} ${pet.label}`}
                onClick={() => setPetPreference(pet.value)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: petPreference === pet.value ? '#f59e0b' : '#f1f5f9',
                  color: petPreference === pet.value ? '#fff' : '#1a1a2e',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>

          {/* Social Battery */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
            ⚡ Social Battery
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {SOCIAL_BATTERY.map((social) => (
              <Chip
                key={social.value}
                label={`${social.emoji} ${social.label}`}
                onClick={() => setSocialBattery(social.value)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: socialBattery === social.value ? '#22c55e' : '#f1f5f9',
                  color: socialBattery === social.value ? '#fff' : '#1a1a2e',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>

          {/* Sleep Schedule */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
            🌙 Sleep Schedule
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SLEEP_SCHEDULES.map((schedule) => (
              <Chip
                key={schedule.value}
                label={`${schedule.emoji} ${schedule.label}`}
                onClick={() => setSleepSchedule(schedule.value)}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 500,
                  backgroundColor: sleepSchedule === schedule.value ? '#8b5cf6' : '#f1f5f9',
                  color: sleepSchedule === schedule.value ? '#fff' : '#1a1a2e',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowLifestyleDialog(false)}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>

      {/* Height Picker Dialog */}
      <Dialog
        open={showHeightDialog}
        onClose={() => setShowHeightDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Ruler size={32} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            Select Your Height
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Choose from the options below
          </Typography>
        </Box>
        <DialogContent sx={{ p: 2, maxHeight: '50vh' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {HEIGHT_OPTIONS.map((height) => (
              <Box
                key={height.value}
                onClick={() => {
                  handleUpdateMoreAbout('height', height.label);
                  setShowHeightDialog(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: moreAbout.height === height.label ? '2px solid #d1d5db' : '1px solid #e2e8f0',
                  backgroundColor: moreAbout.height === height.label ? 'rgba(108,92,231,0.1)' : '#fff',
                  '&:hover': { backgroundColor: 'rgba(108,92,231,0.05)', borderColor: '#6C5CE7' },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Visual height indicator */}
                  <Box
                    sx={{
                      width: 8,
                      height: Math.max(24, (parseInt(height.value) - 140) * 0.6),
                      borderRadius: '4px',
                      background: moreAbout.height === height.label 
                        ? 'linear-gradient(180deg, #6C5CE7 0%, #a855f7 100%)'
                        : 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
                    }}
                  />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {height.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {height.imperial}
                    </Typography>
                  </Box>
                </Box>
                {moreAbout.height === height.label && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#6C5CE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#fff" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Spotify Connect Dialog */}
      <Dialog
        open={showSpotifyDialog}
        onClose={() => !connectingService && setShowSpotifyDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Music size={40} color="#fff" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
            Connect Spotify
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Show your music taste on your profile
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              By connecting Spotify, you'll be able to:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                '🎵 Display your top artists on your profile',
                '💜 Find matches with similar music taste',
                '🎧 Share what you\'re currently listening to',
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1a1a2e' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center' }}>
            We only access your public profile and top artists. You can disconnect anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConnectSpotify}
            disabled={connectingService === 'spotify'}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              backgroundColor: '#1db954',
              '&:hover': { backgroundColor: '#1aa34a' },
            }}
          >
            {connectingService === 'spotify' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: '#fff' }} />
                Connecting...
              </Box>
            ) : (
              'Connect with Spotify'
            )}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowSpotifyDialog(false)}
            disabled={connectingService === 'spotify'}
            sx={{ color: '#64748b' }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instagram Connect Dialog */}
      <Dialog
        open={showInstagramDialog}
        onClose={() => !connectingService && setShowInstagramDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Instagram size={40} color="#fff" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
            Connect Instagram
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Import your best photos easily
          </Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              By connecting Instagram, you'll be able to:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                '📸 Import photos directly to your profile',
                '✨ Keep your profile fresh with latest pics',
                '🔗 Show your Instagram handle to matches',
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1a1a2e' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center' }}>
            We only access your public photos. You can disconnect anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConnectInstagram}
            disabled={connectingService === 'instagram'}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              '&:hover': { opacity: 0.9 },
            }}
          >
            {connectingService === 'instagram' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: '#fff' }} />
                Connecting...
              </Box>
            ) : (
              'Connect with Instagram'
            )}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowInstagramDialog(false)}
            disabled={connectingService === 'instagram'}
            sx={{ color: '#64748b' }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          mb: 10,
          '& .MuiSnackbarContent-root': {
            borderRadius: '12px',
            backgroundColor: '#1a1a2e',
          },
        }}
      />
    </Box>
  );
}
