import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const TermsOfServiceScreen = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By creating a Pulse account or using our services, you agree to these Terms of Service. If you don't agree with these terms, please don't use Pulse.

These terms constitute a legally binding agreement between you and Pulse. We may update these terms from time to time, and continued use constitutes acceptance of any changes.`
    },
    {
      title: '2. Eligibility',
      content: `To use Pulse, you must:

• Be at least 18 years old
• Be legally able to enter into a binding contract
• Not be prohibited from using our services under applicable law
• Not have been previously banned from Pulse

By using Pulse, you represent and warrant that you meet these requirements.`
    },
    {
      title: '3. Your Account',
      content: `You are responsible for:

• Providing accurate and complete information
• Maintaining the security of your account
• All activity that occurs under your account
• Notifying us of any unauthorized access

You may not share your account or password with others. We may suspend or terminate accounts that violate these terms.`
    },
    {
      title: '4. Community Guidelines',
      content: `You agree to follow our Community Guidelines and to:

• Treat other users with respect
• Not harass, threaten, or abuse others
• Not post inappropriate or offensive content
• Not use Pulse for commercial purposes
• Not spam or send unsolicited messages
• Not impersonate others or create fake accounts

Violation of these guidelines may result in account termination.`
    },
    {
      title: '5. Content',
      content: `You retain ownership of content you post on Pulse. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with our services.

You are solely responsible for your content. You agree not to post content that:

• Is illegal, harmful, or offensive
• Infringes on others' rights
• Contains malware or spam
• Violates our Community Guidelines`
    },
    {
      title: '6. Interactions with Other Users',
      content: `Pulse is a platform for meeting people. You are solely responsible for your interactions with other users. We do not:

• Screen users for criminal background
• Verify user identities
• Guarantee the accuracy of user information
• Assume liability for user conduct

Always exercise caution when meeting people online. Follow our Safety Tips.`
    },
    {
      title: '7. Subscriptions and Payments',
      content: `Pulse offers optional premium features through subscriptions. By purchasing a subscription:

• You authorize recurring charges to your payment method
• Subscriptions auto-renew unless cancelled
• Refunds are subject to app store policies
• Prices may change with notice

Cancel subscriptions through your app store account settings.`
    },
    {
      title: '8. Intellectual Property',
      content: `Pulse and its content, features, and functionality are owned by Pulse and protected by copyright, trademark, and other intellectual property laws.

You may not:

• Copy or modify our services
• Reverse engineer our technology
• Use our branding without permission
• Scrape or harvest user data`
    },
    {
      title: '9. Disclaimer of Warranties',
      content: `Pulse is provided "as is" and "as available" without warranties of any kind. We do not guarantee:

• Uninterrupted or error-free service
• That you will find matches
• The accuracy of user content
• The behavior of other users

Use Pulse at your own risk.`
    },
    {
      title: '10. Limitation of Liability',
      content: `To the maximum extent permitted by law, Pulse shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:

• Your use of or inability to use our services
• Any interactions with other users
• Unauthorized access to your account
• Any other matter relating to our services`
    },
    {
      title: '11. Termination',
      content: `You may delete your account at any time through the app settings. We may suspend or terminate your account if you:

• Violate these terms
• Create risk or legal exposure for us
• Are inactive for an extended period

Upon termination, your right to use Pulse immediately ceases.`
    },
    {
      title: '12. Governing Law',
      content: `These terms are governed by the laws of the jurisdiction where Pulse operates. Any disputes shall be resolved through binding arbitration, except where prohibited by law.`
    },
    {
      title: '13. Contact Us',
      content: `For questions about these Terms of Service:

Email: legal@pulse.dating

We're here to help and will respond to inquiries as quickly as possible.`
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
          Terms of Service
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 3 }}>
          Last updated: January 2025
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
          Welcome to Pulse! These Terms of Service govern your use of our dating application and services.
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

export default TermsOfServiceScreen;
