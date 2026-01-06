import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ArrowLeft, ChevronDown, MessageCircle, Heart, Shield, Settings, CreditCard, User } from 'lucide-react';

const HelpCenterScreen = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      icon: User,
      title: 'Account & Profile',
      items: [
        { q: 'How do I edit my profile?', a: 'Go to your profile and tap the edit button to update your photos, bio, and preferences.' },
        { q: 'How do I change my phone number?', a: 'Go to Settings > Account > Phone number to update your phone number.' },
        { q: 'How do I delete my account?', a: 'Go to Settings > scroll to the bottom > Delete account. This action is permanent.' },
      ]
    },
    {
      icon: Heart,
      title: 'Matching & Connections',
      items: [
        { q: 'How does matching work?', a: 'When you and another person both like each other, you become a match and can start chatting.' },
        { q: 'Why am I not getting matches?', a: 'Try updating your photos, expanding your preferences, or being more active on the app.' },
        { q: 'Can I unmatch someone?', a: 'Yes, go to the chat with that person, tap the menu icon, and select Unmatch.' },
      ]
    },
    {
      icon: MessageCircle,
      title: 'Messaging',
      items: [
        { q: 'How do I send a message?', a: 'Once you match with someone, tap on their profile in your matches to open the chat.' },
        { q: 'Can I delete messages?', a: 'You can delete messages from your view, but the other person will still see them.' },
        { q: 'What are voice messages?', a: 'You can send voice messages by holding the microphone button in the chat.' },
      ]
    },
    {
      icon: Shield,
      title: 'Safety & Privacy',
      items: [
        { q: 'How do I block someone?', a: 'Go to their profile, tap the menu icon, and select Block. They won\'t be able to see your profile or contact you.' },
        { q: 'How do I report someone?', a: 'Go to their profile, tap the menu icon, and select Report. Choose the reason and submit.' },
        { q: 'Who can see my profile?', a: 'Only people matching your preferences can see your profile. You can also pause visibility in Settings.' },
      ]
    },
    {
      icon: Settings,
      title: 'Settings & Preferences',
      items: [
        { q: 'How do I change my location settings?', a: 'Go to Settings > Profile & Visibility > Location-based visibility.' },
        { q: 'How do I turn off notifications?', a: 'Go to Settings > Notifications to customize your notification preferences.' },
        { q: 'How do I pause my account?', a: 'Go to Settings and toggle "Pause account" to hide your profile temporarily.' },
      ]
    },
    {
      icon: CreditCard,
      title: 'Subscriptions & Payments',
      items: [
        { q: 'What is Pulse Premium?', a: 'Pulse Premium unlocks additional features like unlimited likes, see who likes you, and more.' },
        { q: 'How do I cancel my subscription?', a: 'Subscriptions are managed through your App Store or Google Play account settings.' },
        { q: 'Can I get a refund?', a: 'Refunds are handled by Apple or Google. Contact their support for refund requests.' },
      ]
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
          Help Center
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Find answers to common questions about using Pulse.
        </Typography>

        {faqCategories.map((category, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <category.icon size={18} color="#6C5CE7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {category.title}
              </Typography>
            </Box>
            {category.items.map((item, i) => (
              <Accordion 
                key={i} 
                sx={{ 
                  boxShadow: 'none', 
                  '&:before': { display: 'none' },
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px !important',
                  mb: 1,
                  '&.Mui-expanded': { margin: '0 0 8px 0' },
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={18} color="#64748b" />}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}

        {/* Contact Support */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          backgroundColor: '#f8fafc', 
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
            Still need help?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Contact our support team at
          </Typography>
          <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
            support@pulse.dating
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpCenterScreen;
