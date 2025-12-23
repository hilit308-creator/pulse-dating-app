import React, { useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AboutSections from "../components/AboutSections";
import ProfileExtras from "../components/ProfileExtras";

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

const mockPrompts = [
  "The key to my heart is…",
  "My ideal weekend is…",
  "A fun fact about me…",
  "Friends describe me as…",
];

const MAX_PHOTOS = 6;
const MAX_INTERESTS = 10;
const MAX_CAUSES = 3;
const MAX_QUALITIES = 3;

export default function ProfileSettings({ onBack }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [appSettings] = useState(loadAppSettings());
  const { brand } = appSettings;

  const bg1 = alpha(brand.primary, 0.12);
  const bg2 = alpha(brand.accent || brand.primary, 0.1);

  // --- Profile state ---
  const [photos, setPhotos] = useState(mockPhotos);
  const [bio, setBio] = useState("");
  const [bestPhoto, setBestPhoto] = useState(true);
  const [verified, setVerified] = useState(false);
  const [interests, setInterests] = useState(mockInterests);
  const [interestInput, setInterestInput] = useState("");

  // --- Dialogs / selections ---
  const [showChecklist, setShowChecklist] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const [selectedCauses, setSelectedCauses] = useState([]);
  const [causesDialog, setCausesDialog] = useState(false);

  const [selectedQualities, setSelectedQualities] = useState([
    "Humor",
    "Kindness",
    "Openness",
  ]);
  const [qualitiesDialog, setQualitiesDialog] = useState(false);

  const [selectedPrompts, setSelectedPrompts] = useState([]); // {prompt, answer}
  const [promptDialog, setPromptDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptAnswer, setPromptAnswer] = useState("");

  // --- Photo file input ---
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoSlotIdx, setPhotoSlotIdx] = useState(null);
  const fileInputRef = useRef(null);

  // --- Snackbar ---
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    sev: "success",
  });

  // --- Profile completion ---
  const checklist = useMemo(
    () => [
      { label: "Profile photo", completed: photos.some((p) => p.url) },
      { label: "Bio", completed: bio.trim().length > 0 },
      { label: "Interests", completed: interests.length > 0 },
      { label: "Verification", completed: verified },
    ],
    [photos, bio, interests, verified]
  );

  const completedCount = checklist.filter((i) => i.completed).length;
  const completion = Math.round((completedCount / checklist.length) * 100);
  const getBarColor = () =>
    completion < 40 ? "error" : completion < 80 ? "warning" : "success";

  // --- Dirty flag (for sticky save bar) ---
  const dirty = useMemo(() => {
    return (
      bio.length > 0 ||
      interests.length !== mockInterests.length ||
      photos.some((p, i) => p.url !== (mockPhotos[i]?.url || "")) ||
      verified !== false ||
      selectedCauses.length > 0 ||
      selectedQualities.join(",") !== ["Humor", "Kindness", "Openness"].join(",") ||
      selectedPrompts.length > 0 ||
      bestPhoto !== true
    );
  }, [
    bio,
    interests,
    photos,
    verified,
    selectedCauses,
    selectedQualities,
    selectedPrompts,
    bestPhoto,
  ]);

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

  const handlePickCamera = () => {
    setPhotoModalOpen(false);
    setTimeout(() => triggerFileInput({ capture: "environment" }), 100);
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
      setPhotos((prev) =>
        prev.map((p, i) => (i === photoSlotIdx ? { ...p, url: reader.result } : p))
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePhotoRemove = (idx) => {
    setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, url: "" } : p)));
  };

  const handlePhotoReorder = () => {
    alert(
      "Drag & drop to reorder photos — you can implement this with dnd-kit/Sortable."
    );
  };

  // --- Interests ---
  const handleAddInterest = () => {
    const val = interestInput.trim();
    if (!val) return;
    if (interests.length >= MAX_INTERESTS) return;
    if (interests.some((i) => i.label.toLowerCase() === val.toLowerCase())) return;
    setInterests([...interests, { emoji: "⭐", label: val }]);
    setInterestInput("");
  };

  const handleRemoveInterest = (idx) => {
    setInterests(interests.filter((_, i) => i !== idx));
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
  };

  // --- Prompts ---
  const handleAddPrompt = () => {
    if (selectedPrompt && promptAnswer.trim()) {
      setSelectedPrompts((prev) => [
        ...prev,
        { prompt: selectedPrompt, answer: promptAnswer.trim() },
      ]);
      setSelectedPrompt(null);
      setPromptAnswer("");
      setPromptDialog(false);
    }
  };

  // --- Save (demo) ---
  const handleSave = async () => {
    try {
      await new Promise((r) => setTimeout(r, 500));
      setSnack({ open: true, msg: "Profile saved successfully", sev: "success" });
    } catch (e) {
      setSnack({ open: true, msg: "Save failed, please try again", sev: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        pb: `calc(${SAFE_BOTTOM} + 40px)`,
        background: `radial-gradient(1200px 600px at 50% -220px, #eef2f9 0%, transparent 60%), radial-gradient(900px 520px at 12% 120%, #edf7f3 0%, transparent 60%), linear-gradient(90deg, #fafbff 0%, #f7f8fc 70%, #eff2f9 100%)`,
      }}
    >
      {/* Main rounded card container */}
      <Box
        sx={{
          maxWidth: 520,
          mx: "auto",
          mt: 2,
          mb: 4,
          borderRadius: 4,
          boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid rgba(226,232,240,0.9)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
          }}
        >
          <IconButton
            edge={theme.direction === "rtl" ? "end" : "start"}
            onClick={handleBack}
            sx={{
              mr: 1,
              borderRadius: 999,
              bgcolor: alpha(brand.primary, 0.06),
              "&:hover": { bgcolor: alpha(brand.primary, 0.12) },
            }}
          >
            <ArrowLeft />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flex: 1, textAlign: "center", fontWeight: 800, letterSpacing: 0.2, color: "#0f172a" }}
          >
            Profile Settings
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Completion indicator */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
              Profile strength
            </Typography>
            <Tooltip title="See what’s missing">
              <Button
                size="small"
                onClick={() => setShowChecklist(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 999,
                  px: 1.4,
                  py: 0.3,
                  bgcolor: alpha(brand.primary, 0.06),
                  color: brand.primary,
                  border: `1px solid ${alpha(brand.primary, 0.16)}`,
                }}
              >
                {completion}% complete
              </Button>
            </Tooltip>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completion}
            color={getBarColor()}
            sx={{
              height: 9,
              borderRadius: 999,
              boxShadow: "0 2px 10px rgba(15,23,42,0.15)",
              backgroundColor: "#e5e7eb",
            }}
          />
        </Box>

        <Dialog open={showChecklist} onClose={() => setShowChecklist(false)}>
          <DialogTitle>What’s missing?</DialogTitle>
          <DialogContent>
            <ul style={{ paddingInlineStart: 18, margin: 0 }}>
              {checklist.map((item) => (
                <li
                  key={item.label}
                  style={{
                    color: item.completed ? "green" : "#f97316",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                >
                  {item.completed ? "✔️" : "❌"} {item.label}
                </li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChecklist(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Photos & videos */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
            Photos & videos
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 1.25 }}>
            Choose media that feels like the real you.
          </Typography>

          <Grid container spacing={2}>
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
          <Dialog open={photoModalOpen} onClose={() => setPhotoModalOpen(false)}>
            <DialogTitle>Select photo source</DialogTitle>
            <DialogContent>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2, textTransform: "none" }}
                onClick={handlePickGallery}
                startIcon={<Image />}
              >
                From gallery
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2, textTransform: "none" }}
                onClick={handlePickInstagram}
                startIcon={<Star />}
              >
                Import from Instagram
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ textTransform: "none" }}
                onClick={handlePickCamera}
                startIcon={<Camera />}
              >
                Camera
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPhotoModalOpen(false)}>Cancel</Button>
            </DialogActions>
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

        <Dialog open={showVerify} onClose={() => setShowVerify(false)}>
          <DialogTitle>Profile verification</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              A selfie / video verification flow will live here. For now this is a demo.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVerify(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setVerified(true);
                setShowVerify(false);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bio & interests */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>Bio</Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Write a few lines about yourself…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            sx={{ width: "100%", mb: 2 }}
            multiline
            minRows={2}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>Interests</Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 1.25 }}>
            Be specific: what do you truly enjoy?
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add an interest"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              color="primary"
              onClick={handleAddInterest}
              disabled={!interestInput.trim() || interests.length >= MAX_INTERESTS}
              aria-label="Add interest"
            >
              <Plus />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {interests.map((interest, idx) => (
              <Chip
                key={`${interest.label}-${idx}`}
                label={
                  <span>
                    {interest.emoji} {interest.label}
                  </span>
                }
                onDelete={() => handleRemoveInterest(idx)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 13,
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  mb: 1,
                }}
              />
            ))}
          </Stack>
          <Typography variant="caption" sx={{ color: "#9ca3af", mt: 1, display: "block" }}>
            Up to {MAX_INTERESTS} tags
          </Typography>
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
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {selectedCauses.map((cause) => (
                <Chip
                  key={cause}
                  label={cause}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#fff",
                    border: `1px solid ${alpha(brand.primary, 0.22)}`,
                    fontWeight: 500,
                    fontSize: 13,
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
                bgcolor: "#fff",
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
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {selectedQualities.map((q) => (
                <Chip
                  key={q}
                  label={q}
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#fff",
                    fontWeight: 500,
                    fontSize: 13,
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
                bgcolor: "#fff",
                pr: 1,
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
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
              Help people get a feel for your vibe.
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {selectedPrompts.map((p, i) => (
                <Box
                  key={`${p.prompt}-${i}`}
                  sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: 2,
                    p: 1.2,
                    fontWeight: 500,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
              sx={{
                justifyContent: "flex-start",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#fff",
              }}
              startIcon={<Plus />}
            >
              Add prompt
            </Button>
          </Box>
        </Box>

        {/* Dialogs for causes / qualities / prompts */}
        <Dialog open={causesDialog} onClose={() => setCausesDialog(false)}>
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

        <Dialog open={qualitiesDialog} onClose={() => setQualitiesDialog(false)}>
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

        <Dialog open={promptDialog} onClose={() => setPromptDialog(false)}>
          <DialogTitle>Choose a prompt</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {mockPrompts.map((p) => (
                <Button
                  key={p}
                  variant={selectedPrompt === p ? "contained" : "outlined"}
                  onClick={() => setSelectedPrompt(p)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  {p}
                </Button>
              ))}
              {selectedPrompt && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Your answer:
                  </Typography>
                  <TextField
                    fullWidth
                    value={promptAnswer}
                    onChange={(e) => setPromptAnswer(e.target.value)}
                    placeholder="Type your answer…"
                  />
                  <Button
                    sx={{ mt: 1 }}
                    variant="contained"
                    onClick={handleAddPrompt}
                    disabled={!promptAnswer.trim()}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPromptDialog(false)}>Done</Button>
          </DialogActions>
        </Dialog>

        {/* Additional sections from your app */}
        <AboutSections />
        <ProfileExtras />
      </Box>

      {/* Sticky save bar */}
      {dirty && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            pb: "env(safe-area-inset-bottom, 0px)",
            display: "flex",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <Box
            sx={{
              maxWidth: 520,
              width: "100%",
              mx: 2,
              mb: 1.5,
              bgcolor: "#fff",
              borderRadius: 999,
              boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              p: 1,
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "#475569",
                borderColor: "#e2e8f0",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  bgcolor: "#f8fafc",
                },
              }}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#6C5CE7",
                boxShadow: "0 4px 14px rgba(108,92,231,0.25)",
                "&:hover": {
                  bgcolor: "#5b4ec6",
                  boxShadow: "0 6px 20px rgba(108,92,231,0.35)",
                },
              }}
            >
              Save changes
            </Button>
          </Box>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
