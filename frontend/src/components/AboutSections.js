import React, { useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, Button, MenuItem, Stack } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import WcIcon from '@mui/icons-material/Wc';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import HeightIcon from '@mui/icons-material/Height';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import SearchIcon from '@mui/icons-material/Search';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const genderOptions = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

const initialAboutYouFields = [
  { icon: <WorkIcon />, label: 'Work', value: '', key: 'work', type: 'text' },
  { icon: <SchoolIcon />, label: 'Education', value: '', key: 'education', type: 'text' },
  { icon: <WcIcon />, label: 'Gender', value: 'Man', key: 'gender', type: 'select', options: genderOptions },
  { icon: <LocationOnIcon />, label: 'Location', value: "Be'er Sheva", key: 'location', type: 'text' },
  { icon: <HomeIcon />, label: 'Hometown', value: 'Jerusalem', key: 'hometown', type: 'text' },
];

const exerciseOptions = ['Active', 'Sometimes', 'Rarely', 'Never'];
const educationLevelOptions = ['In college', 'Graduate', 'High school', 'Other'];
const drinkingOptions = ['I drink sometimes', 'Never', 'Socially', 'Frequently'];
const smokingOptions = ["I don't smoke", 'I smoke sometimes', "I'm trying to quit", 'Regularly'];
const lookingForOptions = ['Fun', 'Casual dates', 'A long-term relationship', 'Friendship', 'Marriage'];
const kidsOptions = ['Not sure', 'Want someday', 'Don’t want', 'Have kids'];

const initialMoreAboutFields = [
  { icon: <HeightIcon />, label: 'Height', value: '178 cm', key: 'height', type: 'text' },
  { icon: <FitnessCenterIcon />, label: 'Exercise', value: 'Active', key: 'exercise', type: 'select', options: exerciseOptions },
  { icon: <SchoolIcon />, label: 'Education level', value: 'In college', key: 'educationLevel', type: 'select', options: educationLevelOptions },
  { icon: <LocalBarIcon />, label: 'Drinking', value: 'I drink sometimes', key: 'drinking', type: 'select', options: drinkingOptions },
  { icon: <SmokingRoomsIcon />, label: 'Smoking', value: ",I'm trying to quit", key: 'smoking', type: 'select', options: smokingOptions },
  { icon: <SearchIcon />, label: 'Looking for', value: 'Fun, casual dates, A long-term relationship', key: 'lookingFor', type: 'multiselect', options: lookingForOptions },
  { icon: <ChildCareIcon />, label: 'Kids', value: 'Not sure', key: 'kids', type: 'select', options: kidsOptions },
  { icon: <SearchIcon />, label: 'Choice', value: 'Make a choice', key: 'choice', type: 'text' },
];

export default function AboutSections() {
  // About You state
  const [fields, setFields] = useState(initialAboutYouFields);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  // More About You state
  const [moreFields, setMoreFields] = useState(initialMoreAboutFields);
  const [editingMoreKey, setEditingMoreKey] = useState(null);
  const [editMoreValue, setEditMoreValue] = useState("");

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

  return (
    <Box>
      {/* About You Section */}
      <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 1, mt: 2 }}>About you</Typography>
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', mb: 3, p: 1 }}>
        <List disablePadding>
          {fields.map((field, idx) => (
            <React.Fragment key={field.key}>
              <ListItem button onClick={() => editingKey === field.key ? setEditingKey(null) : handleEdit(field.key)} alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 36 }}>{field.icon}</ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 500 }}>{field.label}</Typography>}
                  secondary={!field.value ? <Typography color="text.secondary">Add</Typography> : null}
                />
                <Typography sx={{ color: '#333', mr: 1 }}>{field.value}</Typography>
                {editingKey === field.key
                  ? <ArrowDropDownIcon sx={{ color: '#bbb' }} />
                  : <ChevronRightIcon sx={{ color: '#bbb' }} />}
              </ListItem>
              {editingKey === field.key && (
                <Box sx={{ px: 5, py: 1, bgcolor: '#fff', borderRadius: 2, mb: 1 }}>
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
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={editValue}
                      onChange={e => {
                        setEditValue(e.target.value);
                        setFields(fields.map(f => f.key === editingKey ? { ...f, value: e.target.value } : f));
                        setEditingKey(null);
                        setEditValue("");
                      }}
                      sx={{ mb: 1 }}
                    >
                      {field.options.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  )}
                </Box>
              )}
              {idx !== fields.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* More About You Section */}
      <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 1 }}>More about you</Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
        Cover the things most people are curious about.
      </Typography>
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 1 }}>
        <List disablePadding>
          {moreFields.map((field, idx) => (
            <React.Fragment key={field.key}>
              <ListItem button onClick={() => editingMoreKey === field.key ? setEditingMoreKey(null) : handleEditMore(field.key)} alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 36 }}>{field.icon}</ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 500 }}>{field.label}</Typography>}
                />
                <Typography sx={{ color: '#333', mr: 1, maxWidth: 170, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{field.value}</Typography>
                {editingMoreKey === field.key
                  ? <ArrowDropDownIcon sx={{ color: '#bbb' }} />
                  : <ChevronRightIcon sx={{ color: '#bbb' }} />}
              </ListItem>
              {editingMoreKey === field.key && (
                <Box sx={{ px: 5, py: 1, bgcolor: '#fff', borderRadius: 2, mb: 1 }}>
                  {field.type === 'text' ? (
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      value={editMoreValue}
                      onChange={e => setEditMoreValue(e.target.value)}
                      onBlur={e => {
                        if (editMoreValue.trim()) {
                          setMoreFields(moreFields.map(f => f.key === editingMoreKey ? { ...f, value: editMoreValue } : f));
                        }
                        setEditingMoreKey(null);
                        setEditMoreValue("");
                      }}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      sx={{ mb: 1 }}
                    />
                  ) : field.type === 'select' ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={editMoreValue}
                      onChange={e => {
                        setEditMoreValue(e.target.value);
                        setMoreFields(moreFields.map(f => f.key === editingMoreKey ? { ...f, value: e.target.value } : f));
                        setEditingMoreKey(null);
                        setEditMoreValue("");
                      }}
                      sx={{ mb: 1 }}
                    >
                      {field.options.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    // Multi-select for Looking For
                    <TextField
                      select
                      SelectProps={{
                        multiple: true,
                        value: editMoreValue ? editMoreValue.split(', ') : [],
                        onChange: e => {
                          const valueArr = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                          setEditMoreValue(valueArr.join(', '));
                          setMoreFields(moreFields.map(f => f.key === editingMoreKey ? { ...f, value: valueArr.join(', ') } : f));
                        },
                        onClose: () => {
                          setEditingMoreKey(null);
                          setEditMoreValue("");
                        }
                      }}
                      fullWidth
                      size="small"
                      sx={{ mb: 1 }}
                    >
                      {field.options.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  )}
                </Box>
              )}
              {idx !== moreFields.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
}
