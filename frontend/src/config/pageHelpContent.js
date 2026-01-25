// Page-specific help content configuration
// Each page can have a title and steps array with emoji, title, and description

export const PAGE_HELP_CONTENT = {
  nearby: {
    title: '🎯 Nearby',
    buttonText: '✨ Learn How It Works',
    steps: [
      {
        emoji: '📍',
        title: 'See Who\'s Near You',
        description: 'The radar shows people nearby in real-time. Closer = larger on screen.',
      },
      {
        emoji: '💬',
        title: 'Send Gestures & Chat',
        description: 'Tap a profile to like, send a gesture, or start chatting.',
      },
      {
        emoji: '🔄',
        title: 'Adjust Range',
        description: 'Change distance from 500m to 50km using the button above.',
      },
    ],
  },
  
  explore: {
    title: '🌍 Explore',
    buttonText: '🚀 Learn How to Explore',
    steps: [
      {
        emoji: "🔍",
        title: "Discover Places",
        description: "Browse cafes, bars, events and nature spots for your next date."
      },
      {
        emoji: "💜",
        title: "Save & Plan",
        description: "Save places you like and view upcoming events."
      },
      {
        emoji: "✨",
        title: "Get Perks",
        description: "Unlock exclusive benefits at partner venues."
      }
    ]
  },
  
  matches: {
    title: "💕 Matches",
    buttonText: "💖 Learn About Matches",
    steps: [
      {
        emoji: "💕",
        title: "Mutual Likes",
        description: "See everyone who liked you back."
      },
      {
        emoji: "💬",
        title: "Start Chatting",
        description: "Tap a match to open a private conversation."
      },
      {
        emoji: "⭐",
        title: "Favorites",
        description: "Mark special matches to find them easily."
      }
    ]
  },
  
  chat: {
    title: "💬 Chat",
    buttonText: "💌 Learn About Chat",
    steps: [
      {
        emoji: "💬",
        title: "Send Messages",
        description: "Chat with your matches and build real connections."
      },
      {
        emoji: "📸",
        title: "Share Media",
        description: "Send photos and emojis to make chats fun."
      },
      {
        emoji: "🔔",
        title: "Notifications",
        description: "Get notified when you receive new messages."
      }
    ]
  },
  
  profile: {
    title: "✨ Profile",
    buttonText: "🎯 Improve Your Profile",
    steps: [
      {
        emoji: "📝",
        title: "Edit Details",
        description: "Add photos and update your bio."
      },
      {
        emoji: "⚙️",
        title: "Settings",
        description: "Customize preferences and privacy."
      },
      {
        emoji: "✨",
        title: "Complete Profile",
        description: "A full profile gets more matches!"
      }
    ]
  },
  
  home: {
    title: "🏠 Home",
    buttonText: "🌟 Discover the Feed",
    steps: [
      {
        emoji: "🏠",
        title: "Your Feed",
        description: "Swipe through profiles and find your match."
      },
      {
        emoji: "🎯",
        title: "Like or Pass",
        description: "Swipe right to like, left to pass."
      },
      {
        emoji: "👥",
        title: "Get Matches",
        description: "When you both like each other, it's a match!"
      }
    ]
  },
  
  events: {
    title: "🎉 Events",
    buttonText: "🎊 Discover Events",
    steps: [
      {
        emoji: "🎉",
        title: "Browse Events",
        description: "Find parties, workshops, and social activities nearby."
      },
      {
        emoji: "✅",
        title: "Join Events",
        description: "RSVP and see who else is going."
      },
      {
        emoji: "🤝",
        title: "Meet People",
        description: "Connect with attendees before and during events."
      }
    ]
  },
  
  likes: {
    title: "💖 Likes You",
    buttonText: "😍 See Who Likes You",
    steps: [
      {
        emoji: "💖",
        title: "See Your Admirers",
        description: "View everyone who liked your profile."
      },
      {
        emoji: "👀",
        title: "Check Profiles",
        description: "Browse their photos and bio."
      },
      {
        emoji: "💕",
        title: "Like Back",
        description: "Like them back to create a match!"
      }
    ]
  },
  
  settings: {
    title: "⚙️ Settings",
    buttonText: "🔧 Learn About Settings",
    steps: [
      {
        emoji: "⚙️",
        title: "Preferences",
        description: "Set distance, age range, and interests."
      },
      {
        emoji: "🔒",
        title: "Privacy",
        description: "Control who sees your profile and location."
      },
      {
        emoji: "🔔",
        title: "Notifications",
        description: "Choose which alerts you want to receive."
      }
    ]
  },
  
  subscription: {
    title: "⭐ Premium",
    buttonText: "💎 Discover Premium",
    steps: [
      {
        emoji: "⭐",
        title: "Unlimited Likes",
        description: "Like as many profiles as you want."
      },
      {
        emoji: "🚀",
        title: "Boost",
        description: "Get more visibility for 30 minutes."
      },
      {
        emoji: "💎",
        title: "See Likes",
        description: "See who liked you before swiping."
      }
    ]
  },
  
  safety: {
    title: "🛡️ Safety",
    buttonText: "🔒 Learn About Safety",
    steps: [
      {
        emoji: "🛡️",
        title: "Protect Info",
        description: "Never share sensitive personal details."
      },
      {
        emoji: "📍",
        title: "Meet Safely",
        description: "First dates should be in public places."
      },
      {
        emoji: "🚨",
        title: "Report",
        description: "Block or report suspicious behavior."
      }
    ]
  }
};

// Helper function to get help content for a page
export const getPageHelpContent = (pageKey) => {
  return PAGE_HELP_CONTENT[pageKey] || {
    title: "How It Works",
    steps: [
      {
        emoji: "ℹ️",
        title: "Welcome",
        description: "This is a page in the app. Explore the various features to get started."
      }
    ]
  };
};
