/**
 * ProfileSettings - Redesigned Profile Page
 * 
 * Organized sections:
 * 1. Profile Header (Photo + Name)
 * 2. About Me (Bio, Interests)
 * 3. My Details (Height, Job, Education)
 * 4. Looking For (Preferences)
 * 5. Verification & Safety
 * 6. Account Settings
 */

import React, { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
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
  LinearProgress,
  Collapse,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle,
  X,
  Heart,
  Briefcase,
  GraduationCap,
  Ruler,
  MapPin,
  Calendar,
  Wine,
  Cigarette,
  Baby,
  Dog,
  Moon,
  Sparkles,
  Edit3,
  ChevronRight,
  ChevronDown,
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
  Info,
} from "lucide-react";

/* ======================= Constants ======================= */
const BRAND_PRIMARY = "#6C5CE7";
const BRAND_ACCENT = "#F43F5E";
const GRADIENT_PRIMARY = "linear-gradient(135deg, #6C5CE7 0%, #a855f7 50%, #ec4899 100%)";
const GRADIENT_SUCCESS = "linear-gradient(135deg, #10b981 0%, #34d399 100%)";
const GRADIENT_BG = "radial-gradient(ellipse at top, rgba(108,92,231,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.1) 0%, transparent 50%), linear-gradient(180deg, #fafbff 0%, #f8fafc 100%)";
const GLASS_STYLE = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const INTERESTS_LIST = [
  { emoji: "🎵", label: "Music" },
  { emoji: "🎬", label: "Movies" },
  { emoji: "📚", label: "Reading" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🏋️", label: "Fitness" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🍳", label: "Cooking" },
  { emoji: "📸", label: "Photography" },
  { emoji: "🎨", label: "Art" },
  { emoji: "🧘", label: "Yoga" },
  { emoji: "🏖️", label: "Beach" },
  { emoji: "⛺", label: "Camping" },
  { emoji: "🍷", label: "Wine" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🎤", label: "Karaoke" },
  { emoji: "🎯", label: "Sports" },
];

const LOOKING_FOR_OPTIONS = [
  { value: "relationship", label: "Long-term relationship", icon: "💑" },
  { value: "casual", label: "Something casual", icon: "🌴" },
  { value: "friends", label: "New friends", icon: "👋" },
  { value: "figuring", label: "Still figuring it out", icon: "🤔" },
];

const HEIGHT_OPTIONS = Array.from({ length: 51 }, (_, i) => 150 + i);
const DRINK_OPTIONS = ["Never", "Socially", "Often"];
const SMOKE_OPTIONS = ["Never", "Sometimes", "Regularly"];
const KIDS_OPTIONS = ["Don't have", "Have kids", "Want someday", "Don't want"];
const PET_OPTIONS = ["No pets", "Dog", "Cat", "Other"];

// New missing options
const ZODIAC_OPTIONS = ["Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋", "Leo ♌", "Virgo ♍", "Libra ♎", "Scorpio ♏", "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓"];
const RELIGION_OPTIONS = ["Not religious", "Spiritual", "Jewish", "Christian", "Muslim", "Buddhist", "Hindu", "Other"];
const EXERCISE_OPTIONS = ["Never", "Sometimes", "Often", "Daily"];
const LANGUAGE_OPTIONS = ["Hebrew", "English", "Arabic", "Russian", "French", "Spanish", "German", "Other"];

const PROMPTS_LIST = [
  "The key to my heart is...",
  "My ideal weekend looks like...",
  "A fun fact about me is...",
  "My friends describe me as...",
  "I'm looking for someone who...",
  "My biggest passion is...",
  "Two truths and a lie...",
  "The way to win me over is...",
];

/* ======================= Section Component ======================= */
const Section = ({ title, icon: Icon, children, defaultOpen = true, badge, gradient }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          mb: 2.5,
          borderRadius: "24px",
          overflow: "hidden",
          ...GLASS_STYLE,
          boxShadow: "0 8px 32px rgba(108,92,231,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 40px rgba(108,92,231,0.12), 0 4px 12px rgba(0,0,0,0.06)",
          },
        }}
      >
        <Box
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2.5,
            cursor: "pointer",
            background: gradient ? `linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(168,85,247,0.05) 100%)` : "transparent",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {Icon && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "14px",
                  background: GRADIENT_PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(108,92,231,0.3)",
                }}
              >
                <Icon size={22} color="#fff" />
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a2e", fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
              {title}
            </Typography>
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  background: GRADIENT_PRIMARY,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 24,
                  boxShadow: "0 2px 8px rgba(108,92,231,0.3)",
                }}
              />
            )}
          </Box>
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                bgcolor: "rgba(108,92,231,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronDown size={18} color={BRAND_PRIMARY} />
            </Box>
          </motion.div>
        </Box>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ px: 2.5, pb: 2.5 }}>{children}</Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

/* ======================= Setting Row Component ======================= */
const SettingRow = ({ icon: Icon, label, value, onClick, hasArrow = true }) => (
  <motion.div whileHover={{ x: onClick ? 4 : 0 }} transition={{ duration: 0.2 }}>
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.75,
        px: 1.5,
        mx: -1.5,
        cursor: onClick ? "pointer" : "default",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        "&:hover": onClick ? { 
          bgcolor: "rgba(108,92,231,0.04)",
        } : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {Icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "rgba(108,92,231,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} color={BRAND_PRIMARY} />
          </Box>
        )}
        <Typography sx={{ color: "#1a1a2e", fontWeight: 600, fontSize: "0.95rem" }}>{label}</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {value && (
          <Typography sx={{ 
            color: "#64748b", 
            fontSize: "0.9rem",
            fontWeight: 500,
            bgcolor: "rgba(0,0,0,0.03)",
            px: 1.5,
            py: 0.5,
            borderRadius: "8px",
          }}>
            {value}
          </Typography>
        )}
        {hasArrow && onClick && (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: "rgba(108,92,231,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={16} color={BRAND_PRIMARY} />
          </Box>
        )}
      </Box>
    </Box>
  </motion.div>
);

/* ======================= Main Component ======================= */
export default function ProfileSettingsRedesign() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile state
  const [photos, setPhotos] = useState([
    { url: "https://randomuser.me/api/portraits/women/44.jpg" },
    { url: "" },
    { url: "" },
    { url: "" },
    { url: "" },
    { url: "" },
  ]);
  const [name, setName] = useState("Sarah");
  const [age, setAge] = useState(28);
  const [bio, setBio] = useState("");
  const [job, setJob] = useState("");
  const [company, setCompany] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("Tel Aviv");
  const [height, setHeight] = useState(165);
  const [drinking, setDrinking] = useState("Socially");
  const [smoking, setSmoking] = useState("Never");
  const [kids, setKids] = useState("Don't have");
  const [pets, setPets] = useState("No pets");
  const [lookingFor, setLookingFor] = useState("relationship");
  const [interests, setInterests] = useState([
    { emoji: "🎵", label: "Music" },
    { emoji: "✈️", label: "Travel" },
    { emoji: "☕", label: "Coffee" },
  ]);
  const [verified, setVerified] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [distanceVisible, setDistanceVisible] = useState(true);

  // New missing state
  const [zodiac, setZodiac] = useState("");
  const [religion, setReligion] = useState("");
  const [exercise, setExercise] = useState("");
  const [languages, setLanguages] = useState(["Hebrew", "English"]);
  const [prompts, setPrompts] = useState([]);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  
  // Discovery preferences
  const [ageRangeMin, setAgeRangeMin] = useState(18);
  const [ageRangeMax, setAgeRangeMax] = useState(45);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showMe, setShowMe] = useState("Everyone");

  // Dialog states
  const [photoDialog, setPhotoDialog] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [bioDialog, setBioDialog] = useState(false);
  const [interestsDialog, setInterestsDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState({ open: false, type: null });
  const [lookingForDialog, setLookingForDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [promptDialog, setPromptDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [discoveryDialog, setDiscoveryDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Profile completion
  const completion = useMemo(() => {
    let score = 0;
    if (photos.some(p => p.url)) score += 25;
    if (bio.length > 10) score += 25;
    if (interests.length >= 3) score += 25;
    if (job || education) score += 15;
    if (verified) score += 10;
    return Math.min(100, score);
  }, [photos, bio, interests, job, education, verified]);

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
      setPhotos(prev => prev.map((p, i) => 
        i === selectedPhotoIdx ? { url: reader.result } : p
      ));
      setSnack({ open: true, message: "Photo updated!", severity: "success" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setPhotoDialog(false);
  };

  const handleRemovePhoto = () => {
    if (selectedPhotoIdx !== null) {
      setPhotos(prev => prev.map((p, i) => 
        i === selectedPhotoIdx ? { url: "" } : p
      ));
      setPhotoDialog(false);
      setSnack({ open: true, message: "Photo removed", severity: "info" });
    }
  };

  const toggleInterest = (interest) => {
    setInterests(prev => {
      const exists = prev.some(i => i.label === interest.label);
      if (exists) {
        return prev.filter(i => i.label !== interest.label);
      } else if (prev.length < 10) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  const handleSave = async () => {
    try {
      await new Promise(r => setTimeout(r, 500));
      setSnack({ open: true, message: "Profile saved successfully!", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Failed to save", severity: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: GRADIENT_BG,
        pb: 12,
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: "fixed",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: 100,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          ...GLASS_STYLE,
          borderBottom: "1px solid rgba(108,92,231,0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: "rgba(108,92,231,0.08)",
              "&:hover": { bgcolor: "rgba(108,92,231,0.15)" },
            }}
          >
            <ArrowLeft size={22} color={BRAND_PRIMARY} />
          </IconButton>
          <Box sx={{ textAlign: "center" }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800, 
                background: GRADIENT_PRIMARY,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.2rem",
              }}
            >
              Edit Profile
            </Typography>
          </Box>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              fontWeight: 700,
              background: GRADIENT_PRIMARY,
              textTransform: "none",
              borderRadius: "12px",
              px: 2.5,
              boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(108,92,231,0.4)",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 600, mx: "auto", px: 2, pt: 3, position: "relative", zIndex: 1 }}>
        {/* Profile Completion - Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              mb: 3,
              p: 3,
              borderRadius: "28px",
              background: GRADIENT_PRIMARY,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(108,92,231,0.35)",
            }}
          >
            {/* Decorative circles */}
            <Box sx={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)" }} />
            <Box sx={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />
            
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
                    Profile Strength
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem", opacity: 0.85, mt: 0.5 }}>
                    {completion < 100 ? "Keep going! 💪" : "Perfect! 🎉"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: "1.5rem" }}>
                    {completion}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completion}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "rgba(255,255,255,0.25)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    bgcolor: "#fff",
                    boxShadow: "0 0 20px rgba(255,255,255,0.5)",
                  },
                }}
              />
              {completion < 100 && (
                <Typography sx={{ mt: 2, fontSize: "0.9rem", opacity: 0.9 }}>
                  {completion < 50 
                    ? "✨ Add more photos and details to get 3x more matches!"
                    : "🔥 Almost there! Complete your profile for best results."
                  }
                </Typography>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Photos Section */}
        <Section title="Photos" icon={Camera} badge={photos.filter(p => p.url).length + "/6"} gradient>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {photos.map((photo, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  onClick={() => handlePhotoClick(idx)}
                  sx={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: idx === 0 
                      ? `3px solid transparent` 
                      : "2px dashed rgba(108,92,231,0.3)",
                    background: idx === 0 
                      ? GRADIENT_PRIMARY 
                      : "linear-gradient(135deg, rgba(108,92,231,0.05) 0%, rgba(168,85,247,0.05) 100%)",
                    p: idx === 0 ? "3px" : 0,
                    boxShadow: photo.url 
                      ? "0 8px 30px rgba(108,92,231,0.2)" 
                      : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: idx === 0 ? "17px" : "18px",
                      overflow: "hidden",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    {photo.url ? (
                      <Box
                        component="img"
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            bgcolor: "rgba(108,92,231,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Plus size={24} color={BRAND_PRIMARY} />
                        </Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>
                          Add
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {idx === 0 && (
                    <Chip
                      label="✨ Main"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: GRADIENT_PRIMARY,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        boxShadow: "0 4px 12px rgba(108,92,231,0.4)",
                      }}
                    />
                  )}
                  {photo.url && idx !== 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Edit3 size={14} color={BRAND_PRIMARY} />
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(236,72,153,0.08) 100%)",
              border: "1px solid rgba(108,92,231,0.1)",
            }}
          >
            <Typography
              sx={{
                color: "#1a1a2e",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              💡 Tip: Profiles with 4+ photos get 3x more matches! 📸
            </Typography>
          </Box>
        </Section>

        {/* About Me Section */}
        <Section title="About Me" icon={Edit3}>
          <Box
            onClick={() => setBioDialog(true)}
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              mb: 2,
              minHeight: 80,
              "&:hover": { borderColor: BRAND_PRIMARY },
            }}
          >
            <Typography sx={{ color: bio ? "#1a1a2e" : "#94a3b8" }}>
              {bio || "Tell others what makes you unique..."}
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a1a2e" }}>
            Interests ({interests.length}/10)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {interests.map((interest, idx) => (
              <Chip
                key={idx}
                label={`${interest.emoji} ${interest.label}`}
                onDelete={() => toggleInterest(interest)}
                sx={{
                  bgcolor: "rgba(108,92,231,0.1)",
                  color: BRAND_PRIMARY,
                  fontWeight: 600,
                  borderRadius: "12px",
                  "& .MuiChip-deleteIcon": { color: BRAND_PRIMARY },
                }}
              />
            ))}
            <Chip
              label="+ Add"
              onClick={() => setInterestsDialog(true)}
              sx={{
                bgcolor: "#f1f5f9",
                color: "#64748b",
                fontWeight: 600,
                borderRadius: "12px",
                cursor: "pointer",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            />
          </Box>
        </Section>

        {/* My Details Section */}
        <Section title="My Details" icon={Info}>
          <SettingRow
            icon={Briefcase}
            label="Job Title"
            value={job || "Add job"}
            onClick={() => setDetailDialog({ open: true, type: "job" })}
          />
          <SettingRow
            icon={GraduationCap}
            label="Education"
            value={education || "Add education"}
            onClick={() => setDetailDialog({ open: true, type: "education" })}
          />
          <SettingRow
            icon={MapPin}
            label="Location"
            value={location}
            onClick={() => setDetailDialog({ open: true, type: "location" })}
          />
          <SettingRow
            icon={Ruler}
            label="Height"
            value={height ? `${height} cm` : "Add height"}
            onClick={() => setDetailDialog({ open: true, type: "height" })}
          />
          <SettingRow
            icon={Wine}
            label="Drinking"
            value={drinking}
            onClick={() => setDetailDialog({ open: true, type: "drinking" })}
          />
          <SettingRow
            icon={Cigarette}
            label="Smoking"
            value={smoking}
            onClick={() => setDetailDialog({ open: true, type: "smoking" })}
          />
          <SettingRow
            icon={Baby}
            label="Kids"
            value={kids}
            onClick={() => setDetailDialog({ open: true, type: "kids" })}
          />
          <SettingRow
            icon={Dog}
            label="Pets"
            value={pets}
            onClick={() => setDetailDialog({ open: true, type: "pets" })}
          />
        </Section>

        {/* Looking For Section */}
        <Section title="Looking For" icon={Heart}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {LOOKING_FOR_OPTIONS.map((option) => (
              <Box
                key={option.value}
                onClick={() => setLookingFor(option.value)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "12px",
                  border: lookingFor === option.value 
                    ? `2px solid ${BRAND_PRIMARY}` 
                    : "2px solid #e2e8f0",
                  bgcolor: lookingFor === option.value 
                    ? "rgba(108,92,231,0.05)" 
                    : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: BRAND_PRIMARY },
                }}
              >
                <Typography sx={{ fontSize: "1.5rem" }}>{option.icon}</Typography>
                <Typography sx={{ fontWeight: 500, color: "#1a1a2e" }}>
                  {option.label}
                </Typography>
                {lookingFor === option.value && (
                  <CheckCircle size={20} color={BRAND_PRIMARY} style={{ marginLeft: "auto" }} />
                )}
              </Box>
            ))}
          </Box>
        </Section>

        {/* Prompts Section */}
        <Section title="Prompts" icon={Sparkles} badge={prompts.length > 0 ? `${prompts.length}/3` : null}>
          <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 2 }}>
            Answer prompts to help people start conversations with you
          </Typography>
          {prompts.map((p, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: "12px",
                bgcolor: "rgba(108,92,231,0.05)",
                border: "1px solid rgba(108,92,231,0.1)",
              }}
            >
              <Typography sx={{ fontWeight: 600, color: BRAND_PRIMARY, fontSize: "0.85rem" }}>
                {p.prompt}
              </Typography>
              <Typography sx={{ color: "#1a1a2e", mt: 0.5 }}>{p.answer}</Typography>
              <Button
                size="small"
                onClick={() => setPrompts(prev => prev.filter((_, i) => i !== idx))}
                sx={{ mt: 1, color: "#ef4444", textTransform: "none" }}
              >
                Remove
              </Button>
            </Box>
          ))}
          {prompts.length < 3 && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setPromptDialog(true)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.5,
                borderStyle: "dashed",
              }}
            >
              Add a Prompt
            </Button>
          )}
        </Section>

        {/* Lifestyle Section */}
        <Section title="Lifestyle" icon={Moon} defaultOpen={false}>
          <SettingRow
            icon={Sparkles}
            label="Zodiac Sign"
            value={zodiac || "Add"}
            onClick={() => setDetailDialog({ open: true, type: "zodiac" })}
          />
          <SettingRow
            icon={Heart}
            label="Religion"
            value={religion || "Add"}
            onClick={() => setDetailDialog({ open: true, type: "religion" })}
          />
          <SettingRow
            icon={Ruler}
            label="Exercise"
            value={exercise || "Add"}
            onClick={() => setDetailDialog({ open: true, type: "exercise" })}
          />
          <SettingRow
            icon={Globe}
            label="Languages"
            value={languages.length > 0 ? languages.join(", ") : "Add"}
            onClick={() => setDetailDialog({ open: true, type: "languages" })}
          />
        </Section>

        {/* Discovery Preferences */}
        <Section title="Discovery" icon={MapPin} defaultOpen={false}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a1a2e" }}>
              Age Range: {ageRangeMin} - {ageRangeMax}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                type="number"
                size="small"
                value={ageRangeMin}
                onChange={(e) => setAgeRangeMin(Math.max(18, parseInt(e.target.value) || 18))}
                sx={{ width: 80 }}
                inputProps={{ min: 18, max: 99 }}
              />
              <Typography>to</Typography>
              <TextField
                type="number"
                size="small"
                value={ageRangeMax}
                onChange={(e) => setAgeRangeMax(Math.min(99, parseInt(e.target.value) || 99))}
                sx={{ width: 80 }}
                inputProps={{ min: 18, max: 99 }}
              />
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a1a2e" }}>
              Maximum Distance: {maxDistance} km
            </Typography>
            <TextField
              type="number"
              size="small"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Math.min(200, parseInt(e.target.value) || 50))}
              sx={{ width: 100 }}
              inputProps={{ min: 1, max: 200 }}
            />
          </Box>
          <SettingRow
            label="Show Me"
            value={showMe}
            onClick={() => setDetailDialog({ open: true, type: "showMe" })}
          />
        </Section>

        {/* Social Connections */}
        <Section title="Connected Accounts" icon={Globe} defaultOpen={false}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              borderBottom: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                📷
              </Box>
              <Typography sx={{ fontWeight: 500 }}>Instagram</Typography>
            </Box>
            <Button
              variant={instagramConnected ? "outlined" : "contained"}
              size="small"
              onClick={() => setInstagramConnected(!instagramConnected)}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: instagramConnected ? "transparent" : BRAND_PRIMARY,
              }}
            >
              {instagramConnected ? "Connected ✓" : "Connect"}
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#1DB954",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                🎵
              </Box>
              <Typography sx={{ fontWeight: 500 }}>Spotify</Typography>
            </Box>
            <Button
              variant={spotifyConnected ? "outlined" : "contained"}
              size="small"
              onClick={() => setSpotifyConnected(!spotifyConnected)}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: spotifyConnected ? "transparent" : BRAND_PRIMARY,
              }}
            >
              {spotifyConnected ? "Connected ✓" : "Connect"}
            </Button>
          </Box>
        </Section>

        {/* Verification Section */}
        <Section title="Verification" icon={Shield}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: "12px",
              bgcolor: verified ? "rgba(34,197,94,0.08)" : "#f8fafc",
              border: verified ? "1px solid rgba(34,197,94,0.2)" : "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {verified ? (
                <ShieldCheck size={24} color="#22c55e" />
              ) : (
                <Shield size={24} color="#94a3b8" />
              )}
              <Box>
                <Typography sx={{ fontWeight: 600, color: "#1a1a2e" }}>
                  {verified ? "Verified Profile" : "Get Verified"}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {verified 
                    ? "Your profile is verified and trusted" 
                    : "Build trust with photo verification"
                  }
                </Typography>
              </Box>
            </Box>
            <Button
              variant={verified ? "outlined" : "contained"}
              onClick={() => setVerifyDialog(true)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                bgcolor: verified ? "transparent" : BRAND_PRIMARY,
                borderColor: verified ? "#22c55e" : undefined,
                color: verified ? "#22c55e" : "#fff",
                "&:hover": {
                  bgcolor: verified ? "rgba(34,197,94,0.08)" : "#5b4cdb",
                },
              }}
            >
              {verified ? "Verified ✓" : "Verify Now"}
            </Button>
          </Box>
        </Section>

        {/* Privacy Settings */}
        <Section title="Privacy" icon={Lock} defaultOpen={false}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Eye size={18} color="#64748b" />
              <Typography sx={{ color: "#1a1a2e" }}>Show Online Status</Typography>
            </Box>
            <Switch
              checked={showOnline}
              onChange={(e) => setShowOnline(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND_PRIMARY },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND_PRIMARY },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MapPin size={18} color="#64748b" />
              <Typography sx={{ color: "#1a1a2e" }}>Show Distance</Typography>
            </Box>
            <Switch
              checked={distanceVisible}
              onChange={(e) => setDistanceVisible(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND_PRIMARY },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND_PRIMARY },
              }}
            />
          </Box>
        </Section>

        {/* Account Settings */}
        <Section title="Account" icon={Settings} defaultOpen={false}>
          <SettingRow
            icon={Bell}
            label="Notifications"
            onClick={() => navigate("/notifications-settings")}
          />
          <SettingRow
            icon={Globe}
            label="Language"
            value="English"
            onClick={() => navigate("/language")}
          />
          <SettingRow
            icon={Palette}
            label="Accessibility"
            onClick={() => navigate("/accessibility")}
          />
          <SettingRow
            icon={HelpCircle}
            label="Help & Support"
            onClick={() => navigate("/help")}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogOut size={18} />}
              onClick={() => navigate("/logout")}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                py: 1.5,
              }}
            >
              Log Out
            </Button>
          </Box>
        </Section>
      </Box>

      {/* ==================== Dialogs ==================== */}
      
      {/* Photo Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {photos[selectedPhotoIdx]?.url ? "Edit Photo" : "Add Photo"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Image size={20} />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ py: 1.5, borderRadius: "12px", textTransform: "none" }}
            >
              Choose from Gallery
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Camera size={20} />}
              onClick={() => {
                fileInputRef.current?.setAttribute("capture", "environment");
                fileInputRef.current?.click();
              }}
              sx={{ py: 1.5, borderRadius: "12px", textTransform: "none" }}
            >
              Take Photo
            </Button>
            {photos[selectedPhotoIdx]?.url && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={20} />}
                onClick={handleRemovePhoto}
                sx={{ py: 1.5, borderRadius: "12px", textTransform: "none" }}
              >
                Remove Photo
              </Button>
            )}
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>Cancel</Button>
        </DialogActions>
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
            placeholder="Tell others what makes you unique..."
            sx={{ mt: 1 }}
          />
          <Typography sx={{ mt: 1, color: "#64748b", fontSize: "0.85rem" }}>
            {bio.length}/500 characters
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBioDialog(false)}>Cancel</Button>
          <Button onClick={() => setBioDialog(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Interests Dialog */}
      <Dialog open={interestsDialog} onClose={() => setInterestsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Select Interests ({interests.length}/10)</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {INTERESTS_LIST.map((interest) => {
              const selected = interests.some(i => i.label === interest.label);
              return (
                <Chip
                  key={interest.label}
                  label={`${interest.emoji} ${interest.label}`}
                  onClick={() => toggleInterest(interest)}
                  sx={{
                    bgcolor: selected ? "rgba(108,92,231,0.15)" : "#f1f5f9",
                    color: selected ? BRAND_PRIMARY : "#64748b",
                    fontWeight: 600,
                    borderRadius: "12px",
                    border: selected ? `2px solid ${BRAND_PRIMARY}` : "2px solid transparent",
                    cursor: "pointer",
                    "&:hover": { bgcolor: selected ? "rgba(108,92,231,0.2)" : "#e2e8f0" },
                  }}
                />
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterestsDialog(false)} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false, type: null })} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, textTransform: "capitalize" }}>
          {detailDialog.type}
        </DialogTitle>
        <DialogContent>
          {detailDialog.type === "height" ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 300, overflow: "auto" }}>
              {HEIGHT_OPTIONS.map((h) => (
                <Chip
                  key={h}
                  label={`${h} cm`}
                  onClick={() => {
                    setHeight(h);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{
                    bgcolor: height === h ? BRAND_PRIMARY : "#f1f5f9",
                    color: height === h ? "#fff" : "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>
          ) : detailDialog.type === "drinking" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {DRINK_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={drinking === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setDrinking(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "smoking" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {SMOKE_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={smoking === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setSmoking(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "kids" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {KIDS_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={kids === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setKids(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "pets" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {PET_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={pets === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setPets(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "zodiac" ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {ZODIAC_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => {
                    setZodiac(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{
                    bgcolor: zodiac === opt ? BRAND_PRIMARY : "#f1f5f9",
                    color: zodiac === opt ? "#fff" : "#64748b",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>
          ) : detailDialog.type === "religion" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {RELIGION_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={religion === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setReligion(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "exercise" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {EXERCISE_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={exercise === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setExercise(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : detailDialog.type === "languages" ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = languages.includes(opt);
                return (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => {
                      if (selected) {
                        setLanguages(prev => prev.filter(l => l !== opt));
                      } else {
                        setLanguages(prev => [...prev, opt]);
                      }
                    }}
                    sx={{
                      bgcolor: selected ? BRAND_PRIMARY : "#f1f5f9",
                      color: selected ? "#fff" : "#64748b",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </Box>
          ) : detailDialog.type === "showMe" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {["Everyone", "Women", "Men"].map((opt) => (
                <Button
                  key={opt}
                  fullWidth
                  variant={showMe === opt ? "contained" : "outlined"}
                  onClick={() => {
                    setShowMe(opt);
                    setDetailDialog({ open: false, type: null });
                  }}
                  sx={{ borderRadius: "12px", textTransform: "none" }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
          ) : (
            <TextField
              fullWidth
              value={
                detailDialog.type === "job" ? job :
                detailDialog.type === "education" ? education :
                detailDialog.type === "location" ? location : ""
              }
              onChange={(e) => {
                if (detailDialog.type === "job") setJob(e.target.value);
                if (detailDialog.type === "education") setEducation(e.target.value);
                if (detailDialog.type === "location") setLocation(e.target.value);
              }}
              placeholder={`Enter your ${detailDialog.type}`}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, type: null })}>
            {["height", "drinking", "smoking", "kids", "pets", "zodiac", "religion", "exercise", "showMe"].includes(detailDialog.type) ? "Cancel" : "Save"}
          </Button>
          {detailDialog.type === "languages" && (
            <Button variant="contained" onClick={() => setDetailDialog({ open: false, type: null })}>Done</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Prompt Dialog */}
      <Dialog open={promptDialog} onClose={() => setPromptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Choose a Prompt</DialogTitle>
        <DialogContent>
          {!selectedPrompt ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {PROMPTS_LIST.filter(p => !prompts.some(pr => pr.prompt === p)).map((prompt) => (
                <Button
                  key={prompt}
                  fullWidth
                  variant="outlined"
                  onClick={() => setSelectedPrompt(prompt)}
                  sx={{ 
                    borderRadius: "12px", 
                    textTransform: "none", 
                    justifyContent: "flex-start",
                    py: 1.5,
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontWeight: 600, color: BRAND_PRIMARY, mb: 1 }}>
                {selectedPrompt}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                placeholder="Your answer..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPromptDialog(false); setSelectedPrompt(null); setPromptAnswer(""); }}>
            Cancel
          </Button>
          {selectedPrompt && (
            <Button 
              variant="contained" 
              disabled={!promptAnswer.trim()}
              onClick={() => {
                setPrompts(prev => [...prev, { prompt: selectedPrompt, answer: promptAnswer }]);
                setPromptDialog(false);
                setSelectedPrompt(null);
                setPromptAnswer("");
                setSnack({ open: true, message: "Prompt added!", severity: "success" });
              }}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onClose={() => setVerifyDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Verify Your Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Shield size={64} color={BRAND_PRIMARY} />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>
              Take a selfie to verify it's really you
            </Typography>
            <Typography sx={{ mt: 1, color: "#64748b", fontSize: "0.9rem" }}>
              We'll compare it to your photos. This helps keep our community safe.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setVerified(true);
              setVerifyDialog(false);
              setSnack({ open: true, message: "Profile verified!", severity: "success" });
            }}
            sx={{ borderRadius: "12px", py: 1.5 }}
          >
            Start Verification
          </Button>
          <Button
            fullWidth
            onClick={() => setVerifyDialog(false)}
            sx={{ borderRadius: "12px" }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ borderRadius: "12px" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
