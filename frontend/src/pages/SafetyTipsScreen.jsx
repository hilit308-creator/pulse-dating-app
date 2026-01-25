import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft, Shield, MapPin, Phone, Users, Eye, AlertTriangle, MessageCircle, Heart } from 'lucide-react';

const SafetyTipsScreen = () => {
  const navigate = useNavigate();

  const tips = [
    {
      icon: MessageCircle,
      title: 'Chat First',
      description: 'Get to know someone through messages before meeting in person. Trust your instincts if something feels off.',
    },
    {
      icon: Eye,
      title: 'Protect Your Information',
      description: 'Never share personal information like your home address, workplace, or financial details with someone you haven\'t met.',
    },
    {
      icon: MapPin,
      title: 'Meet in Public',
      description: 'Always meet in a public place for the first few dates. Choose busy locations like cafes, restaurants, or parks.',
    },
    {
      icon: Phone,
      title: 'Tell Someone',
      description: 'Let a friend or family member know where you\'re going, who you\'re meeting, and when you expect to be back.',
    },
    {
      icon: Users,
      title: 'Stay Sober',
      description: 'Stay aware of your surroundings. Don\'t leave your drink unattended and moderate your alcohol consumption.',
    },
    {
      icon: Shield,
      title: 'Arrange Your Own Transport',
      description: 'Drive yourself, use rideshare, or take public transport. Don\'t accept rides from someone you\'ve just met.',
    },
    {
      icon: Heart,
      title: 'Trust Your Instincts',
      description: 'If something doesn\'t feel right, it probably isn\'t. You can always leave or end the date early.',
    },
    {
      icon: AlertTriangle,
      title: 'Report Suspicious Behavior',
      description: 'If someone makes you uncomfortable, threatens you, or behaves inappropriately, report them immediately.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff', position: 'relative' }}>
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
          Safety Tips
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
            Your safety is our priority
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Dating should be fun and exciting. Follow these tips to stay safe while meeting new people.
          </Typography>
        </Box>

        {tips.map((tip, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              p: 2,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              mb: 1.5,
            }}
          >
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: 'rgba(108,92,231,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <tip.icon size={20} color="#6C5CE7" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
                {tip.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.5 }}>
                {tip.description}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Emergency */}
        <Box sx={{ 
          mt: 3, 
          p: 3, 
          backgroundColor: 'rgba(239,68,68,0.05)', 
          borderRadius: '16px',
          border: '1px solid rgba(239,68,68,0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ef4444', mb: 1 }}>
            In an emergency
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            If you're in immediate danger, contact your local emergency services. Your safety always comes first.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SafetyTipsScreen;
