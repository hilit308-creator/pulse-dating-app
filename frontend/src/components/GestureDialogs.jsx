/**
 * GestureDialogs.jsx
 * Reusable dialog components for gesture interactions (coffee, flowers, gifts)
 * Used when someone receives a gesture or when a gesture is declined
 */

import React from 'react';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Sparkles, Coffee, Flower2, Gift } from 'lucide-react';

// Gesture type definitions with icons and colors
export const GESTURE_TYPES = {
  coffee: {
    type: 'coffee',
    label: 'Coffee',
    icon: Coffee,
    color: '#8B4513',
    gradient: 'linear-gradient(135deg, #D4A574 0%, #8B4513 100%)',
  },
  flower: {
    type: 'flower',
    label: 'Flowers',
    icon: Flower2,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
  },
  gift: {
    type: 'gift',
    label: 'Gift',
    icon: Gift,
    color: '#6C5CE7',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #6C5CE7 100%)',
  },
};

/**
 * GestureDeclinedDialog
 * Shown to the sender when recipient declines their gesture
 * 
 * Props:
 * - open: boolean
 * - onClose: function
 * - person: { name, avatar } - the person who declined
 * - gesture: { type, label, icon, color, gradient }
 * - gestureDetails: { drink, flower, gift, quantity, etc. }
 * - onCancel: function - cancel the order
 * - onSendToOther: function - send to someone else
 * - onOrderForSelf: function(singleItem) - order just for myself
 */
export function GestureDeclinedDialog({ 
  open, 
  onClose, 
  person, 
  gesture, 
  gestureDetails, 
  onCancel, 
  onSendToOther, 
  onOrderForSelf 
}) {
  if (!person || !gesture) return null;

  const Icon = gesture.icon;
  const quantity = gestureDetails?.quantity || 1;
  
  // Get single item price for "order for myself" option
  const getSingleItemPrice = () => {
    switch (gesture.type) {
      case 'coffee':
        return {
          price: gestureDetails?.drink?.price || '₪0',
          priceNum: parseInt((gestureDetails?.drink?.price || '₪0').replace('₪', '')) || 0,
          itemName: gestureDetails?.drink?.name || 'Coffee',
        };
      case 'flower':
        return {
          price: gestureDetails?.flower?.price || '₪0',
          priceNum: gestureDetails?.flower?.priceNum || 0,
          itemName: gestureDetails?.flower?.name || 'Flowers',
        };
      case 'gift':
        return {
          price: gestureDetails?.gift?.price || '₪0',
          priceNum: gestureDetails?.gift?.priceNum || 0,
          itemName: gestureDetails?.gift?.name || 'Gift',
        };
      default:
        return { price: '₪0', priceNum: 0, itemName: 'Item' };
    }
  };
  
  const singleItem = getSingleItemPrice();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxWidth: 320,
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          p: 2.5,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Icon size={28} color={gesture.color} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5, fontSize: '1.1rem' }}>
          Maybe next time 💭
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
          {person.name} couldn't accept your {gesture.label.toLowerCase()} right now
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2.5, textAlign: 'center' }}>
        {/* Encouraging message */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
            Don't worry! No charge was made 💚
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            You're only charged when someone accepts
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: '0.85rem' }}>
          What would you like to do?
        </Typography>

        {/* Options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSendToOther}
            startIcon={<Users size={18} />}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: gesture.gradient,
              boxShadow: `0 4px 16px ${gesture.color}40`,
            }}
          >
            Send to someone else
          </Button>
          
          {quantity > 1 && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onOrderForSelf?.(singleItem)}
              startIcon={<Icon size={18} />}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderColor: gesture.color,
                color: gesture.color,
                '&:hover': { borderColor: gesture.color, bgcolor: `${gesture.color}10` },
              }}
            >
              Order just for myself - {singleItem.price}
            </Button>
          )}
          
          <Button
            fullWidth
            variant="text"
            onClick={onCancel}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            Cancel order
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}


/**
 * GestureReceivedDialog
 * Shown to the recipient when they receive a gesture
 * 
 * Props:
 * - open: boolean
 * - onClose: function
 * - sender: { name, avatar } - the person who sent the gesture
 * - gesture: { type, label, icon, color, gradient }
 * - gestureDetails: { drink, flower, gift, cafe, shop, vendor, message, etc. }
 * - onAccept: function - accept the gesture
 * - onDecline: function - politely decline
 * - onSendMessage: function - send a message first
 */
export function GestureReceivedDialog({ 
  open, 
  onClose, 
  sender, 
  gesture, 
  gestureDetails, 
  onAccept, 
  onDecline, 
  onSendMessage 
}) {
  if (!sender || !gesture) return null;

  const Icon = gesture.icon;

  // Get item details based on gesture type
  const getItemDetails = () => {
    switch (gesture.type) {
      case 'coffee':
        return {
          itemName: gestureDetails?.drink?.name || 'Coffee',
          vendorName: gestureDetails?.cafe?.name || 'Nearby cafe',
          price: gestureDetails?.drink?.price || '₪0',
        };
      case 'flower':
        return {
          itemName: gestureDetails?.flower?.name || 'Flowers',
          vendorName: gestureDetails?.shop?.name || 'Flower shop',
          price: gestureDetails?.flower?.price || '₪0',
        };
      case 'gift':
        return {
          itemName: gestureDetails?.gift?.name || 'Gift',
          vendorName: gestureDetails?.vendor?.name || 'Vendor',
          price: gestureDetails?.gift?.price || '₪0',
        };
      default:
        return { itemName: 'Item', vendorName: 'Vendor', price: '₪0' };
    }
  };

  const itemDetails = getItemDetails();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxWidth: 340,
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Animated Header */}
      <Box
        sx={{
          background: gesture.gradient,
          p: 2.5,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: -100, 
              opacity: [0, 1, 0],
              x: Math.sin(i) * 20,
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            style={{
              position: 'absolute',
              left: `${15 + i * 15}%`,
              bottom: 0,
            }}
          >
            <Sparkles size={14} color="rgba(255,255,255,0.5)" />
          </motion.div>
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              bgcolor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon size={30} color="#fff" />
          </Box>
        </motion.div>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 0.5, fontSize: '1.15rem' }}>
          You received a {gesture.label}! 🎉
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
          From {sender.name}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {/* Sender Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            component="img"
            src={sender.avatar}
            alt={sender.name}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>
              {sender.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              wants to treat you!
            </Typography>
          </Box>
        </Box>

        {/* Item Details */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: `${gesture.color}10`,
            border: `1px solid ${gesture.color}30`,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5, fontSize: '0.95rem' }}>
            {itemDetails.itemName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>
            From {itemDetails.vendorName}
          </Typography>
          {gestureDetails?.message && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
                Message:
              </Typography>
              <Typography variant="body2" sx={{ color: '#1a1a2e', fontStyle: 'italic', fontSize: '0.9rem' }}>
                "{gestureDetails.message}"
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onAccept}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: gesture.gradient,
              boxShadow: `0 4px 16px ${gesture.color}40`,
            }}
          >
            Accept with thanks! 💝
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={onSendMessage}
            startIcon={<MessageCircle size={18} />}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderColor: 'rgba(0,0,0,0.15)',
              color: '#1a1a2e',
            }}
          >
            Send a message first
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={onDecline}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            Politely decline 💭
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default { GestureReceivedDialog, GestureDeclinedDialog, GESTURE_TYPES };
