import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft, Heart, Users, Shield, Ban, Camera, MessageCircle, Flag } from 'lucide-react';

const CommunityGuidelinesScreen = () => {
  const navigate = useNavigate();

  const guidelines = [
    {
      icon: Heart,
      title: 'Be Respectful',
      description: 'Treat everyone with kindness and respect. We\'re all here to make genuine connections.',
      dos: ['Be kind in your messages', 'Respect boundaries', 'Accept rejection gracefully'],
      donts: ['Harass or bully others', 'Send unsolicited explicit content', 'Use offensive language'],
    },
    {
      icon: Users,
      title: 'Be Authentic',
      description: 'Be yourself and represent yourself honestly. Authenticity leads to better connections.',
      dos: ['Use recent photos of yourself', 'Be honest about your intentions', 'Share genuine interests'],
      donts: ['Use fake photos', 'Impersonate others', 'Misrepresent your identity'],
    },
    {
      icon: Shield,
      title: 'Keep It Safe',
      description: 'Help us maintain a safe community for everyone.',
      dos: ['Report suspicious behavior', 'Block users who make you uncomfortable', 'Protect your personal information'],
      donts: ['Share personal contact info publicly', 'Meet in private for first dates', 'Ignore red flags'],
    },
    {
      icon: Camera,
      title: 'Appropriate Content',
      description: 'Keep your profile and messages appropriate for our community.',
      dos: ['Share clear photos of yourself', 'Keep conversations respectful', 'Express yourself positively'],
      donts: ['Post explicit content', 'Share violent imagery', 'Use hate symbols'],
    },
    {
      icon: Ban,
      title: 'No Spam or Scams',
      description: 'Don\'t use Pulse for commercial purposes or to deceive others.',
      dos: ['Be genuine in your conversations', 'Report suspicious accounts', 'Focus on making connections'],
      donts: ['Promote products or services', 'Ask for money', 'Send spam messages'],
    },
    {
      icon: MessageCircle,
      title: 'Meaningful Conversations',
      description: 'Engage in conversations that lead to genuine connections.',
      dos: ['Ask thoughtful questions', 'Respond in a timely manner', 'Be open to different perspectives'],
      donts: ['Ghost without explanation', 'Send copy-paste messages', 'Be dismissive or rude'],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 10,
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Community Guidelines
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 3 }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'rgba(108,92,231,0.05)', 
          borderRadius: '16px',
          border: '1px solid rgba(108,92,231,0.1)',
          mb: 3,
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
            Building a positive community
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            These guidelines help keep Pulse a welcoming place for everyone. Violations may result in account suspension or removal.
          </Typography>
        </Box>

        {guidelines.map((guideline, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              p: 2.5,
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(108,92,231,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <guideline.icon size={18} color="#6C5CE7" />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {guideline.title}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              {guideline.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Do
                </Typography>
                {guideline.dos.map((item, i) => (
                  <Typography key={i} variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.25 }}>
                    • {item}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Don't
                </Typography>
                {guideline.donts.map((item, i) => (
                  <Typography key={i} variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.25 }}>
                    • {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        ))}

        {/* Report Section */}
        <Box sx={{ 
          mt: 3, 
          p: 3, 
          backgroundColor: '#f8fafc', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Flag size={24} color="#6C5CE7" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
              See something wrong?
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Report violations by going to the user's profile and tapping "Report".
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommunityGuidelinesScreen;
