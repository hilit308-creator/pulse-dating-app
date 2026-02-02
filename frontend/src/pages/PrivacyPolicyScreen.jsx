import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyScreen = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• Account information (name, email, phone number, date of birth)
• Profile information (photos, bio, preferences)
• Communications and interactions with other users
• Location data (with your permission)
• Device information and usage data

We only collect information necessary to provide and improve our services.`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Create and maintain your account
• Match you with other users based on your preferences
• Enable communication between users
• Improve and personalize your experience
• Send you updates and notifications
• Ensure safety and prevent fraud
• Comply with legal obligations`
    },
    {
      title: '3. Information Sharing',
      content: `We share your information only in the following circumstances:

• With other users (your public profile information)
• With service providers who help us operate our platform
• When required by law or to protect rights and safety
• With your consent

We never sell your personal information to third parties.`
    },
    {
      title: '4. Your Privacy Controls',
      content: `You have control over your information:

• Edit or delete your profile information at any time
• Adjust visibility settings to control who sees your profile
• Block specific users from viewing your profile
• Download a copy of your data
• Delete your account and associated data

Access these controls in your Settings.`
    },
    {
      title: '5. Data Security',
      content: `We implement appropriate security measures to protect your information:

• Encryption of data in transit and at rest
• Regular security assessments
• Limited employee access to personal data
• Secure data centers

While we strive to protect your information, no method of transmission over the internet is 100% secure.`
    },
    {
      title: '6. Data Retention',
      content: `We retain your information for as long as your account is active or as needed to provide services. When you delete your account:

• Your profile is immediately hidden from other users
• Your data is permanently deleted within 30 days
• Some information may be retained for legal compliance

Conversations are deleted when either party deletes the match.`
    },
    {
      title: '7. Location Data',
      content: `Location is important for connecting you with nearby users:

• We collect location only with your permission
• You can disable location access at any time
• We never share your exact location with other users
• Only approximate distance is shown to matches`
    },
    {
      title: '8. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

• Keep you logged in
• Remember your preferences
• Understand how you use our app
• Improve our services

You can manage cookie preferences in your device settings.`
    },
    {
      title: '9. Children\'s Privacy',
      content: `Pulse is not intended for users under 18 years of age. We do not knowingly collect information from children. If we learn we have collected information from a child, we will delete it promptly.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email. Continued use of Pulse after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '11. Contact Us',
      content: `If you have questions about this Privacy Policy or our practices, contact us at:

Email: privacy@pulse.dating

We take your privacy seriously and will respond to inquiries promptly.`
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Privacy Policy
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 3 }}>
          Last updated: January 2025
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          At Pulse, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
        </Typography>

        {sections.map((section, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
              {section.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b', 
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
              }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PrivacyPolicyScreen;
