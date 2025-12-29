import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Ruler, MapPin, Wine, Cigarette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const EDUCATION_OPTIONS = [
  'High School',
  'Some College',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
  'Trade School',
  'Other',
];

const DRINKING_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
];

const SMOKING_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'regularly', label: 'Regularly' },
];

const ProfileDetailsScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [height, setHeight] = useState(user?.height || 170);

  useEffect(() => {
    updateOnboardingStep('details');
  }, [updateOnboardingStep]);
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [company, setCompany] = useState(user?.company || '');
  const [education, setEducation] = useState(user?.education || '');
  const [school, setSchool] = useState(user?.school || '');
  const [location, setLocation] = useState(user?.location || '');
  const [drinking, setDrinking] = useState(user?.drinking || '');
  const [smoking, setSmoking] = useState(user?.smoking || '');

  const formatHeight = (cm) => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) % 12);
    return `${cm} cm (${feet}'${inches}")`;
  };

  const handleContinue = () => {
    const data = {
      height,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      education,
      school: school.trim(),
      location: location.trim(),
      drinking,
      smoking,
    };
    saveOnboardingData(data);
    updateUser(data);
    updateOnboardingStep('prompts');
    navigate('/auth/prompts');
  };

  const handleSkip = () => {
    updateOnboardingStep('prompts');
    navigate('/auth/prompts');
  };

  const handleBack = () => {
    navigate('/auth/looking-for');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with Progress */}
      <OnboardingHeader
        currentStep="details"
        onBack={handleBack}
        onSkip={handleSkip}
        showSkip={true}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 3,
          pb: 2,
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              backgroundColor: 'rgba(59,130,246,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <User size={28} color="#3b82f6" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            More about you
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            These details help others get to know you better (all optional)
          </Typography>

          {/* Height */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Ruler size={16} />
              Height
            </Typography>
            <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600, mb: 1 }}>
              {formatHeight(height)}
            </Typography>
            <Slider
              value={height}
              onChange={(e, value) => setHeight(value)}
              min={140}
              max={220}
              sx={{
                color: '#6C5CE7',
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                },
              }}
            />
          </Box>

          {/* Job Title */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Briefcase size={16} />
              Work
            </Typography>
            <TextField
              fullWidth
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Job title"
              size="small"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
            <TextField
              fullWidth
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Education */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <GraduationCap size={16} />
              Education
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <Select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select education level</em>
                </MenuItem>
                {EDUCATION_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="School/University"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Location */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <MapPin size={16} />
              Location
            </Typography>
            <TextField
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />
          </Box>

          {/* Lifestyle */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 2,
              }}
            >
              Lifestyle
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Drinking */}
              <FormControl fullWidth size="small">
                <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Wine size={14} /> Drinking
                </InputLabel>
                <Select
                  value={drinking}
                  onChange={(e) => setDrinking(e.target.value)}
                  label="Drinking"
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {DRINKING_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Smoking */}
              <FormControl fullWidth size="small">
                <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Cigarette size={14} /> Smoking
                </InputLabel>
                <Select
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value)}
                  label="Smoking"
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {SMOKING_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ pb: 2, pt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
            sx={{
              py: 1.75,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
              },
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileDetailsScreen;
