/**
 * ProfileSettings V2 - Clean, Minimal Design
 * Matches Pulse app design language
 */

import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Snackbar,
  Alert,
  Slider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle,
  Heart,
  Briefcase,
  GraduationCap,
  Ruler,
  MapPin,
  Wine,
  Cigarette,
  Baby,
  Dog,
  Moon,
  Sparkles,
  Edit3,
  ChevronRight,
  Image,
  Trash2,
  Eye,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  Lock,
  Globe,
  Palette,
  User,
  Star,
  Zap,
  Instagram,
  Music,
} from "lucide-react";

// Brand colors matching app
const COLORS = {
  primary: "#6C5CE7",
  accent: "#ec4899",
  success: "#10b981",
  warning: "#f59e0b",
  dark: "#1a1a2e",
  gray: "#64748b",
  lightGray: "#94a3b8",
  bg: "#f8fafc",
  card: "#ffffff",
};

// Options data
const INTERESTS = [
  "🎵 Music", "🎬 Movies", "📚 Reading", "✈️ Travel", "🏋️ Fitness", "🎮 Gaming",
  "🍳 Cooking", "📸 Photography", "🎨 Art", "🧘 Yoga", "🏖️ Beach", "⛺ Camping",
  "🍷 Wine", "☕ Coffee", "🎤 Karaoke", "⚽ Sports", "🎸 Guitar", "🐕 Dogs",
];

const LOOKING_FOR = [
  { id: "relationship", label: "Long-term relationship", emoji: "💑" },
  { id: "casual", label: "Something casual", emoji: "🌴" },
  { id: "friends", label: "New friends", emoji: "👋" },
  { id: "figuring", label: "Still figuring it out", emoji: "🤔" },
];

const PROMPTS = [
  "The key to my heart is...",
  "My ideal weekend looks like...",
  "A fun fact about me is...",
  "I'm looking for someone who...",
  "My biggest passion is...",
  "Two truths and a lie...",
];

// Reusable Section Header
const SectionHeader = ({ icon, title, action, onAction }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          bgcolor: `rgba(108,92,231,0.1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, color: COLORS.dark, fontSize: "1.05rem" }}>
        {title}
      </Typography>
    </Box>
    {action && (
      <Button
        size="small"
        onClick={onAction}
        endIcon={<ChevronRight size={16} />}
        sx={{ textTransform: "none", fontWeight: 600, color: COLORS.primary, p: 0 }}
      >
        {action}
      </Button>
    )}
  </Box>
);

// Card wrapper
const Card = ({ children, sx = {}, onClick, highlight }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={onClick ? { scale: 1.01 } : {}}
    whileTap={onClick ? { scale: 0.99 } : {}}
  >
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: "16px",
        bgcolor: COLORS.card,
        border: highlight ? `2px solid ${COLORS.primary}` : "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick ? { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } : {},
        ...sx,
      }}
    >
      {children}
    </Box>
  </motion.div>
);

// Row item for settings
const SettingItem = ({ icon: Icon, label, value, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      py: 1.5,
      cursor: onClick ? "pointer" : "default",
      "&:hover": onClick ? { opacity: 0.7 } : {},
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Icon size={20} color={COLORS.gray} />
      <Typography sx={{ color: COLORS.dark, fontWeight: 500 }}>{label}</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {value && (
        <Typography sx={{ color: COLORS.gray, fontSize: "0.9rem" }}>{value}</Typography>
      )}
      {onClick && <ChevronRight size={18} color={COLORS.lightGray} />}
    </Box>
  </Box>
);

export default function ProfileSettingsV2() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State
  const [photos, setPhotos] = useState([
    { url: "https://randomuser.me/api/portraits/women/44.jpg" },
    { url: "https://randomuser.me/api/portraits/women/45.jpg" },
    { url: "" },
    { url: "" },
    { url: "" },
    { url: "" },
  ]);
  const [bio, setBio] = useState("Coffee enthusiast & sunset chaser ☀️");
  const [job, setJob] = useState("Product Designer");
  const [education, setEducation] = useState("Tel Aviv University");
  const [location] = useState("Tel Aviv");
  const [height, setHeight] = useState(168);
  const [interests, setInterests] = useState(["🎵 Music", "✈️ Travel", "☕ Coffee", "📸 Photography"]);
  const [lookingFor, setLookingFor] = useState("relationship");
  const [prompts, setPrompts] = useState([
    { question: "The key to my heart is...", answer: "Good food and even better conversations" }
  ]);
  const [verified, setVerified] = useState(false);
  const [ageRange, setAgeRange] = useState([24, 35]);
  const [maxDistance, setMaxDistance] = useState(30);

  // Social connections state
  const [instagram, setInstagram] = useState({ connected: false, username: "", photos: [] });
  const [spotify, setSpotify] = useState({ connected: false, username: "", topArtists: [] });
  const [connectingService, setConnectingService] = useState(null); // 'instagram' | 'spotify' | null
  const [connectDialog, setConnectDialog] = useState({ open: false, service: null });

  // Dialogs
  const [photoDialog, setPhotoDialog] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [bioDialog, setBioDialog] = useState(false);
  const [interestsDialog, setInterestsDialog] = useState(false);
  const [promptDialog, setPromptDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [detailDialog, setDetailDialog] = useState({ open: false, type: null });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Profile completion
  const completion = useMemo(() => {
    let score = 0;
    const filled = photos.filter(p => p.url).length;
    score += Math.min(filled * 10, 40);
    if (bio.length > 10) score += 20;
    if (interests.length >= 3) score += 15;
    if (job) score += 10;
    if (prompts.length > 0) score += 15;
    return Math.min(100, score);
  }, [photos, bio, interests, job, prompts]);

  // Handlers
  const handlePhotoClick = (idx) => {
    setSelectedPhotoIdx(idx);
    setPhotoDialog(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || selectedPhotoIdx === null) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos(prev => prev.map((p, i) => i === selectedPhotoIdx ? { url: reader.result } : p));
      setSnack({ open: true, message: "Photo updated!", severity: "success" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setPhotoDialog(false);
  };

  const handleRemovePhoto = () => {
    if (selectedPhotoIdx !== null) {
      setPhotos(prev => prev.map((p, i) => i === selectedPhotoIdx ? { url: "" } : p));
      setPhotoDialog(false);
    }
  };

  const toggleInterest = (interest) => {
    setInterests(prev => {
      if (prev.includes(interest)) return prev.filter(i => i !== interest);
      if (prev.length < 8) return [...prev, interest];
      return prev;
    });
  };

  const handleSavePrompt = () => {
    if (selectedPrompt && promptAnswer.trim()) {
      setPrompts(prev => [...prev.filter(p => p.question !== selectedPrompt), { question: selectedPrompt, answer: promptAnswer }]);
      setPromptDialog(false);
      setSelectedPrompt(null);
      setPromptAnswer("");
    }
  };

  // Instagram connection handler
  const handleInstagramConnect = async () => {
    setConnectingService("instagram");
    setConnectDialog({ open: true, service: "instagram" });
  };

  const confirmInstagramConnect = async () => {
    setConnectDialog({ open: false, service: null });
    setConnectingService("instagram");
    
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 2000));
    
    // Mock successful connection with real-looking data
    setInstagram({
      connected: true,
      username: "@sarah.designs",
      photos: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
      ]
    });
    setConnectingService(null);
    setSnack({ open: true, message: "Instagram connected successfully!", severity: "success" });
  };

  const handleInstagramDisconnect = () => {
    setInstagram({ connected: false, username: "", photos: [] });
    setSnack({ open: true, message: "Instagram disconnected", severity: "info" });
  };

  // Spotify connection handler
  const handleSpotifyConnect = async () => {
    setConnectingService("spotify");
    setConnectDialog({ open: true, service: "spotify" });
  };

  const confirmSpotifyConnect = async () => {
    setConnectDialog({ open: false, service: null });
    setConnectingService("spotify");
    
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 2000));
    
    // Mock successful connection with real-looking data
    setSpotify({
      connected: true,
      username: "Sarah",
      topArtists: ["Taylor Swift", "The Weeknd", "Dua Lipa"]
    });
    setConnectingService(null);
    setSnack({ open: true, message: "Spotify connected successfully!", severity: "success" });
  };

  const handleSpotifyDisconnect = () => {
    setSpotify({ connected: false, username: "", topArtists: [] });
    setSnack({ open: true, message: "Spotify disconnected", severity: "info" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.bg, pb: 12 }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "rgba(248,250,252,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, maxWidth: 600, mx: "auto" }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: COLORS.dark }}>
            <ArrowLeft size={24} />
          </IconButton>
          <Typography sx={{ fontWeight: 800, color: COLORS.dark, fontSize: "1.1rem" }}>
            Edit Profile
          </Typography>
          <Button
            onClick={() => setSnack({ open: true, message: "Saved!", severity: "success" })}
            sx={{ fontWeight: 700, color: COLORS.primary, textTransform: "none" }}
          >
            Done
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 600, mx: "auto", px: 2, pt: 3 }}>
        {/* Profile Strength */}
        {completion < 100 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(236,72,153,0.06) 100%)",
                border: "1px solid rgba(108,92,231,0.12)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: COLORS.dark }}>
                    Complete your profile
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.gray }}>
                    Get 3x more matches with a complete profile
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                  }}
                >
                  {completion}%
                </Box>
              </Box>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(108,92,231,0.15)" }}>
                <Box
                  sx={{
                    height: "100%",
                    width: `${completion}%`,
                    borderRadius: 3,
                    bgcolor: COLORS.primary,
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Photos */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Camera size={18} color={COLORS.primary} />} title="Photos" />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
            {photos.map((photo, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Box
                  onClick={() => handlePhotoClick(idx)}
                  sx={{
                    position: "relative",
                    aspectRatio: "3/4",
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "pointer",
                    bgcolor: "#f1f5f9",
                    border: photo.url ? "none" : "2px dashed #e2e8f0",
                  }}
                >
                  {photo.url ? (
                    <>
                      <Box
                        component="img"
                        src={photo.url}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {idx === 0 && (
                        <Chip
                          label="Main"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: COLORS.primary,
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 22,
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus size={28} color={COLORS.lightGray} />
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* About Me */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Edit3 size={18} color={COLORS.primary} />} title="About Me" action="Edit" onAction={() => setBioDialog(true)} />
          <Card>
            <Typography sx={{ color: bio ? COLORS.dark : COLORS.gray, lineHeight: 1.6 }}>
              {bio || "Write something about yourself..."}
            </Typography>
          </Card>
        </Box>

        {/* Interests */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Star size={18} color={COLORS.accent} />} title="Interests" action="Edit" onAction={() => setInterestsDialog(true)} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {interests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                sx={{
                  bgcolor: "rgba(108,92,231,0.1)",
                  color: COLORS.primary,
                  fontWeight: 600,
                  borderRadius: "10px",
                }}
              />
            ))}
            {interests.length < 8 && (
              <Chip
                label="+ Add"
                onClick={() => setInterestsDialog(true)}
                sx={{
                  bgcolor: "#f1f5f9",
                  color: COLORS.gray,
                  fontWeight: 600,
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Prompts */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Sparkles size={18} color={COLORS.warning} />} title="Prompts" action={prompts.length < 3 ? "Add" : null} onAction={() => setPromptDialog(true)} />
          {prompts.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {prompts.map((p, idx) => (
                <Card key={idx}>
                  <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: "0.85rem", mb: 0.5 }}>
                    {p.question}
                  </Typography>
                  <Typography sx={{ color: COLORS.dark }}>{p.answer}</Typography>
                </Card>
              ))}
            </Box>
          ) : (
            <Card onClick={() => setPromptDialog(true)} sx={{ textAlign: "center", py: 4 }}>
              <Sparkles size={32} color={COLORS.lightGray} style={{ marginBottom: 8 }} />
              <Typography sx={{ color: COLORS.gray }}>Add prompts to help start conversations</Typography>
            </Card>
          )}
        </Box>

        {/* Looking For */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Heart size={18} color={COLORS.accent} />} title="Looking For" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {LOOKING_FOR.map((option) => (
              <Card
                key={option.id}
                onClick={() => setLookingFor(option.id)}
                highlight={lookingFor === option.id}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5 }}
              >
                <Typography sx={{ fontSize: "1.3rem" }}>{option.emoji}</Typography>
                <Typography sx={{ fontWeight: 500, color: COLORS.dark }}>{option.label}</Typography>
                {lookingFor === option.id && (
                  <CheckCircle size={20} color={COLORS.primary} style={{ marginLeft: "auto" }} />
                )}
              </Card>
            ))}
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<User size={18} color={COLORS.success} />} title="My Details" />
          <Card>
            <SettingItem icon={Briefcase} label="Job" value={job || "Add"} onClick={() => setDetailDialog({ open: true, type: "job" })} />
            <SettingItem icon={GraduationCap} label="Education" value={education || "Add"} onClick={() => setDetailDialog({ open: true, type: "education" })} />
            <SettingItem icon={MapPin} label="Location" value={location} />
            <SettingItem icon={Ruler} label="Height" value={`${height} cm`} onClick={() => setDetailDialog({ open: true, type: "height" })} />
          </Card>
        </Box>

        {/* Discovery */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<MapPin size={18} color={COLORS.primary} />} title="Discovery" />
          <Card>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 600, color: COLORS.dark, mb: 1 }}>Age Range</Typography>
              <Typography sx={{ color: COLORS.gray, fontSize: "0.9rem", mb: 1 }}>{ageRange[0]} - {ageRange[1]}</Typography>
              <Slider
                value={ageRange}
                onChange={(e, v) => setAgeRange(v)}
                min={18}
                max={60}
                sx={{ color: COLORS.primary }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, color: COLORS.dark, mb: 1 }}>Maximum Distance</Typography>
              <Typography sx={{ color: COLORS.gray, fontSize: "0.9rem", mb: 1 }}>{maxDistance} km</Typography>
              <Slider
                value={maxDistance}
                onChange={(e, v) => setMaxDistance(v)}
                min={5}
                max={100}
                sx={{ color: COLORS.primary }}
              />
            </Box>
          </Card>
        </Box>

        {/* Verification */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Shield size={18} color={COLORS.success} />} title="Verification" />
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: verified ? "rgba(16,185,129,0.08)" : COLORS.card,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {verified ? <ShieldCheck size={24} color={COLORS.success} /> : <Shield size={24} color={COLORS.lightGray} />}
              <Box>
                <Typography sx={{ fontWeight: 600, color: COLORS.dark }}>
                  {verified ? "Verified" : "Get Verified"}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.gray }}>
                  {verified ? "Your profile is verified" : "Build trust with a selfie"}
                </Typography>
              </Box>
            </Box>
            <Button
              variant={verified ? "outlined" : "contained"}
              size="small"
              onClick={() => setVerified(true)}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: verified ? "transparent" : COLORS.primary,
                borderColor: verified ? COLORS.success : undefined,
                color: verified ? COLORS.success : "#fff",
              }}
            >
              {verified ? "Verified ✓" : "Verify"}
            </Button>
          </Card>
        </Box>

        {/* Connected Accounts */}
        <Box sx={{ mb: 3 }}>
          <SectionHeader icon={<Globe size={18} color={COLORS.primary} />} title="Connected" />
          
          {/* Instagram Card */}
          <Card sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ 
                  width: 44, height: 44, borderRadius: "12px", 
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Instagram size={22} color="#fff" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: COLORS.dark }}>Instagram</Typography>
                  {instagram.connected ? (
                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.success }}>{instagram.username}</Typography>
                  ) : (
                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.gray }}>Share your photos</Typography>
                  )}
                </Box>
              </Box>
              {connectingService === "instagram" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Box sx={{ width: 20, height: 20, border: "2px solid #E4405F", borderTopColor: "transparent", borderRadius: "50%" }} />
                  </motion.div>
                  <Typography sx={{ fontSize: "0.85rem", color: COLORS.gray }}>Connecting...</Typography>
                </Box>
              ) : instagram.connected ? (
                <Button 
                  size="small" 
                  onClick={handleInstagramDisconnect}
                  sx={{ textTransform: "none", fontWeight: 600, color: "#ef4444" }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={handleInstagramConnect}
                  sx={{ 
                    textTransform: "none", fontWeight: 600, 
                    background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743)",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(220,39,67,0.3)",
                  }}
                >
                  Connect
                </Button>
              )}
            </Box>
            {/* Show Instagram photos if connected */}
            {instagram.connected && instagram.photos.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                {instagram.photos.map((photo, idx) => (
                  <Box 
                    key={idx}
                    component="img" 
                    src={photo} 
                    sx={{ width: 60, height: 60, borderRadius: "8px", objectFit: "cover" }}
                  />
                ))}
                <Typography sx={{ fontSize: "0.8rem", color: COLORS.gray, alignSelf: "center", ml: 1 }}>
                  +12 more
                </Typography>
              </Box>
            )}
          </Card>

          {/* Spotify Card */}
          <Card>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ 
                  width: 44, height: 44, borderRadius: "12px", bgcolor: "#1DB954",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Music size={22} color="#fff" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: COLORS.dark }}>Spotify</Typography>
                  {spotify.connected ? (
                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.success }}>Connected</Typography>
                  ) : (
                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.gray }}>Show your music taste</Typography>
                  )}
                </Box>
              </Box>
              {connectingService === "spotify" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Box sx={{ width: 20, height: 20, border: "2px solid #1DB954", borderTopColor: "transparent", borderRadius: "50%" }} />
                  </motion.div>
                  <Typography sx={{ fontSize: "0.85rem", color: COLORS.gray }}>Connecting...</Typography>
                </Box>
              ) : spotify.connected ? (
                <Button 
                  size="small" 
                  onClick={handleSpotifyDisconnect}
                  sx={{ textTransform: "none", fontWeight: 600, color: "#ef4444" }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={handleSpotifyConnect}
                  sx={{ 
                    textTransform: "none", fontWeight: 600, bgcolor: "#1DB954",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(29,185,84,0.3)",
                    "&:hover": { bgcolor: "#1aa34a" }
                  }}
                >
                  Connect
                </Button>
              )}
            </Box>
            {/* Show Spotify top artists if connected */}
            {spotify.connected && spotify.topArtists.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontSize: "0.8rem", color: COLORS.gray, mb: 1 }}>Top Artists</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {spotify.topArtists.map((artist, idx) => (
                    <Chip 
                      key={idx}
                      label={artist} 
                      size="small"
                      sx={{ bgcolor: "rgba(29,185,84,0.1)", color: "#1DB954", fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Card>
        </Box>

      </Box>

      {/* Photo Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Photo Options</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button fullWidth variant="outlined" startIcon={<Image size={20} />} onClick={() => fileInputRef.current?.click()} sx={{ py: 1.5, borderRadius: "12px", textTransform: "none" }}>
              Choose Photo
            </Button>
            {photos[selectedPhotoIdx]?.url && (
              <Button fullWidth variant="outlined" color="error" startIcon={<Trash2 size={20} />} onClick={handleRemovePhoto} sx={{ py: 1.5, borderRadius: "12px", textTransform: "none" }}>
                Remove Photo
              </Button>
            )}
          </Box>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </DialogContent>
      </Dialog>

      {/* Bio Dialog */}
      <Dialog open={bioDialog} onClose={() => setBioDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>About Me</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            sx={{ mt: 1 }}
          />
          <Typography sx={{ mt: 1, color: COLORS.gray, fontSize: "0.85rem" }}>{bio.length}/500</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBioDialog(false)}>Cancel</Button>
          <Button onClick={() => setBioDialog(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Interests Dialog */}
      <Dialog open={interestsDialog} onClose={() => setInterestsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Select Interests ({interests.length}/8)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {INTERESTS.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onClick={() => toggleInterest(interest)}
                sx={{
                  bgcolor: interests.includes(interest) ? "rgba(108,92,231,0.15)" : "#f1f5f9",
                  color: interests.includes(interest) ? COLORS.primary : COLORS.gray,
                  fontWeight: 600,
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterestsDialog(false)} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>

      {/* Prompt Dialog */}
      <Dialog open={promptDialog} onClose={() => { setPromptDialog(false); setSelectedPrompt(null); setPromptAnswer(""); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{selectedPrompt ? "Answer Prompt" : "Choose a Prompt"}</DialogTitle>
        <DialogContent>
          {!selectedPrompt ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {PROMPTS.filter(p => !prompts.some(pr => pr.question === p)).map((prompt) => (
                <Button
                  key={prompt}
                  fullWidth
                  variant="outlined"
                  onClick={() => setSelectedPrompt(prompt)}
                  sx={{ borderRadius: "12px", textTransform: "none", justifyContent: "flex-start", py: 1.5 }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontWeight: 600, color: COLORS.primary, mb: 1 }}>{selectedPrompt}</Typography>
              <TextField fullWidth multiline rows={3} value={promptAnswer} onChange={(e) => setPromptAnswer(e.target.value)} placeholder="Your answer..." />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPromptDialog(false); setSelectedPrompt(null); setPromptAnswer(""); }}>Cancel</Button>
          {selectedPrompt && <Button variant="contained" disabled={!promptAnswer.trim()} onClick={handleSavePrompt}>Save</Button>}
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, type: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, textTransform: "capitalize" }}>{detailDialog.type}</DialogTitle>
        <DialogContent>
          {detailDialog.type === "height" ? (
            <Box sx={{ pt: 2 }}>
              <Typography sx={{ textAlign: "center", fontWeight: 700, fontSize: "2rem", color: COLORS.primary }}>{height} cm</Typography>
              <Slider value={height} onChange={(e, v) => setHeight(v)} min={140} max={210} sx={{ color: COLORS.primary }} />
            </Box>
          ) : (
            <TextField
              fullWidth
              value={detailDialog.type === "job" ? job : education}
              onChange={(e) => detailDialog.type === "job" ? setJob(e.target.value) : setEducation(e.target.value)}
              placeholder={`Enter your ${detailDialog.type}`}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, type: null })}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Social Connection Dialog */}
      <Dialog 
        open={connectDialog.open} 
        onClose={() => { setConnectDialog({ open: false, service: null }); setConnectingService(null); }}
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden" } }}
      >
        {connectDialog.service === "instagram" && (
          <>
            <Box sx={{ 
              background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", 
              p: 3, 
              textAlign: "center" 
            }}>
              <Instagram size={48} color="#fff" />
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", mt: 1 }}>
                Connect Instagram
              </Typography>
            </Box>
            <DialogContent sx={{ pt: 3 }}>
              <Typography sx={{ color: COLORS.dark, mb: 2, textAlign: "center" }}>
                Connecting Instagram will:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Show your recent photos on your profile</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Verify you're a real person</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Help find mutual connections</Typography>
                </Box>
              </Box>
              <Typography sx={{ mt: 2, fontSize: "0.8rem", color: COLORS.gray, textAlign: "center" }}>
                We'll never post anything without your permission
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={confirmInstagramConnect}
                sx={{ 
                  py: 1.5, 
                  borderRadius: "12px", 
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743)",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Continue with Instagram
              </Button>
            </DialogActions>
          </>
        )}
        {connectDialog.service === "spotify" && (
          <>
            <Box sx={{ bgcolor: "#1DB954", p: 3, textAlign: "center" }}>
              <Music size={48} color="#fff" />
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", mt: 1 }}>
                Connect Spotify
              </Typography>
            </Box>
            <DialogContent sx={{ pt: 3 }}>
              <Typography sx={{ color: COLORS.dark, mb: 2, textAlign: "center" }}>
                Connecting Spotify will:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Show your top artists on your profile</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Find matches with similar music taste</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                  <CheckCircle size={20} color={COLORS.success} />
                  <Typography sx={{ fontSize: "0.9rem" }}>Share your favorite songs</Typography>
                </Box>
              </Box>
              <Typography sx={{ mt: 2, fontSize: "0.8rem", color: COLORS.gray, textAlign: "center" }}>
                Your listening history stays private
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={confirmSpotifyConnect}
                sx={{ 
                  py: 1.5, 
                  borderRadius: "12px", 
                  bgcolor: "#1DB954",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#1aa34a" }
                }}
              >
                Continue with Spotify
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: "12px" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
