// ProfileSettings.jsx
// Per spec: "Identity hub" - human, calm, flexible, respectful
// NOT: bureaucratic, judgmental, gamified, punitive
// "If editing the profile feels like work — the system failed"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Avatar,
  Button,
  Chip,
  Stack,
  TextField,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  Divider,
  Snackbar,
  Alert,
  InputAdornment,
  Slider,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowLeft,
  Camera,
  Plus,
  Shield,
  Star,
  CheckCircle,
  X as XIcon,
  Image,
  Search,
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  Ruler,
  Heart,
  Users,
  Coffee,
  Music,
  Compass,
  Instagram,
  Link2,
  Coins,
  ChevronRight,
  Lightbulb,
  SkipForward,
  Check,
  X,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AboutSections from "../components/AboutSections";
import ProfileExtras from "../components/ProfileExtras";
import { useAuth } from "../context/AuthContext";
import { ProfileTimeline } from "../components/timeline";
import { Eye } from "lucide-react";

/* ---------------------------------------
   Brand / theme settings (same as Home)
--------------------------------------- */
const SAFE_BOTTOM =
  "calc(var(--app-bottom-nav-height, 88px) + env(safe-area-inset-bottom, 0px))";

const DEFAULT_BRAND = { primary: "#6C5CE7", accent: "#F43F5E" };
const DEFAULT_TAG_STYLE = "soft";
const DEFAULT_RADIUS = 999;

function loadAppSettings() {
  try {
    const fromWindow =
      typeof window !== "undefined" ? window.APP_SETTINGS : null;
    const fromLocal =
      (typeof window !== "undefined" &&
        (localStorage.getItem("app.settings") ||
          localStorage.getItem("appTheme"))) ||
      null;
    const parsed = fromLocal ? JSON.parse(fromLocal) : {};
    const brand =
      parsed.brand || parsed.palette || (fromWindow && fromWindow.brand) || DEFAULT_BRAND;
    const tagStyle =
      parsed.tagStyle || (fromWindow && fromWindow.tagStyle) || DEFAULT_TAG_STYLE;
    const radius =
      parsed.radius != null
        ? parsed.radius
        : fromWindow && fromWindow.radius != null
        ? fromWindow.radius
        : DEFAULT_RADIUS;

    return { brand, tagStyle, radius };
  } catch {
    return {
      brand: DEFAULT_BRAND,
      tagStyle: DEFAULT_TAG_STYLE,
      radius: DEFAULT_RADIUS,
    };
  }
}

/* --- Quick demo data --- */
const mockPhotos = [
  { url: "https://randomuser.me/api/portraits/women/44.jpg", label: "Primary" },
  { url: "", label: "3" },
];

const mockInterests = [
  { emoji: "🍹", label: "Bars" },
  { emoji: "🏖️", label: "Beaches" },
  { emoji: "⛺", label: "Camping" },
];

const INTEREST_CATEGORIES = [
  {
    name: 'Music & Entertainment',
    emoji: '🎵',
    interests: ['Live Music', 'Concerts', 'Karaoke', 'Podcasts', 'Stand-up Comedy', 'Theater', 'Movies', 'Netflix', 'K-Pop', 'Hip Hop', 'Rock', 'Jazz'],
  },
  {
    name: 'Sports & Fitness',
    emoji: '⚽',
    interests: ['Gym', 'Running', 'Yoga', 'Swimming', 'Football', 'Basketball', 'Tennis', 'Hiking', 'Cycling', 'CrossFit', 'Martial Arts', 'Dancing'],
  },
  {
    name: 'Food & Drinks',
    emoji: '🍕',
    interests: ['Cooking', 'Foodie', 'Wine', 'Coffee', 'Brunch', 'Vegan', 'Sushi', 'BBQ', 'Baking', 'Craft Beer', 'Cocktails', 'Street Food'],
  },
  {
    name: 'Travel & Adventure',
    emoji: '✈️',
    interests: ['Travel', 'Backpacking', 'Road Trips', 'Beach', 'Mountains', 'Camping', 'City Breaks', 'Adventure Sports', 'Scuba Diving', 'Skiing'],
  },
  {
    name: 'Arts & Culture',
    emoji: '🎨',
    interests: ['Art', 'Photography', 'Museums', 'Reading', 'Writing', 'Poetry', 'Design', 'Fashion', 'Architecture', 'History'],
  },
  {
    name: 'Lifestyle',
    emoji: '🌱',
    interests: ['Meditation', 'Spirituality', 'Volunteering', 'Sustainability', 'Pets', 'Dogs', 'Cats', 'Plants', 'Self-care', 'Astrology'],
  },
  {
    name: 'Tech & Gaming',
    emoji: '🎮',
    interests: ['Gaming', 'Tech', 'Startups', 'Crypto', 'AI', 'Board Games', 'Anime', 'Esports', 'VR', 'Coding'],
  },
  {
    name: 'Social',
    emoji: '🎉',
    interests: ['Parties', 'Nightlife', 'Festivals', 'Networking', 'Trivia', 'Wine Tasting', 'Book Club', 'Language Exchange'],
  },
];

const MAX_PER_CATEGORY = 3;

const mockCauses = [
  "Animal welfare",
  "Climate & environment",
  "Mental health",
  "Education",
  "Equality",
  "LGBTQ+",
  "Disaster relief",
  "Fight against hunger",
  "Clean water",
];

const mockQualities = [
  "Humor",
  "Kindness",
  "Openness",
  "Ambition",
  "Creativity",
  "Empathy",
  "Honesty",
  "Loyalty",
  "Patience",
];

// Prompts with AI-generated suggestions
const promptsWithSuggestions = {
  "The key to my heart is…": [
    "Good conversation and spontaneous adventures 💫",
    "Someone who makes me laugh until my stomach hurts 😂",
    "Authenticity and a shared love for good food 🍝",
    "Deep talks and comfortable silences ✨",
    "A genuine smile and kind heart 💕",
  ],
  "My ideal weekend is…": [
    "Brunch, beach, and good company 🏖️",
    "Exploring a new neighborhood with coffee in hand ☕",
    "Morning hike, afternoon nap, evening concert 🎵",
    "Farmers market, cooking together, movie night 🎬",
    "Spontaneous road trip to somewhere new 🚗",
  ],
  "A fun fact about me…": [
    "Data nerd by day, bookworm by night 📚",
    "I can name any song within 3 seconds 🎧",
    "I've visited 20 countries and counting 🌍",
    "I make the best homemade pasta you'll ever taste 🍝",
    "I once ran a marathon on a dare 🏃‍♀️",
  ],
  "Friends describe me as…": [
    "The one who always has a plan (and a backup plan) 📋",
    "The friend who remembers everyone's birthday 🎂",
    "Spontaneous, curious, and always up for an adventure 🌟",
    "The calm in the storm with great playlist taste 🎵",
    "A good listener with terrible dance moves 💃",
  ],
  "Currently obsessed with…": [
    "Training for the TLV marathon 🏃‍♀️",
    "Finding the city's best coffee spots ☕",
    "Learning to play guitar (my neighbors love me) 🎸",
    "Perfecting my sourdough recipe 🍞",
    "Binge-watching true crime documentaries 🔍",
  ],
  "You'll find me at…": [
    "The rooftop event tonight 🌃",
    "Working from the coffee shop nearby ☕",
    "The yoga studio every morning 🧘‍♀️",
    "The dog park with my best friend 🐕",
    "Any live music venue on weekends 🎤",
  ],
  "My happy place is…": [
    "Living mindfully, one breath at a time 🧘",
    "Just moved to the neighborhood 🏠",
    "Anywhere with good music and better company 🎵",
    "By the ocean, watching the sunset 🌅",
    "In the kitchen, experimenting with new recipes 👨‍🍳",
  ],
};

const mockPrompts = Object.keys(promptsWithSuggestions);

// Looking For options - matching registration screen style
const LOOKING_FOR_OPTIONS = [
  { id: "long_term", label: "Long-term relationship", icon: Heart, description: "Looking for something serious", color: '#F43F5E', bgColor: 'rgba(244,63,94,0.1)' },
  { id: "short_term", label: "Short-term, open to long", icon: Sparkles, description: "See where things go", color: '#a855f7', bgColor: 'rgba(168,85,247,0.1)' },
  { id: "casual", label: "Something casual", icon: Coffee, description: "Fun without pressure", color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  { id: "friends", label: "New friends", icon: Users, description: "Expand my social circle", color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
  { id: "not_sure", label: "Not sure yet", icon: HelpCircle, description: "Still figuring it out", color: '#64748b', bgColor: 'rgba(100,116,139,0.1)' },
];

// AI Bio suggestions per spec - "inspiration pool"
const AI_BIO_SUGGESTIONS = [
  "Coffee enthusiast who believes the best conversations happen over a good brew ☕",
  "Adventure seeker with a soft spot for cozy nights in 🌙",
  "Dog lover, sunset chaser, and eternal optimist 🐕",
  "Foodie on a mission to find the city's best hidden gems 🍜",
  "Music is my love language — always down for a concert 🎵",
  "Weekend hiker, weekday dreamer, full-time curious soul 🏔️",
  "Bookworm who also knows how to have a good time 📚",
  "Creative mind with a passion for good design and better coffee ✨",
];

// Hard Preferences questions - Full repository (22 questions)
const HARD_PREFERENCE_QUESTIONS = [
  // Habits & Lifestyle (1-5)
  { id: "smoking_cigarettes", question: "Am I open to dating someone who smokes cigarettes?", category: "Habits & Lifestyle" },
  { id: "smoking_weed", question: "Am I open to dating someone who smokes weed?", category: "Habits & Lifestyle" },
  { id: "drinks_frequently", question: "Am I open to dating someone who drinks alcohol frequently?", category: "Habits & Lifestyle" },
  { id: "no_alcohol", question: "Am I open to dating someone who doesn't drink alcohol at all?", category: "Habits & Lifestyle" },
  { id: "not_into_sports", question: "Am I open to dating someone who isn't into sports?", category: "Habits & Lifestyle" },
  // Relationship Style (6-10)
  { id: "serious_only", question: "Do I want a serious relationship only?", category: "Relationship Style" },
  { id: "open_to_casual", question: "Am I open to something casual?", category: "Relationship Style" },
  { id: "open_polyamorous", question: "Am I open to an open / polyamorous relationship?", category: "Relationship Style" },
  { id: "monogamy_only", question: "Do I want monogamy only?", category: "Relationship Style" },
  { id: "unsure_partner", question: "Am I open to dating someone who isn't sure what they're looking for?", category: "Relationship Style" },
  // Location & Living (11-14)
  { id: "lives_far", question: "Am I open to dating someone who lives far away?", category: "Location & Living" },
  { id: "lives_abroad", question: "Am I open to dating someone who lives abroad?", category: "Location & Living" },
  { id: "same_country", question: "Is it important that my partner lives in the same country long-term?", category: "Location & Living" },
  { id: "first_date_home", question: "Am I open to a first date at home?", category: "Location & Living" },
  // Career & Education (15-18)
  { id: "self_employed", question: "Is it important that my partner is self-employed?", category: "Career & Education" },
  { id: "salaried", question: "Is it important that my partner is a salaried employee?", category: "Career & Education" },
  { id: "has_degree", question: "Is it important that my partner has or is pursuing a degree?", category: "Career & Education" },
  { id: "no_degree", question: "Am I open to dating someone without a degree?", category: "Career & Education" },
  // Values & Future (19-22)
  { id: "wants_children", question: "Is it important that my partner wants children someday?", category: "Values & Future" },
  { id: "no_children", question: "Am I open to dating someone who doesn't want children?", category: "Values & Future" },
  { id: "calm_lifestyle", question: "Is a calm, quiet lifestyle important to me?", category: "Values & Future" },
  { id: "intense_lifestyle", question: "Am I open to dating someone with a very intense lifestyle?", category: "Values & Future" },
];

const MAX_PHOTOS = 6;
const MAX_INTERESTS = 10;
const MAX_CAUSES = 3;
const MAX_QUALITIES = 3;

// Helper to get merged user data from localStorage
function getUserDataFromStorage() {
  try {
    const storedUser = localStorage.getItem('pulse_user');
    const storedOnboarding = localStorage.getItem('pulse_onboarding_data');
    const user = storedUser ? JSON.parse(storedUser) : {};
    const onboarding = storedOnboarding ? JSON.parse(storedOnboarding) : {};
    // Merge: onboarding data takes precedence
    return { ...user, ...onboarding };
  } catch (e) {
    console.error('Error loading user data:', e);
    return {};
  }
}

export default function ProfileSettings({ onBack }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  // Get merged data from localStorage directly
  const [userData, setUserData] = useState(getUserDataFromStorage);
  
  // Helper to save and refresh userData
  const saveAndRefreshUserData = (newData) => {
    const currentData = getUserDataFromStorage();
    const merged = { ...currentData, ...newData };
    localStorage.setItem('pulse_user', JSON.stringify(merged));
    localStorage.setItem('pulse_onboarding_data', JSON.stringify(merged));
    setUserData(merged);
  };
  
  // Refresh userData when component mounts or user changes
  useEffect(() => {
    const data = getUserDataFromStorage();
    setUserData(data);
  }, [user]);

  const [appSettings] = useState(loadAppSettings());
  const { brand } = appSettings;

  const bg1 = alpha(brand.primary, 0.12);
  const bg2 = alpha(brand.accent || brand.primary, 0.1);

  // --- Profile state - Load from merged userData ---
  const [photos, setPhotos] = useState(() => {
    const data = getUserDataFromStorage();
    if (data?.photos && data.photos.length > 0) {
      const userPhotos = data.photos.map((p, i) => ({ 
        url: p?.url || p || "", 
        label: i === 0 ? "Primary" : String(i + 1) 
      }));
      while (userPhotos.length < 6) {
        userPhotos.push({ url: "", label: String(userPhotos.length + 1) });
      }
      return userPhotos;
    }
    return [
      { url: "", label: "Primary" },
      { url: "", label: "2" },
      { url: "", label: "3" },
      { url: "", label: "4" },
      { url: "", label: "5" },
      { url: "", label: "6" },
    ];
  });
  const [bio, setBio] = useState(() => getUserDataFromStorage()?.bio || "");
  const [bestPhoto, setBestPhoto] = useState(true);
  const [verified, setVerified] = useState(() => getUserDataFromStorage()?.isVerified || false);
  const [interests, setInterests] = useState(() => {
    const data = getUserDataFromStorage();
    if (data?.interests && data.interests.length > 0) {
      // interests are stored as strings
      return data.interests;
    }
    return [];
  });
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [interestInput, setInterestInput] = useState("");

  // --- Dialogs / selections ---
  const [showChecklist, setShowChecklist] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedCauses, setSelectedCauses] = useState([]);
  const [causesDialog, setCausesDialog] = useState(false);

  const [selectedQualities, setSelectedQualities] = useState([
    "Humor",
    "Kindness",
    "Openness",
  ]);
  const [qualitiesDialog, setQualitiesDialog] = useState(false);

  const [selectedPrompts, setSelectedPrompts] = useState(() => {
    const data = getUserDataFromStorage();
    if (data?.prompts && data.prompts.length > 0) {
      return data.prompts;
    }
    return [];
  }); // {prompt, answer}
  const [promptDialog, setPromptDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptAnswer, setPromptAnswer] = useState("");

  // --- Looking For (per spec: cards with icon + text, multi-select) ---
  const [lookingFor, setLookingFor] = useState(() => {
    const data = getUserDataFromStorage();
    if (data?.lookingFor) {
      return Array.isArray(data.lookingFor) ? data.lookingFor : [data.lookingFor];
    }
    return [];
  });

  // --- Update state when userData changes ---
  useEffect(() => {
    const data = getUserDataFromStorage();
    if (data) {
      // Update photos
      if (data.photos && data.photos.length > 0) {
        const userPhotos = data.photos.map((p, i) => ({ 
          url: p?.url || p || "", 
          label: i === 0 ? "Primary" : String(i + 1) 
        }));
        while (userPhotos.length < 6) {
          userPhotos.push({ url: "", label: String(userPhotos.length + 1) });
        }
        setPhotos(userPhotos);
      }
      // Update other fields
      if (data.bio) setBio(data.bio);
      if (data.isVerified !== undefined) setVerified(data.isVerified);
      if (data.interests && data.interests.length > 0) {
        setInterests(data.interests);
      }
      if (data.lookingFor) {
        setLookingFor(Array.isArray(data.lookingFor) ? data.lookingFor : [data.lookingFor]);
      }
      if (data.prompts && data.prompts.length > 0) {
        setSelectedPrompts(data.prompts);
      }
      if (data.ageRange) setAgeRange(data.ageRange);
      if (data.maxDistance) setMaxDistance(data.maxDistance);
    }
  }, [user]);

  // --- Discovery (per spec: Age range, Max distance) ---
  const [ageRange, setAgeRange] = useState(() => getUserDataFromStorage()?.ageRange || [22, 35]);
  const [maxDistance, setMaxDistance] = useState(() => getUserDataFromStorage()?.maxDistance || 25); // km

  // --- Connected Accounts (per spec: Instagram, Spotify with OAuth + manual fallback) ---
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyArtists, setSpotifyArtists] = useState([]);
  const [connectAccountDialog, setConnectAccountDialog] = useState(null); // 'instagram' | 'spotify' | null

  // --- Points & Hard Preferences ---
  const [points, setPoints] = useState(150); // Mock points balance
  const [hardPreferences, setHardPreferences] = useState({}); // { questionId: 'works' | 'not' | 'skip' }
  const [hardPreferencesDialog, setHardPreferencesDialog] = useState(false);
  const [currentPreferenceIndex, setCurrentPreferenceIndex] = useState(0);

  const HARD_PREFERENCES_STORAGE_KEY = "pulse.hardPreferences";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HARD_PREFERENCES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setHardPreferences(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HARD_PREFERENCES_STORAGE_KEY, JSON.stringify(hardPreferences));
    } catch {
      // ignore
    }
  }, [hardPreferences]);

  // Check if question is truly answered (not skipped or null)
  const isQuestionAnswered = (prefs, questionId) => {
    const answer = prefs[questionId];
    return answer === 'works' || answer === 'not';
  };

  const getFirstUnansweredPreferenceIndex = (prefs) => {
    const idx = HARD_PREFERENCE_QUESTIONS.findIndex((q) => !isQuestionAnswered(prefs, q.id));
    return idx === -1 ? 0 : idx;
  };

  const getNextUnansweredPreferenceIndex = (fromIndex, prefs) => {
    for (let i = fromIndex + 1; i < HARD_PREFERENCE_QUESTIONS.length; i += 1) {
      const q = HARD_PREFERENCE_QUESTIONS[i];
      if (!isQuestionAnswered(prefs, q.id)) return i;
    }
    // If no more unanswered after current, check from beginning
    for (let i = 0; i < fromIndex; i += 1) {
      const q = HARD_PREFERENCE_QUESTIONS[i];
      if (!isQuestionAnswered(prefs, q.id)) return i;
    }
    return -1;
  };

  // Count only truly answered questions (not skipped)
  const getAnsweredCount = (prefs) => {
    return HARD_PREFERENCE_QUESTIONS.filter(q => isQuestionAnswered(prefs, q.id)).length;
  };

  // --- AI Bio Suggestions (per spec: inspiration pool) ---
  const [showBioSuggestions, setShowBioSuggestions] = useState(false);

  // --- Photo file input ---
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSlotIdx, setPhotoSlotIdx] = useState(null);
  const fileInputRef = useRef(null);
  
  // --- Camera state ---
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // --- Verification camera state ---
  const [showVerificationCamera, setShowVerificationCamera] = useState(false);
  const [verificationStream, setVerificationStream] = useState(null);
  const verificationVideoRef = useRef(null);
  const verificationCanvasRef = useRef(null);

  // --- Snackbar ---
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    sev: "success",
  });

  // --- Profile completion ---
  // Each item has a weight (percentage) - total should be 100%
  const checklist = useMemo(
    () => {
      const hasPhoto = photos.some((p) => p.url && p.url.length > 10); // base64 is long
      const hasBio = bio && bio.trim().length > 0;
      const hasInterests = interests && interests.length > 0;
      const hasLookingFor = lookingFor && lookingFor.length > 0;
      const hasLocation = !!(userData?.location || userData?.city);
      const hasJobTitle = !!userData?.jobTitle && userData.jobTitle.trim().length > 0;
      const hasEducation = !!userData?.education && userData.education.trim().length > 0;
      const hasHeight = !!userData?.height;
      const hasGender = !!userData?.gender;
      const hasPrompts = selectedPrompts && selectedPrompts.length > 0;
      const isVerified = verified === true;
      // Hard Preferences - count how many are answered (not skipped)
      const hardPrefsAnswered = getAnsweredCount(hardPreferences);
      const hasHardPrefs = hardPrefsAnswered >= 5; // At least 5 answered
      
      const items = [
        { label: "Profile photo", completed: hasPhoto, weight: 15 },
        { label: "Bio", completed: hasBio, weight: 10 },
        { label: "Interests", completed: hasInterests, weight: 10 },
        { label: "Looking for", completed: hasLookingFor, weight: 10 },
        { label: "Location", completed: hasLocation, weight: 5 },
        { label: "Job title", completed: hasJobTitle, weight: 5 },
        { label: "Education", completed: hasEducation, weight: 5 },
        { label: "Height", completed: hasHeight, weight: 5 },
        { label: "Gender", completed: hasGender, weight: 5 },
        { label: "Prompts", completed: hasPrompts, weight: 10 },
        { label: "Verification", completed: isVerified, weight: 10 },
        { label: "Hard Preferences", completed: hasHardPrefs, weight: 10 },
      ];
      return items;
    },
    [photos, bio, interests, lookingFor, userData, verified, selectedPrompts, hardPreferences]
  );

  // Calculate completion based on weights
  const completion = useMemo(() => {
    return checklist.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);
  }, [checklist]);
  
  const completedCount = checklist.filter((i) => i.completed).length;
  const getBarColor = () =>
    completion < 40 ? "error" : completion < 80 ? "warning" : "success";

  // --- Track if user has made any changes (for save prompt) ---
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Mark as dirty when user makes any change
  const markDirty = () => setHasUnsavedChanges(true);
  
  // Reset dirty flag after save
  const resetDirty = () => setHasUnsavedChanges(false);
  
  // Use hasUnsavedChanges for the sticky save bar
  const dirty = hasUnsavedChanges;

  // --- Back navigation ---
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  // --- Photos ---
  const handlePhotoAdd = (idx) => {
    setPhotoSlotIdx(idx);
    setPhotoModalOpen(true);
  };

  const triggerFileInput = (opts) => {
    if (!fileInputRef.current) return;
    if (opts && opts.capture) {
      fileInputRef.current.setAttribute("capture", opts.capture);
    } else {
      fileInputRef.current.removeAttribute("capture");
    }
    fileInputRef.current.setAttribute("accept", "image/*");
    fileInputRef.current.click();
  };

  const handlePickGallery = () => {
    setPhotoModalOpen(false);
    setTimeout(() => triggerFileInput(), 100);
  };

  const handlePickCamera = async () => {
    setPhotoModalOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      }, 100);
    } catch (error) {
      console.error('Camera permission error:', error);
      setSnack({ open: true, msg: 'Could not access camera', sev: 'error' });
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setSnack({ open: true, msg: 'Camera not ready', sev: 'error' });
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const base64Url = canvas.toDataURL('image/jpeg', 0.9);
    
    setPhotos((prev) => {
      const updated = prev.map((p, i) => (i === photoSlotIdx ? { ...p, url: base64Url } : p));
      // Save and refresh userData
      const photosToSave = updated.filter(p => p.url).map(p => ({ url: p.url, isMain: p.label === "Primary" }));
      saveAndRefreshUserData({ photos: photosToSave });
      return updated;
    });
    markDirty();
    handleCloseCamera();
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // --- Verification Camera Functions ---
  const handleStartVerificationCamera = async () => {
    try {
      setShowVerify(false); // Close the intro dialog
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setVerificationStream(stream);
      setShowVerificationCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (verificationVideoRef.current) {
          verificationVideoRef.current.srcObject = stream;
          verificationVideoRef.current.onloadedmetadata = () => {
            verificationVideoRef.current.play();
          };
        }
      }, 100);
    } catch (error) {
      console.error('Camera permission error:', error);
      setSnack({ open: true, msg: 'Could not access camera. Please allow camera access.', sev: 'error' });
    }
  };

  const handleCaptureVerificationPhoto = () => {
    if (!verificationVideoRef.current || !verificationCanvasRef.current) return;
    
    const video = verificationVideoRef.current;
    const canvas = verificationCanvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setSnack({ open: true, msg: 'Camera not ready', sev: 'error' });
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Verification successful - mark as verified
    setVerified(true);
    saveAndRefreshUserData({ isVerified: true });
    markDirty();
    handleCloseVerificationCamera();
    setSnack({ open: true, msg: 'Profile verified successfully! ✓', sev: 'success' });
  };

  const handleCloseVerificationCamera = () => {
    if (verificationStream) {
      verificationStream.getTracks().forEach(track => track.stop());
      setVerificationStream(null);
    }
    setShowVerificationCamera(false);
  };

  const handlePickInstagram = () => {
    setPhotoModalOpen(false);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || photoSlotIdx == null) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      setPhotos((prev) => {
        const updated = prev.map((p, i) => (i === photoSlotIdx ? { ...p, url: base64Url } : p));
        // Save and refresh userData
        const photosToSave = updated.filter(p => p.url).map(p => ({ url: p.url, isMain: p.label === "Primary" }));
        saveAndRefreshUserData({ photos: photosToSave });
        return updated;
      });
      markDirty();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePhotoRemove = (idx) => {
    // Check if removing this photo would leave less than 4 photos
    const currentPhotoCount = photos.filter(p => p.url).length;
    if (currentPhotoCount <= 4) {
      setSnack({ 
        open: true, 
        msg: 'You need at least 4 photos. Add more photos before removing this one.', 
        sev: 'warning' 
      });
      return;
    }
    
    setPhotos((prev) => {
      const updated = prev.map((p, i) => (i === idx ? { ...p, url: "" } : p));
      // Save and refresh userData
      const photosToSave = updated.filter(p => p.url).map(p => ({ url: p.url, isMain: p.label === "Primary" }));
      saveAndRefreshUserData({ photos: photosToSave });
      return updated;
    });
    markDirty();
  };

  const handlePhotoReorder = () => {
    alert(
      "Drag & drop to reorder photos — you can implement this with dnd-kit/Sortable."
    );
  };

  // --- Interests ---
  const getSelectedCountInCategory = (category) => {
    return category.interests.filter(interest => interests.includes(interest)).length;
  };

  const toggleInterest = (interest, category) => {
    setInterests(prev => {
      let newInterests;
      if (prev.includes(interest)) {
        newInterests = prev.filter(i => i !== interest);
      } else {
        // Check if category limit reached
        const categoryCount = category.interests.filter(i => prev.includes(i)).length;
        if (categoryCount >= MAX_PER_CATEGORY) {
          return prev;
        }
        newInterests = [...prev, interest];
      }
      // Save and refresh userData
      saveAndRefreshUserData({ interests: newInterests });
      return newInterests;
    });
    markDirty();
  };

  const handleRemoveInterest = (interest) => {
    setInterests(prev => {
      const newInterests = prev.filter(i => i !== interest);
      // Save and refresh userData
      saveAndRefreshUserData({ interests: newInterests });
      return newInterests;
    });
    markDirty();
  };

  // --- Causes ---
  const handleToggleCause = (cause) => {
    setSelectedCauses((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : prev.length < MAX_CAUSES
        ? [...prev, cause]
        : prev
    );
    markDirty();
  };

  // --- Qualities ---
  const handleToggleQuality = (q) => {
    setSelectedQualities((prev) =>
      prev.includes(q)
        ? prev.filter((x) => x !== q)
        : prev.length < MAX_QUALITIES
        ? [...prev, q]
        : prev
    );
    markDirty();
  };

  // --- Prompts ---
  const handleAddPrompt = () => {
    if (selectedPrompt && promptAnswer.trim()) {
      const newPrompt = { prompt: selectedPrompt, answer: promptAnswer.trim() };
      
      setSelectedPrompts((prev) => {
        const updatedPrompts = [...prev, newPrompt];
        // Save prompts immediately to localStorage using saveAndRefreshUserData
        const introLine = updatedPrompts[0]?.answer || null;
        saveAndRefreshUserData({ prompts: updatedPrompts, introLine });
        return updatedPrompts;
      });
      
      setSelectedPrompt(null);
      setPromptAnswer("");
      setPromptDialog(false);
      markDirty();
    }
  };

  // --- Save all profile data ---
  const handleSave = async () => {
    try {
      // Collect all profile data to save
      const photosToSave = photos.filter(p => p.url).map(p => ({ url: p.url, isMain: p.label === "Primary" }));
      
      const profileData = {
        photos: photosToSave,
        bio,
        interests,
        isVerified: verified,
        causes: selectedCauses,
        qualities: selectedQualities,
        prompts: selectedPrompts,
        lookingFor,
        ageRange,
        maxDistance,
      };
      
      // Save to localStorage
      saveAndRefreshUserData(profileData);
      
      // Simulate API call delay
      await new Promise((r) => setTimeout(r, 300));
      
      setSnack({ open: true, msg: "Profile saved successfully", sev: "success" });
      resetDirty(); // Reset dirty flag after successful save
    } catch (e) {
      setSnack({ open: true, msg: "Save failed, please try again", sev: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: `calc(${SAFE_BOTTOM} + 40px)`,
        backgroundColor: '#f8fafc',
        position: 'relative',
      }}
    >
      {/* Main container */}
      <Box
        sx={{
          maxWidth: 520,
          mx: "auto",
          backgroundColor: '#fff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              Edit Profile
            </Typography>
          </Box>
        </Box>

        {/* Profile Preview Card - shows how others see you */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              borderRadius: '20px',
              p: 2.5,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <Box sx={{ 
              position: 'absolute', 
              top: -30, 
              right: -30, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.1)' 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -20, 
              left: -20, 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.08)' 
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
              <Avatar
                src={photos[0]?.url}
                sx={{ 
                  width: 64, 
                  height: 64, 
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {!photos[0]?.url && <Camera size={24} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                  Your Profile
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {completion === 100 ? "Looking great! ✨" : `${completion}% complete`}
                </Typography>
              </Box>
              {verified && (
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: '8px', 
                  p: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}>
                  <Shield size={14} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Verified</Typography>
                </Box>
              )}
            </Box>

            {/* Progress bar */}
            <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                height: 6, 
                borderRadius: 999, 
                backgroundColor: 'rgba(255,255,255,0.2)',
                overflow: 'hidden',
              }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${completion}%`, 
                  backgroundColor: '#fff',
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {checklist.filter(i => !i.completed).length > 0 
                    ? `${checklist.filter(i => !i.completed).length} items to complete`
                    : "All done!"
                  }
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowChecklist(true)}
                  sx={{ 
                    color: '#fff', 
                    textTransform: 'none', 
                    fontSize: 12,
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  View details
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Preview Profile Button */}
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowPreview(true)}
            startIcon={<Eye size={18} />}
            sx={{
              mt: 1.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#6C5CE7 !important',
              backgroundColor: 'transparent !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: '#6C5CE7 !important',
                '& .MuiButton-startIcon': {
                  color: '#a855f7',
                  transform: 'scale(1.1)',
                },
              },
              '&:active': {
                color: '#6C5CE7 !important',
                backgroundColor: 'transparent !important',
              },
              '& .MuiButton-startIcon': {
                transition: 'all 0.2s ease',
              },
            }}
          >
            Preview Profile
          </Button>
        </Box>

        {/* Points - Dark theme banner matching SubscriptionsScreen */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box
            onClick={() => navigate('/points')}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
              cursor: 'pointer',
              overflow: 'hidden',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.01)',
                boxShadow: '0 6px 24px rgba(236, 72, 153, 0.3)',
                borderColor: 'rgba(236, 72, 153, 0.5)',
              },
            }}
          >
            {/* Floating circles animation */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {[
                { top: '10%', right: '5%', size: 28 },
                { top: '50%', left: '3%', size: 24 },
                { bottom: '15%', right: '12%', size: 20 },
              ].map((pos, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    ...pos,
                    width: pos.size,
                    height: pos.size,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                    opacity: 0.4,
                    animation: `floatCircle${i} ${3 + i * 0.5}s ease-in-out infinite`,
                    [`@keyframes floatCircle${i}`]: {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                    },
                  }}
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '14px', 
                background: 'rgba(236, 72, 153, 0.2)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Coins size={24} color="#ec4899" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
                  {points} Points available
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                  Use points to unlock short premium boosts
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}>
              Get More
            </Box>
          </Box>
        </Box>

        {/* Photos & videos */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ 
            backgroundColor: '#f8fafc', 
            borderRadius: '16px', 
            p: 2,
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={18} color="#fff" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                  Photos & Videos
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Choose media that feels like the real you
                </Typography>
              </Box>
            </Box>

          <Grid container spacing={1.5}>
            {photos.map((photo, idx) => (
              <Grid item xs={4} key={idx}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    bgcolor: "#f9fafb",
                    aspectRatio: "1/1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border:
                      idx === 0
                        ? `2px solid ${alpha(brand.primary, 0.9)}`
                        : "1px solid #e5e7eb",
                  }}
                  onClick={() => handlePhotoAdd(idx)}
                  aria-label={`Photo ${idx + 1}`}
                >
                  {photo.url ? (
                    <Avatar
                      src={photo.url}
                      alt={photo.label}
                      variant="rounded"
                      sx={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
                        <path
                          d="M32 33c5.5 0 10-4.5 10-10s-4.5-10-10-10-10 4.5-10 10 4.5 10 10 10zm0 4c-6.6 0-20 3.3-20 10v3a1 1 0 001 1h38a1 1 0 001-1v-3c0-6.7-13.4-10-20-10z"
                          fill="#2e2e2e"
                        />
                      </svg>
                    </Box>
                  )}

                  {idx === 0 && (
                    <Chip
                      label="Primary"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        bgcolor: "#efeaff",
                        color: "#6C5CE7",
                        fontWeight: 700,
                        fontSize: 11,
                        borderRadius: 999,
                        height: 24,
                      }}
                    />
                  )}

                  {photo.url && (
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.9)",
                        "&:hover": { bgcolor: "#fff" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoRemove(idx);
                      }}
                      aria-label="Remove photo"
                    >
                      <XIcon size={16} />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}

            {photos.length < MAX_PHOTOS &&
              Array.from({ length: MAX_PHOTOS - photos.length }, (_, i) => (
                <Grid item xs={4} key={`empty-${i}`}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
                      bgcolor: "#f9fafb",
                      aspectRatio: "1/1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "1px dashed #e5e7eb",
                    }}
                    onClick={() => handlePhotoAdd(photos.length + i)}
                    aria-label="Add photo"
                  >
                    <Box sx={{ color: "#cbd5f5", fontSize: 36 }}>
                      <Plus />
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>

          {/* Photo source dialog */}
          <Dialog 
            open={photoModalOpen} 
            onClose={() => setPhotoModalOpen(false)}
            PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 340 } }}
            sx={{ zIndex: 9999 }}
          >
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Photo</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: '#e2e8f0',
                  color: '#1a1a2e',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}
                onClick={handlePickGallery}
                startIcon={<Image size={20} color="#6C5CE7" />}
              >
                Choose from Gallery
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: '#e2e8f0',
                  color: '#1a1a2e',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}
                onClick={handlePickCamera}
                startIcon={<Camera size={20} color="#6C5CE7" />}
              >
                Take a Photo
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: '#e2e8f0',
                  color: '#1a1a2e',
                  justifyContent: 'flex-start',
                  gap: 2,
                }}
                onClick={handlePickInstagram}
                startIcon={<Star size={20} color="#E1306C" />}
              >
                Import from Instagram
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                fullWidth 
                variant="text" 
                onClick={() => setPhotoModalOpen(false)}
                sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Camera Modal */}
          <Dialog
            open={showCamera}
            onClose={handleCloseCamera}
            fullScreen
            PaperProps={{ sx: { backgroundColor: '#000' } }}
          >
            <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Close button */}
              <IconButton
                onClick={handleCloseCamera}
                sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: '#fff' }}
              >
                <XIcon size={24} />
              </IconButton>
              
              {/* Video preview */}
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              </Box>
              
              {/* Capture button */}
              <Box sx={{ 
                p: 3, 
                pb: 8,
                display: 'flex', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
                <IconButton
                  onClick={handleCapturePhoto}
                  sx={{
                    width: 72,
                    height: 72,
                    backgroundColor: '#fff',
                    border: '4px solid rgba(255,255,255,0.3)',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                >
                  <Camera size={32} color="#1a1a2e" />
                </IconButton>
              </Box>
              
              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
          </Dialog>

          <Button
            size="small"
            startIcon={<Image />}
            sx={{
              mt: 1,
              textTransform: "none",
              color: brand.primary,
              borderRadius: 999,
            }}
            onClick={handlePhotoReorder}
          >
            Drag to reorder
          </Button>
          </Box>
        </Box>

        {/* Best photo toggle */}
        <Box
          sx={{
            px: 3,
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Star color={brand.primary} />
            <Typography>Auto-boost best photo</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                color: bestPhoto ? "green" : "#9ca3af",
                fontWeight: 600,
              }}
            >
              {bestPhoto ? "On" : "Off"}
            </Typography>
            <Switch
              checked={bestPhoto}
              onChange={(_, checked) => setBestPhoto(checked)}
              color="success"
            />
          </Box>
        </Box>
        <Box sx={{ px: 3, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#1d4ed8",
              mt: 0.5,
              fontWeight: 500,
              background: "#e3f2fd",
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            Your first photo usually gets the most attention — make it count.
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Profile verification */}
        <Box
          sx={{
            px: 3,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Shield color={verified ? "green" : "#9ca3af"} />
            <Typography>Profile verification</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                color: verified ? "green" : "#9ca3af",
                fontWeight: 600,
              }}
            >
              {verified ? "Verified" : "Not verified"}
            </Typography>
            <Button
              size="small"
              variant={verified ? "outlined" : "contained"}
              color={verified ? "success" : "primary"}
              onClick={() => setShowVerify(true)}
              sx={{ ml: 1, textTransform: "none", borderRadius: 999 }}
            >
              {verified ? <CheckCircle size={18} /> : "Verify"}
            </Button>
          </Box>
        </Box>

        <Dialog 
          open={showVerify} 
          onClose={() => setShowVerify(false)}
          PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 360 } }}
          sx={{ zIndex: 9999 }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} color="#fff" />
            </Box>
            Verify Your Profile
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Verified profiles get more matches! Take a quick selfie to prove you're real.
            </Typography>
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 500 }}>
                ✓ Increases trust with other users
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleStartVerificationCamera}
              startIcon={<Camera size={18} />}
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none', 
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              Start Verification
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              onClick={() => setShowVerify(false)}
              sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
            >
              Maybe Later
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verification Camera Modal */}
        <Dialog
          open={showVerificationCamera}
          onClose={handleCloseVerificationCamera}
          fullScreen
          PaperProps={{ sx: { backgroundColor: '#000' } }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <IconButton onClick={handleCloseVerificationCamera} sx={{ color: '#fff' }}>
                <XIcon size={24} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield size={20} color="#10b981" />
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  Verify Your Profile
                </Typography>
              </Box>
              <Box sx={{ width: 40 }} />
            </Box>

            {/* Instructions */}
            <Box sx={{ 
              px: 3, 
              py: 2, 
              backgroundColor: 'rgba(16,185,129,0.15)',
              textAlign: 'center',
            }}>
              <Typography sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                📸 Position your face in the frame
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', mt: 0.5 }}>
                Make sure your face is clearly visible and well-lit
              </Typography>
            </Box>

            {/* Video preview */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <video
                ref={verificationVideoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              {/* Face guide overlay */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 220,
                height: 280,
                border: '3px dashed rgba(16,185,129,0.6)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }} />
              <canvas ref={verificationCanvasRef} style={{ display: 'none' }} />
            </Box>

            {/* Capture button */}
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
              <Button
                variant="contained"
                onClick={handleCaptureVerificationPhoto}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  minWidth: 'auto',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  },
                }}
              >
                <Camera size={28} color="#fff" />
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Bio & interests */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>About Me</Typography>
            <Button
              size="small"
              startIcon={<Sparkles size={14} />}
              onClick={() => setShowBioSuggestions(true)}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                color: '#6C5CE7',
                '&:hover': { backgroundColor: 'rgba(108,92,231,0.08)' },
              }}
            >
              Get ideas
            </Button>
          </Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Write a few lines about yourself…"
            value={bio}
            onChange={(e) => { setBio(e.target.value); markDirty(); }}
            sx={{ width: "100%", mb: 0.5 }}
            multiline
            minRows={2}
            inputProps={{ maxLength: 500 }}
          />
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
            {bio.length}/500 characters
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>Interests</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 1.25 }}>
            Select up to {MAX_PER_CATEGORY} per category
          </Typography>

          {/* Selected interests */}
          {interests.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: "#64748b", mb: 1, display: "block" }}>
                Selected ({interests.length}):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {interests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onDelete={() => handleRemoveInterest(interest)}
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                      bgcolor: brand.primary,
                      color: "#fff",
                      mb: 0.5,
                      '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Categories */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {INTEREST_CATEGORIES.map((category) => {
              const selectedCount = getSelectedCountInCategory(category);
              const isExpanded = expandedCategory === category.name;
              
              return (
                <Box key={category.name}>
                  <Box
                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: isExpanded ? alpha(brand.primary, 0.08) : '#f8fafc',
                      border: `1px solid ${isExpanded ? brand.primary : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 18 }}>{category.emoji}</Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>
                        {category.name}
                      </Typography>
                      {selectedCount > 0 && (
                        <Chip
                          label={selectedCount}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: brand.primary,
                            color: '#fff',
                          }}
                        />
                      )}
                    </Box>
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: '#64748b',
                      }} 
                    />
                  </Box>
                  
                  {isExpanded && (
                    <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {category.interests.map((interest) => {
                        const isSelected = interests.includes(interest);
                        const categoryCount = getSelectedCountInCategory(category);
                        const isDisabled = !isSelected && categoryCount >= MAX_PER_CATEGORY;
                        
                        return (
                          <Chip
                            key={interest}
                            label={interest}
                            onClick={() => !isDisabled && toggleInterest(interest, category)}
                            size="small"
                            sx={{
                              borderRadius: 999,
                              fontWeight: 500,
                              fontSize: 12,
                              bgcolor: isSelected ? brand.primary : '#f1f5f9',
                              color: isSelected ? '#fff' : '#475569',
                              border: `1px solid ${isSelected ? brand.primary : '#e2e8f0'}`,
                              opacity: isDisabled ? 0.5 : 1,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              '&:hover': {
                                bgcolor: isSelected ? alpha(brand.primary, 0.85) : '#e2e8f0',
                                border: `1px solid ${isSelected ? brand.primary : '#cbd5e1'}`,
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Causes, qualities, prompts */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          {/* Causes & communities */}
          <Box
            sx={{
              bgcolor: alpha(brand.primary, 0.03),
              borderRadius: 3,
              border: `1px solid ${alpha(brand.primary, 0.14)}`,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
              Causes & communities
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              You can pick up to {MAX_CAUSES}.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              {selectedCauses.map((cause) => (
                <Chip
                  key={cause}
                  label={cause}
                  onDelete={() => { setSelectedCauses(prev => prev.filter(c => c !== cause)); markDirty(); }}
                  sx={{
                    borderRadius: 999,
                    bgcolor: alpha(brand.primary, 0.08),
                    border: `1px solid ${alpha(brand.primary, 0.22)}`,
                    fontWeight: 500,
                    fontSize: 13,
                    '&:hover': {
                      bgcolor: alpha(brand.primary, 0.15),
                    },
                  }}
                />
              ))}
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setCausesDialog(true)}
              sx={{
                justifyContent: "flex-start",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#f8fafc",
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              Add causes / communities
            </Button>
          </Box>

          {/* Qualities I value */}
          <Box
            sx={{
              bgcolor: alpha(brand.primary, 0.03),
              borderRadius: 3,
              border: `1px solid ${alpha(brand.primary, 0.14)}`,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
              Qualities I value
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Up to {MAX_QUALITIES} qualities.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              {selectedQualities.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  variant="outlined"
                  onDelete={() => { setSelectedQualities(prev => prev.filter(quality => quality !== q)); markDirty(); }}
                  sx={{
                    borderRadius: 999,
                    bgcolor: alpha(brand.primary, 0.08),
                    fontWeight: 500,
                    fontSize: 13,
                    '&:hover': {
                      bgcolor: alpha(brand.primary, 0.15),
                    },
                  }}
                />
              ))}
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setQualitiesDialog(true)}
              sx={{
                justifyContent: "space-between",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#f8fafc",
                pr: 1,
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
              endIcon={<span style={{ fontSize: 20 }}>›</span>}
            >
              Choose qualities
            </Button>
          </Box>

          {/* Prompts */}
          <Box
            sx={{
              bgcolor: alpha(brand.primary, 0.03),
              borderRadius: 3,
              border: `1px solid ${alpha(brand.primary, 0.14)}`,
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.3, color: "#0f172a" }}>
              Prompts
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 1 }}>
              Help people get a feel for your vibe.
            </Typography>
            <Typography variant="caption" sx={{ color: "#9CA3AF", display: 'block', mb: 2 }}>
              You can add up to {photos.filter(p => p.url).length} prompts (one per photo). The first prompt appears after your main photo, others appear between your photos.
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {selectedPrompts.map((p, i) => (
                <Box
                  key={`${p.prompt}-${i}`}
                  sx={{
                    bgcolor: i === 0 ? 'rgba(108,92,231,0.08)' : "#f5f5f5",
                    borderRadius: 2,
                    p: 1.2,
                    fontWeight: 500,
                    position: 'relative',
                    border: i === 0 ? '2px solid #6C5CE7' : '1px solid transparent',
                  }}
                >
                  {/* Main prompt badge */}
                  {i === 0 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        left: 12, 
                        bgcolor: '#6C5CE7', 
                        color: '#fff', 
                        px: 1, 
                        py: 0.2, 
                        borderRadius: 1,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      MAIN INTRO
                    </Typography>
                  )}
                  {/* Reorder buttons - move up/down */}
                  <Box sx={{ position: 'absolute', top: 4, right: 36, display: 'flex', gap: 0.3 }}>
                    {/* Move up button */}
                    {i > 0 && (
                      <IconButton
                        size="small"
                        title="Move up"
                        onClick={() => {
                          const newPrompts = [...selectedPrompts];
                          [newPrompts[i - 1], newPrompts[i]] = [newPrompts[i], newPrompts[i - 1]];
                          setSelectedPrompts(newPrompts);
                          // Save to localStorage using saveAndRefreshUserData
                          saveAndRefreshUserData({ prompts: newPrompts, introLine: newPrompts[0]?.answer });
                          markDirty();
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          bgcolor: 'rgba(108, 92, 231, 0.8)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.95)' },
                        }}
                      >
                        <ChevronUp size={14} />
                      </IconButton>
                    )}
                    {/* Move down button */}
                    {i < selectedPrompts.length - 1 && (
                      <IconButton
                        size="small"
                        title="Move down"
                        onClick={() => {
                          const newPrompts = [...selectedPrompts];
                          [newPrompts[i], newPrompts[i + 1]] = [newPrompts[i + 1], newPrompts[i]];
                          setSelectedPrompts(newPrompts);
                          // Save to localStorage using saveAndRefreshUserData
                          saveAndRefreshUserData({ prompts: newPrompts, introLine: newPrompts[0]?.answer });
                          markDirty();
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          bgcolor: 'rgba(108, 92, 231, 0.8)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.95)' },
                        }}
                      >
                        <ChevronDown size={14} />
                      </IconButton>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newPrompts = selectedPrompts.filter((_, idx) => idx !== i);
                      setSelectedPrompts(newPrompts);
                      // Save to localStorage using saveAndRefreshUserData
                      saveAndRefreshUserData({ prompts: newPrompts, introLine: newPrompts[0]?.answer || null });
                      markDirty();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 24,
                      height: 24,
                      bgcolor: 'rgba(100, 116, 139, 0.8)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.95)' },
                    }}
                  >
                    <X size={14} />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 600, pr: 3 }}>
                    {p.prompt}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", mt: 0.5 }}>
                    {p.answer}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setPromptDialog(true)}
              disabled={selectedPrompts.length >= photos.filter(p => p.url).length}
              sx={{
                justifyContent: "flex-start",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#f8fafc",
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
              startIcon={<Plus />}
            >
              {selectedPrompts.length >= photos.filter(p => p.url).length 
                ? `Add more photos to add more prompts` 
                : `Add prompt (${selectedPrompts.length}/${photos.filter(p => p.url).length})`}
            </Button>
          </Box>
        </Box>

        {/* Dialogs for causes / qualities / prompts */}
        <Dialog open={causesDialog} onClose={() => setCausesDialog(false)} sx={{ zIndex: 9999 }}>
          <DialogTitle>Select up to {MAX_CAUSES} causes</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {mockCauses.map((cause) => (
                <Chip
                  key={cause}
                  label={cause}
                  clickable
                  color={selectedCauses.includes(cause) ? "primary" : "default"}
                  onClick={() => handleToggleCause(cause)}
                  sx={{ borderRadius: 999, fontWeight: 500 }}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCausesDialog(false)}>Done</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={qualitiesDialog} onClose={() => setQualitiesDialog(false)} sx={{ zIndex: 9999 }}>
          <DialogTitle>Select up to {MAX_QUALITIES} qualities</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {mockQualities.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  clickable
                  color={selectedQualities.includes(q) ? "primary" : "default"}
                  onClick={() => handleToggleQuality(q)}
                  sx={{ borderRadius: 999, fontWeight: 500 }}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQualitiesDialog(false)}>Done</Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={promptDialog} 
          onClose={() => setPromptDialog(false)} 
          sx={{ 
            zIndex: 9999,
            '& .MuiDialog-container': {
              alignItems: 'center',
            },
            '& .MuiDialog-paper': {
              overflow: 'hidden !important',
            },
            '& *::-webkit-scrollbar': { 
              display: 'none !important',
              width: '0 !important',
            },
            '& *': {
              scrollbarWidth: 'none !important',
              msOverflowStyle: 'none !important',
            },
          }}
          PaperProps={{ 
            sx: { 
              maxHeight: '70vh', 
              minWidth: 340,
              maxWidth: 400,
              m: 2,
              borderRadius: '16px',
              overflow: 'hidden !important',
            } 
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {selectedPrompt ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => setSelectedPrompt(null)}>
                  <ArrowLeft size={20} />
                </IconButton>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{selectedPrompt}</Typography>
              </Box>
            ) : (
              'Choose a prompt'
            )}
          </DialogTitle>
          <DialogContent sx={{ 
            overflowY: 'auto', 
            pt: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {!selectedPrompt ? (
              <Stack spacing={1.5}>
                {mockPrompts.map((p) => (
                  <Button
                    key={p}
                    variant="outlined"
                    onClick={() => setSelectedPrompt(p)}
                    sx={{
                      borderRadius: '20px',
                      textTransform: "none",
                      fontWeight: 500,
                      py: 1.5,
                      borderColor: '#e2e8f0',
                      color: '#1a1a2e',
                      '&:hover': {
                        borderColor: '#6C5CE7',
                        bgcolor: 'rgba(108,92,231,0.05)',
                      },
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </Stack>
            ) : (
              <Box>
                {/* AI Suggestions */}
                <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1.5, fontWeight: 500 }}>
                  ✨ AI Suggestions (tap to use)
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {promptsWithSuggestions[selectedPrompt]?.map((suggestion, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setPromptAnswer(suggestion)}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: promptAnswer === suggestion ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                        bgcolor: promptAnswer === suggestion ? 'rgba(108,92,231,0.08)' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#6C5CE7',
                          bgcolor: 'rgba(108,92,231,0.08)',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: '#1a1a2e', fontStyle: 'italic' }}>
                        "{suggestion}"
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                
                {/* Custom answer */}
                <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1, fontWeight: 500 }}>
                  Or write your own:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={promptAnswer}
                  onChange={(e) => setPromptAnswer(e.target.value)}
                  placeholder="Type your answer…"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
                <Button
                  fullWidth
                  sx={{ mt: 2, borderRadius: '12px', py: 1.2 }}
                  variant="contained"
                  onClick={handleAddPrompt}
                  disabled={!promptAnswer.trim()}
                >
                  Save to Profile
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPromptDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Looking For - per spec: cards with icon + text, multi-select, represents vibe not constraints */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          <Box
            sx={{
              bgcolor: 'rgba(244,63,94,0.03)',
              borderRadius: 3,
              border: '1px solid rgba(244,63,94,0.12)',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={18} color="#fff" />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                  Looking For
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  What brings you here? (Select all that apply)
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={1.5}>
              {LOOKING_FOR_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = lookingFor.includes(option.id);
                return (
                  <Grid item xs={6} key={option.id}>
                    <Box
                      onClick={() => {
                        const newLookingFor = isSelected 
                          ? lookingFor.filter(id => id !== option.id)
                          : [...lookingFor, option.id];
                        setLookingFor(newLookingFor);
                        // Save and refresh userData
                        saveAndRefreshUserData({ lookingFor: newLookingFor });
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#f43f5e' : 'rgba(0,0,0,0.08)'}`,
                        backgroundColor: isSelected ? 'rgba(244,63,94,0.05)' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isSelected ? '#f43f5e' : 'rgba(244,63,94,0.3)',
                          backgroundColor: isSelected ? 'rgba(244,63,94,0.08)' : '#f1f5f9',
                        },
                      }}
                    >
                      <Icon size={20} color={isSelected ? '#f43f5e' : '#64748b'} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', mt: 0.5 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {option.description}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>

        {/* Discovery - per spec: Age range, Max distance */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          <Box
            sx={{
              bgcolor: 'rgba(16,185,129,0.03)',
              borderRadius: 3,
              border: '1px solid rgba(16,185,129,0.12)',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Compass size={18} color="#fff" />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                Discovery Preferences
              </Typography>
            </Box>

            {/* Age Range */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>Age range</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                  {ageRange[0]} - {ageRange[1]}
                </Typography>
              </Box>
              <Slider
                value={ageRange}
                onChange={(_, v) => setAgeRange(v)}
                min={18}
                max={70}
                disableSwap
                sx={{
                  color: '#10b981',
                  '& .MuiSlider-thumb': { width: 20, height: 20 },
                }}
              />
            </Box>

            {/* Max Distance */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>Max distance</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                  {maxDistance} km
                </Typography>
              </Box>
              <Slider
                value={maxDistance}
                onChange={(_, v) => setMaxDistance(v)}
                min={1}
                max={100}
                sx={{
                  color: '#10b981',
                  '& .MuiSlider-thumb': { width: 20, height: 20 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Hard Preferences - Redesigned with gradient card */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          <Box
            onClick={() => {
              setCurrentPreferenceIndex(getFirstUnansweredPreferenceIndex(hardPreferences));
              setHardPreferencesDialog(true);
            }}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              p: 2.5,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.45)',
              },
            }}
          >
            {/* Decorative elements */}
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)',
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -30, 
              left: '30%', 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.08)',
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              right: '15%', 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.06)',
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbsUp size={18} color="#fff" />
                    <ThumbsDown size={18} color="#fff" style={{ opacity: 0.6 }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 0.25 }}>
                    Hard Preferences
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                    Help the algorithm understand you better
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ChevronRight size={20} color="#fff" />
              </Box>
            </Box>
            
            {/* Progress indicator */}
            <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {getAnsweredCount(hardPreferences)} of {HARD_PREFERENCE_QUESTIONS.length} answered
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  {Math.round((getAnsweredCount(hardPreferences) / HARD_PREFERENCE_QUESTIONS.length) * 100)}%
                </Typography>
              </Box>
              <Box sx={{ 
                height: 6, 
                borderRadius: 999, 
                background: 'rgba(255,255,255,0.2)',
                overflow: 'hidden',
              }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${(getAnsweredCount(hardPreferences) / HARD_PREFERENCE_QUESTIONS.length) * 100}%`, 
                  background: '#fff',
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Additional sections from your app */}
        <AboutSections />
        
        {/* Star Sign, Politics, Languages, Connected Accounts (Instagram + Spotify) */}
        <ProfileExtras />
      </Box>

      {/* Sticky save bar - REMOVED: Changes now auto-save */}

      {/* Profile Checklist Dialog */}
      <Dialog 
        open={showChecklist} 
        onClose={() => setShowChecklist(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 340 } }}
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Complete Your Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {checklist.map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: item.completed ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)',
                  border: `1px solid ${item.completed ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)'}`,
                }}
              >
                <CheckCircle size={18} color={item.completed ? '#10b981' : '#f97316'} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            fullWidth
            variant="contained"
            onClick={() => setShowChecklist(false)}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              py: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' 
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Bio Suggestions Dialog - per spec: inspiration pool, fully editable */}
      <Dialog
        open={showBioSuggestions}
        onClose={() => setShowBioSuggestions(false)}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 400, mx: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Sparkles size={20} color="#6C5CE7" />
          Get inspired
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Tap any suggestion to use it as a starting point. You can edit it however you like!
          </Typography>
          <Stack spacing={1}>
            {AI_BIO_SUGGESTIONS.map((suggestion, idx) => (
              <Box
                key={idx}
                onClick={() => {
                  setBio(suggestion);
                  setShowBioSuggestions(false);
                  markDirty();
                }}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(108,92,231,0.08)',
                    borderColor: 'rgba(108,92,231,0.2)',
                  },
                }}
              >
                <Typography variant="body2" sx={{ color: '#1a1a2e' }}>
                  {suggestion}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowBioSuggestions(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connected Account Dialog - per spec: OAuth primary, manual fallback */}
      <Dialog
        open={!!connectAccountDialog}
        onClose={() => setConnectAccountDialog(null)}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 380, mx: 2 } }}
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {connectAccountDialog === 'instagram' ? (
            <>
              <Box sx={{ 
                width: 36, height: 36, borderRadius: '10px', 
                background: 'linear-gradient(45deg, #f09433, #dc2743)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Instagram size={18} color="#fff" />
              </Box>
              Connect Instagram
            </>
          ) : (
            <>
              <Box sx={{ 
                width: 36, height: 36, borderRadius: '10px', backgroundColor: '#1DB954',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Music size={18} color="#fff" />
              </Box>
              Connect Spotify
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {connectAccountDialog === 'instagram' ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  // Mock OAuth - in real app would redirect to Instagram OAuth
                  setInstagramConnected(true);
                  setInstagramUsername('your_username');
                  setConnectAccountDialog(null);
                  setSnack({ open: true, msg: 'Instagram connected!', sev: 'success' });
                }}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #f09433, #dc2743)',
                }}
              >
                Connect with Instagram
              </Button>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>or add manually</Typography>
              </Divider>
              <TextField
                fullWidth
                size="small"
                placeholder="@username"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
                Will be shown as "Manually added" on your profile
              </Typography>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  // Mock OAuth
                  setSpotifyConnected(true);
                  setSpotifyArtists(['Taylor Swift', 'The Weeknd', 'Dua Lipa']);
                  setConnectAccountDialog(null);
                  setSnack({ open: true, msg: 'Spotify connected!', sev: 'success' });
                }}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#1DB954',
                  '&:hover': { backgroundColor: '#1aa34a' },
                }}
              >
                Connect with Spotify
              </Button>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>or select manually</Typography>
              </Divider>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                Select your favorite artists or genres
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Classical'].map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    clickable
                    onClick={() => {
                      setSpotifyArtists(prev => 
                        prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                      );
                    }}
                    color={spotifyArtists.includes(genre) ? 'primary' : 'default'}
                    sx={{ borderRadius: 999, mb: 1 }}
                  />
                ))}
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          {connectAccountDialog === 'instagram' && instagramUsername && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setInstagramConnected(true);
                setConnectAccountDialog(null);
                setSnack({ open: true, msg: 'Username saved!', sev: 'success' });
              }}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Save username
            </Button>
          )}
          {connectAccountDialog === 'spotify' && spotifyArtists.length > 0 && !spotifyConnected && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSpotifyConnected(true);
                setConnectAccountDialog(null);
                setSnack({ open: true, msg: 'Genres saved!', sev: 'success' });
              }}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Save selection
            </Button>
          )}
          <Button
            fullWidth
            variant="text"
            onClick={() => setConnectAccountDialog(null)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hard Preferences Dialog - Premium one-decision-at-a-time flow */}
      <Dialog
        open={hardPreferencesDialog}
        onClose={() => setHardPreferencesDialog(false)}
        fullScreen
        sx={{ zIndex: 9999 }}
        PaperProps={{ 
          sx: { 
            background: '#FAFBFC',
            pt: 'env(safe-area-inset-top, 0px)',
          } 
        }}
      >
        {/* No header - just progress bar */}

        {/* Progress bar - thin, under header */}
        <LinearProgress
          variant="determinate"
          value={(getAnsweredCount(hardPreferences) / HARD_PREFERENCE_QUESTIONS.length) * 100}
          sx={{
            height: 3,
            backgroundColor: '#E5E7EB',
            flexShrink: 0,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #6C5CE7 0%, #A855F7 100%)',
            },
          }}
        />

        {/* Main Content - Centered column, max-width for readability */}
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pt: 8,
          px: 3,
          pb: 3,
          overflow: 'auto',
        }}>
          <Box sx={{ 
            width: '100%',
            maxWidth: 420,
          }}>
            {/* Header with title, icon and progress */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              {/* Icon */}
              <Box sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A855F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 24px rgba(108,92,231,0.3)',
              }}>
                <Heart size={28} color="#fff" fill="#fff" />
              </Box>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1F2937',
                  mb: 0.5,
                  letterSpacing: '-0.5px',
                }}
              >
                Things That Really Matter
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                {getAnsweredCount(hardPreferences)} of {HARD_PREFERENCE_QUESTIONS.length} answered
              </Typography>
              
              {/* Progress bar */}
              <Box sx={{ 
                mt: 2, 
                mx: 'auto', 
                maxWidth: 200,
                height: 6, 
                borderRadius: 999, 
                background: '#E5E7EB',
                overflow: 'hidden',
              }}>
                <Box sx={{ 
                  height: '100%', 
                  width: `${(getAnsweredCount(hardPreferences) / HARD_PREFERENCE_QUESTIONS.length) * 100}%`, 
                  background: 'linear-gradient(90deg, #6C5CE7 0%, #A855F7 100%)',
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }} />
              </Box>
            </Box>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPreferenceIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Question Block */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: '#1F2937', 
                      mb: 1.5,
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                    }}
                  >
                    {HARD_PREFERENCE_QUESTIONS[currentPreferenceIndex]?.question}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '0.95rem' }}>
                    This helps us find better matches for you
                  </Typography>
                </Box>

                {/* Button Group - Unified decision set */}
                <Stack spacing={1.5} sx={{ width: '100%' }}>
                  {/* Works for me - Primary positive */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      const q = HARD_PREFERENCE_QUESTIONS[currentPreferenceIndex];
                      setHardPreferences((prev) => {
                        const nextPrefs = { ...prev, [q.id]: 'works' };
                        const nextIdx = getNextUnansweredPreferenceIndex(currentPreferenceIndex, nextPrefs);
                        if (nextIdx !== -1) {
                          setCurrentPreferenceIndex(nextIdx);
                        } else {
                          // All questions answered, close dialog
                          setHardPreferencesDialog(false);
                        }
                        return nextPrefs;
                      });
                    }}
                    startIcon={<Check size={20} />}
                    sx={{
                      py: 1.75,
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderWidth: 2,
                      borderColor: '#10B981',
                      color: '#10B981',
                      backgroundColor: '#ECFDF5',
                      '&:hover': { 
                        backgroundColor: '#D1FAE5',
                        borderColor: '#10B981',
                        borderWidth: 2,
                      },
                    }}
                  >
                    Works for me
                  </Button>
                  
                  {/* Not for me - Secondary, NOT destructive red */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      const q = HARD_PREFERENCE_QUESTIONS[currentPreferenceIndex];
                      setHardPreferences((prev) => {
                        const nextPrefs = { ...prev, [q.id]: 'not' };
                        const nextIdx = getNextUnansweredPreferenceIndex(currentPreferenceIndex, nextPrefs);
                        if (nextIdx !== -1) {
                          setCurrentPreferenceIndex(nextIdx);
                        } else {
                          // All questions answered, close dialog
                          setHardPreferencesDialog(false);
                        }
                        return nextPrefs;
                      });
                    }}
                    startIcon={<X size={20} />}
                    sx={{
                      py: 1.75,
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderWidth: 2,
                      borderColor: '#9CA3AF',
                      color: '#6B7280',
                      backgroundColor: '#F3F4F6',
                      '&:hover': { 
                        backgroundColor: '#E5E7EB',
                        borderColor: '#6B7280',
                        borderWidth: 2,
                      },
                    }}
                  >
                    Not for me
                  </Button>
                  
                  {/* Skip - Tertiary link style */}
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      const q = HARD_PREFERENCE_QUESTIONS[currentPreferenceIndex];
                      setHardPreferences((prev) => {
                        const nextPrefs = { ...prev, [q.id]: 'skip' };
                        const nextIdx = getNextUnansweredPreferenceIndex(currentPreferenceIndex, nextPrefs);
                        if (nextIdx !== -1) {
                          setCurrentPreferenceIndex(nextIdx);
                        } else {
                          // All questions answered, close dialog
                          setHardPreferencesDialog(false);
                        }
                        return nextPrefs;
                      });
                    }}
                    sx={{
                      py: 1.25,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      color: '#9CA3AF',
                      '&:hover': { 
                        backgroundColor: 'transparent',
                        color: '#6B7280',
                      },
                    }}
                  >
                    Skip this one
                  </Button>
                </Stack>
              </motion.div>
            </AnimatePresence>

            {/* Exit button */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setHardPreferencesDialog(false)}
                startIcon={<X size={18} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderColor: '#6C5CE7',
                  color: '#6C5CE7',
                  '&:hover': {
                    borderColor: '#5B4BD5',
                    backgroundColor: 'rgba(108,92,231,0.05)',
                  },
                }}
              >
                Exit & Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Snackbar - high z-index to appear above bottom nav */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 10000, mb: 10 }}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Profile Preview Modal - Reuses ProfileTimeline with no interactivity */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#fff',
          },
        }}
      >
        {/* Preview Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            bgcolor: '#fff',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setShowPreview(false)} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              Profile Preview
            </Typography>
          </Box>
          <Chip
            label="This is how others see you"
            size="small"
            sx={{
              bgcolor: 'rgba(108,92,231,0.1)',
              color: '#6C5CE7',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Profile Timeline - Reusing existing component with preview mode (no actions) */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <ProfileTimeline
            user={(() => {
              // Read fresh data from localStorage when preview opens
              const freshData = getUserDataFromStorage();
              return {
                // Use existing state from this component - reflects current edits
                firstName: freshData?.firstName || freshData?.name || user?.firstName || 'You',
                name: freshData?.firstName || freshData?.name || user?.firstName || 'You',
                age: freshData?.age || user?.age || 25,
                verified: verified,
                tagline: null, // Don't show tagline on hero photo
                // Use first prompt answer as intro line
                introLine: freshData?.introLine || (selectedPrompts[0]?.answer) || null,
                bio: bio,
                photos: photos.filter(p => p.url).map(p => p.url),
                primaryPhoto: photos[0]?.url,
                interests: interests,
                qualities: selectedQualities,
                causes: selectedCauses,
                lookingFor: lookingFor,
                // My Details / Quick Facts fields
                gender: freshData?.gender || user?.gender,
                city: freshData?.city || freshData?.location || user?.city || user?.location,
                location: freshData?.location || freshData?.city || user?.location || user?.city,
                height: freshData?.height || user?.height,
                hometown: freshData?.hometown || user?.hometown,
                work: freshData?.work || user?.work,
                religion: freshData?.religion || user?.religion,
                politics: freshData?.politics || user?.politics,
                // Lifestyle fields
                drinking: freshData?.drinking || user?.drinking,
                smoking: freshData?.smoking || user?.smoking,
                kids: freshData?.kids || user?.kids,
                exercise: freshData?.exercise || user?.exercise,
                starSign: freshData?.starSign || user?.starSign,
                // Snapshot fields
                profession: freshData?.profession || freshData?.job || freshData?.occupation || user?.profession || user?.job,
                jobTitle: freshData?.jobTitle || freshData?.job || user?.jobTitle,
                education: freshData?.education || user?.education,
                hometown: freshData?.hometown || user?.hometown,
                languages: freshData?.languages || user?.languages,
                // Weekly rhythm & music
                weeklyRhythm: freshData?.weeklyRhythm || freshData?.weeklyTimeline || user?.weeklyRhythm,
                weeklyTimeline: freshData?.weeklyTimeline || freshData?.weeklyRhythm || user?.weeklyTimeline,
                favoriteMusic: freshData?.favoriteMusic || freshData?.spotifyArtists || user?.favoriteMusic,
                spotifyPlaylists: freshData?.spotifyPlaylists || user?.spotifyPlaylists,
                spotifyConnected: freshData?.spotifyConnected || user?.spotifyConnected,
                spotifyArtists: freshData?.spotifyArtists || user?.spotifyArtists,
                pets: freshData?.pets || user?.pets,
                // Prompts for display after photos - always use current state
                prompts: selectedPrompts.length > 0 ? selectedPrompts : (freshData?.prompts || []),
              };
            })()}
            // Disable all interactive actions for preview mode
            onLike={() => {}}
            onPass={() => {}}
            onUndo={() => {}}
            canUndo={false}
            hideUndo={true}
            isPreview={true}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
