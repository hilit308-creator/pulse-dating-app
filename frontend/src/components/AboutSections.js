import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, Button, MenuItem, Stack, Slider } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import WcIcon from '@mui/icons-material/Wc';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import HeightIcon from '@mui/icons-material/Height';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import SearchIcon from '@mui/icons-material/Search';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useAuth } from '../context/AuthContext';

const genderOptions = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

const initialAboutYouFields = [
  { icon: <WcIcon />, label: 'Gender', value: 'Man', key: 'gender', type: 'select', options: genderOptions },
  { icon: <HeightIcon />, label: 'Height', value: '170', key: 'height', type: 'height' },
  { icon: <LocationOnIcon />, label: 'Location', value: "Tel Aviv", key: 'location', type: 'text', required: true },
  { icon: <HomeIcon />, label: 'Hometown', value: '', key: 'hometown', type: 'text' },
  { icon: <WorkIcon />, label: 'Work', value: '', key: 'work', type: 'text' },
  { icon: <SchoolIcon />, label: 'Education', value: '', key: 'education', type: 'text' },
];

const exerciseOptions = ['Active', 'Sometimes', 'Rarely', 'Never'];
const educationLevelOptions = ['In college', 'Graduate', 'High school', 'Other'];
const drinkingOptions = ['Never', 'Rarely', 'Socially', 'Regularly'];
const smokingOptions = ['Never', 'Sometimes', 'Regularly'];
const lookingForOptions = ['Fun', 'Casual dates', 'A long-term relationship', 'Friendship', 'Marriage'];
const kidsOptions = ['Not sure', 'Want someday', 'Don’t want', 'Have kids'];

// Map registration values to display values
const drinkingDisplayMap = {
  'never': 'Never',
  'rarely': 'Rarely', 
  'socially': 'Socially',
  'regularly': 'Regularly',
};
const smokingDisplayMap = {
  'never': 'Never',
  'sometimes': 'Sometimes',
  'regularly': 'Regularly',
};

const initialMoreAboutFields = [
  { icon: <DirectionsRunIcon />, label: 'Exercise', value: 'Active', key: 'exercise', type: 'select', options: exerciseOptions },
  { icon: <LocalBarIcon />, label: 'Drinking', value: 'I drink sometimes', key: 'drinking', type: 'select', options: drinkingOptions },
  { icon: <SmokingRoomsIcon />, label: 'Smoking', value: "I'm trying to quit", key: 'smoking', type: 'select', options: smokingOptions },
  { icon: <ChildCareIcon />, label: 'Kids', value: 'Not sure', key: 'kids', type: 'select', options: kidsOptions },
];

export default function AboutSections() {
  const { user } = useAuth();
  
  // Build fields from user data
  const buildFieldsFromUser = () => [
    { icon: <WcIcon />, label: 'Gender', value: user?.gender || '', key: 'gender', type: 'select', options: genderOptions },
    { icon: <HeightIcon />, label: 'Height', value: user?.height ? String(user.height) : '', key: 'height', type: 'height' },
    { icon: <LocationOnIcon />, label: 'Location', value: user?.location || user?.city || '', key: 'location', type: 'text', required: true },
    { icon: <HomeIcon />, label: 'Hometown', value: user?.hometown || '', key: 'hometown', type: 'text' },
    { icon: <WorkIcon />, label: 'Work', value: user?.jobTitle || user?.company ? `${user?.jobTitle || ''}${user?.jobTitle && user?.company ? ' at ' : ''}${user?.company || ''}` : '', key: 'work', type: 'text' },
    { icon: <SchoolIcon />, label: 'Education', value: user?.education || user?.school ? `${user?.education || ''}${user?.education && user?.school ? ' - ' : ''}${user?.school || ''}` : '', key: 'education', type: 'text' },
  ];

  const buildMoreFieldsFromUser = () => [
    { icon: <DirectionsRunIcon />, label: 'Exercise', value: user?.exercise || '', key: 'exercise', type: 'select', options: exerciseOptions },
    { icon: <LocalBarIcon />, label: 'Drinking', value: user?.drinking || '', key: 'drinking', type: 'select', options: drinkingOptions },
    { icon: <SmokingRoomsIcon />, label: 'Smoking', value: user?.smoking || '', key: 'smoking', type: 'select', options: smokingOptions },
    { icon: <ChildCareIcon />, label: 'Kids', value: user?.kids || '', key: 'kids', type: 'select', options: kidsOptions },
  ];

  // About You state - initialize from user data
  const [fields, setFields] = useState(buildFieldsFromUser);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  // More About You state
  const [moreFields, setMoreFields] = useState(buildMoreFieldsFromUser);
  const [editingMoreKey, setEditingMoreKey] = useState(null);
  const [editMoreValue, setEditMoreValue] = useState("");

  // Update fields when user data changes
  useEffect(() => {
    if (user) {
      setFields(buildFieldsFromUser());
      setMoreFields(buildMoreFieldsFromUser());
    }
  }, [user]);

  // About You handlers
  const handleEdit = (key) => {
    const field = fields.find(f => f.key === key);
    setEditingKey(key);
    setEditValue(field.value || "");
  };

  // More About You handlers
  const handleEditMore = (key) => {
    const field = moreFields.find(f => f.key === key);
    setEditingMoreKey(key);
    setEditMoreValue(field.value || "");
  };

  // Color palette for My Details - 4 colors: green, orange, pink, gray
  const detailColors = {
    gender: '#10b981',    // green
    height: '#f59e0b',    // orange
    location: '#ec4899',  // pink
    hometown: '#64748b',  // gray
    work: '#10b981',      // green
    education: '#f59e0b', // orange
  };

  return (
    <Box>
      {/* My Details Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        mb: 2, 
        mt: 2 
      }}>
        <Box sx={{ 
          width: 36, 
          height: 36, 
          borderRadius: '10px', 
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
        }}>
          <WcIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>My Details</Typography>
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 1.5, 
        mb: 3 
      }}>
        {fields.map((field) => {
          const color = detailColors[field.key] || '#6C5CE7';
          const isEditing = editingKey === field.key;
          
          return (
            <Box
              key={field.key}
              onClick={() => isEditing ? setEditingKey(null) : handleEdit(field.key)}
              sx={{
                bgcolor: isEditing ? `${color}08` : '#fff',
                borderRadius: '16px',
                border: isEditing ? `2px solid ${color}` : '1px solid #e2e8f0',
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isEditing ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                },
                gridColumn: 'span 1',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '8px', 
                  bgcolor: `${color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {React.cloneElement(field.icon, { sx: { color: color, fontSize: 16 } })}
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                  {field.label}
                  {field.required && <span style={{ color: '#f43f5e', marginLeft: 2 }}>*</span>}
                </Typography>
              </Box>
              
              {isEditing ? (
                <Box sx={{ mt: 1 }}>
                  {field.type === 'text' ? (
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={e => {
                        if (editValue.trim()) {
                          setFields(fields.map(f => f.key === editingKey ? { ...f, value: editValue } : f));
                        }
                        setEditingKey(null);
                        setEditValue("");
                      }}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '10px',
                          bgcolor: '#fff',
                          '& fieldset': {
                            borderColor: '#e2e8f0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#94a3b8',
                          },
                        } 
                      }}
                    />
                  ) : field.type === 'height' ? (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                        {editValue} cm
                      </Typography>
                      <Slider
                        value={parseInt(editValue) || 170}
                        onChange={(_, v) => setEditValue(String(v))}
                        onChangeCommitted={(_, v) => {
                          setFields(fields.map(f => f.key === editingKey ? { ...f, value: String(v) } : f));
                          setEditingKey(null);
                          setEditValue("");
                        }}
                        min={140}
                        max={220}
                        sx={{
                          color: '#6C5CE7',
                          '& .MuiSlider-thumb': { 
                            width: 22, 
                            height: 22,
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                          },
                          '& .MuiSlider-track': {
                            background: 'linear-gradient(90deg, #6C5CE7 0%, #a855f7 100%)',
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                      {field.options.map(opt => (
                        <Box
                          key={opt}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFields(fields.map(f => f.key === editingKey ? { ...f, value: opt } : f));
                            setEditingKey(null);
                            setEditValue("");
                          }}
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            bgcolor: field.value === opt ? '#6C5CE7' : '#f1f5f9',
                            color: field.value === opt ? '#fff' : '#475569',
                            fontSize: 13,
                            fontWeight: 500,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: field.value === opt ? '#5b4cdb' : '#e2e8f0',
                            },
                          }}
                        >
                          {opt}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography sx={{ 
                  fontWeight: 600, 
                  fontSize: 15, 
                  color: field.value ? '#1a1a2e' : '#94a3b8',
                }}>
                  {field.key === 'height' && field.value ? `${field.value} cm` : (field.value || 'Add')}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Lifestyle Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        mb: 2,
      }}>
        <Box sx={{ 
          width: 36, 
          height: 36, 
          borderRadius: '10px', 
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
        }}>
          <DirectionsRunIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>Lifestyle</Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Things people are curious about
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        bgcolor: '#fff', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        overflow: 'visible',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        {moreFields.map((field, idx) => {
          const isEditing = editingMoreKey === field.key;
          const fieldColors = {
            exercise: '#10b981',
            drinking: '#f59e0b',
            smoking: '#64748b',
            kids: '#ec4899',
          };
          const color = fieldColors[field.key] || '#6C5CE7';
          
          return (
            <React.Fragment key={field.key}>
              <Box
                onClick={() => isEditing ? setEditingMoreKey(null) : handleEditMore(field.key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isEditing ? `${color}08` : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: `${color}08`,
                  },
                }}
              >
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '8px', 
                  bgcolor: `${color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}>
                  {React.cloneElement(field.icon, { sx: { color: color, fontSize: 18 } })}
                </Box>
                <Typography sx={{ fontWeight: 500, flex: 1, color: '#1a1a2e' }}>
                  {field.label}
                </Typography>
                <Typography sx={{ 
                  color: field.value ? '#64748b' : '#94a3b8', 
                  fontSize: 14,
                  maxWidth: 150, 
                  textAlign: 'right', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  mr: 0.5,
                }}>
                  {field.value || 'Add'}
                </Typography>
                <ChevronRightIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
              </Box>
              
              {isEditing && (
                <Box sx={{ bgcolor: `${color}08`, borderTop: `1px solid ${color}20` }}>
                  {field.options.map((opt, optIdx) => (
                    <Box
                      key={opt}
                      onClick={() => {
                        setMoreFields(moreFields.map(f => f.key === editingMoreKey ? { ...f, value: opt } : f));
                        setEditingMoreKey(null);
                        setEditMoreValue("");
                      }}
                      sx={{
                        px: 2,
                        py: 1.25,
                        cursor: 'pointer',
                        bgcolor: editMoreValue === opt || field.value === opt ? `${color}15` : 'transparent',
                        borderBottom: optIdx !== field.options.length - 1 ? `1px solid ${color}10` : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: `${color}12`,
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: 14, color: '#1a1a2e', fontWeight: field.value === opt ? 600 : 400 }}>
                        {opt}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              {idx !== moreFields.length - 1 && !isEditing && (
                <Divider sx={{ mx: 2 }} />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
