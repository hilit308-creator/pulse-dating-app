import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEmotions,
  Person,
  TheaterComedy,
  MusicNote,
  Chat,
  PhotoCamera,
  Psychology,
  Speed,
  Favorite,
  Edit,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const HOBBY_OPTIONS = [
  'Reading', 'Writing', 'Gaming', 'Cooking', 'Traveling',
  'Photography', 'Music', 'Dancing', 'Hiking', 'Swimming',
  'Yoga', 'Meditation', 'Painting', 'Drawing', 'Sculpting',
  'Gardening', 'Sports', 'Movies', 'Theater', 'Fashion',
  'Technology', 'Science', 'History', 'Languages', 'Politics',
  'Philosophy', 'Astronomy', 'Animals', 'Volunteering', 'Fitness'
];

const APPROACH_OPTIONS = [
  { emoji: '😊', label: 'With a smile and a "How are you?"', value: 'friendly_greeting' },
  { emoji: '🙋', label: 'With a simple and respectful message', value: 'respectful_message' },
  { emoji: '🎭', label: 'With a creative or funny opening', value: 'creative_opening' },
  { emoji: '🎶', label: 'Through a song or a quote', value: 'song_quote' },
  { emoji: '💬', label: 'With a question about my interests', value: 'interest_question' },
  { emoji: '📸', label: 'Referring to my profile/photo', value: 'profile_reference' },
  { emoji: '🧠', label: 'With a deep conversation starter', value: 'deep_conversation' },
  { emoji: '🚀', label: 'No small talk – straight to the point', value: 'direct_approach' },
  { emoji: '🕊️', label: 'Gently and without pressure', value: 'gentle_approach' },
  { emoji: '✏️', label: 'Custom approach', value: 'custom' }
];

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({

    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    residence: '',
    place_of_origin: '',
    looking_for: '',
    relationship_type: '',
    hobbies: [],
    interests: [],
    favorite_songs: [],
    approach_preferences: [],
    custom_approach: ''
  });

  const [currentHobby, setCurrentHobby] = useState('');
  const [photos, setPhotos] = useState([]);

  // Handle photo selection from gallery
  const handleGalleryPhoto = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  // Handle photo taken from camera
  const handleCameraPhoto = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  // Remove photo
  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const [currentInterest, setCurrentInterest] = useState('');
  const [currentSong, setCurrentSong] = useState('');
  const [showCustomApproach, setShowCustomApproach] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data:', formData);
      
      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'password', 'gender'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Prepare the data in the format expected by the backend
      const submissionData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        place_of_origin: formData.place_of_origin,
        hobbies: formData.hobbies.join(','),
        interests: formData.interests.join(','),
        favorite_songs: formData.favorite_songs.join(','),
        approach_preferences: formData.approach_preferences.join(',')
      };

      console.log('Submitting data:', submissionData);
      
      const response = await axios.post(`${API_URL}/api/register`, submissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Response:', response);
      
      if (response.status === 201) {
        alert('Registration successful!');
        navigate('/registration-success');
      } else {
        const errorMessage = response.data.error || 'Unknown error occurred';
        console.error('Server error:', errorMessage);
        alert(`Registration failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Network error occurred';
      console.error('Detailed error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      alert(`Registration failed: ${errorMessage}`);
    }
  };

  const addItem = (item, type) => {
    if (item.trim() !== '' && !formData[type].includes(item.trim())) {
      setFormData({
        ...formData,
        [type]: [...formData[type], item.trim()],
      });
      switch (type) {
        case 'hobbies':
          setCurrentHobby('');
          break;
        case 'interests':
          setCurrentInterest('');
          break;
        case 'favorite_songs':
          setCurrentSong('');
          break;
        default:
          break;
      }
    }
  };

  const removeItem = (item, type) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((i) => i !== item),
    });
  };

  const handleApproachChange = (value) => {
    if (value === 'custom') {
      setShowCustomApproach(true);
    } else {
      const isSelected = formData.approach_preferences.includes(value);
      setFormData({
        ...formData,
        approach_preferences: isSelected
          ? formData.approach_preferences.filter((v) => v !== value)
          : [...formData.approach_preferences, value]
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        fullWidth
        label="First Name"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Last Name"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Phone Number"
        name="phone_number"
        value={formData.phone_number}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Place of Residence"
        name="residence"
        value={formData.residence}
        onChange={handleChange}
        margin="normal"
        required
      />
      <FormControl fullWidth margin="normal" required>
        <FormLabel>Gender</FormLabel>
        <RadioGroup
          row
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
      </FormControl>

          <TextField
            fullWidth
            label="Place of Origin"
            name="place_of_origin"
            value={formData.place_of_origin}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Looking For</InputLabel>
            <Select
              name="looking_for"
              value={formData.looking_for}
              onChange={handleChange}
              required
            >
              <MenuItem value="men">Men</MenuItem>
              <MenuItem value="women">Women</MenuItem>
              <MenuItem value="both">Both</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Relationship Type</InputLabel>
            <Select
              name="relationship_type"
              value={formData.relationship_type}
              onChange={handleChange}
              required
            >
              <MenuItem value="short-term">Short-term</MenuItem>
              <MenuItem value="long-term">Long-term</MenuItem>
              <MenuItem value="marriage">Marriage</MenuItem>
              <MenuItem value="not-sure">Not Sure</MenuItem>
            </Select>
          </FormControl>

          {/* Hobbies Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Hobbies</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Select Hobby</InputLabel>
                <Select
                  value={currentHobby}
                  onChange={(e) => setCurrentHobby(e.target.value)}
                >
                  {HOBBY_OPTIONS.map((hobby) => (
                    <MenuItem key={hobby} value={hobby}>{hobby}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                onClick={() => addItem(currentHobby, 'hobbies')}
                variant="contained"
              >
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.hobbies.map((hobby, index) => (
                <Chip
                  key={index}
                  label={hobby}
                  onDelete={() => removeItem(hobby, 'hobbies')}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Box>

          {/* Interests Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Interests</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                placeholder="Add an interest"
              />
              <Button
                onClick={() => addItem(currentInterest, 'interests')}
                variant="contained"
              >
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => removeItem(interest, 'interests')}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Box>

          {/* Favorite Songs Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Favorite Songs</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={currentSong}
                onChange={(e) => setCurrentSong(e.target.value)}
                placeholder="Add a song"
              />
              <Button
                onClick={() => addItem(currentSong, 'favorite_songs')}
                variant="contained"
              >
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.favorite_songs.map((song, index) => (
                <Chip
                  key={index}
                  label={song}
                  onDelete={() => removeItem(song, 'favorite_songs')}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Box>

          {/* Approach Preferences Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              How would you like to be approached?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {APPROACH_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={`${option.emoji} ${option.label}`}
                  onClick={() => handleApproachChange(option.value)}
                  color={formData.approach_preferences.includes(option.value) ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            {showCustomApproach && (
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Your custom approach preference"
                name="custom_approach"
                value={formData.custom_approach}
                onChange={handleChange}
                margin="normal"
              />
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </Box>
      </Container>
    );
};
export default Registration;
