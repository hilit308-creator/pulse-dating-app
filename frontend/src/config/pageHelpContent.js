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
        description: 'See who\'s around you right now.',
      },
      {
        emoji: '💬',
        title: 'Send Gestures & Chat',
        description: 'Tap to like, gesture, or chat.',
      },
      {
        emoji: '🔄',
        title: 'Adjust Range',
        description: 'Set your preferred distance.',
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
        description: "Find cafes, bars, and date spots."
      },
      {
        emoji: "💜",
        title: "Save & Plan",
        description: "Save your favorite places."
      },
      {
        emoji: "✨",
        title: "Get Perks",
        description: "Get exclusive venue benefits."
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
        description: "See who liked you back."
      },
      {
        emoji: "💬",
        title: "Start Chatting",
        description: "Tap to start a conversation."
      },
      {
        emoji: "⭐",
        title: "Favorites",
        description: "Mark special matches."
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
        description: "Chat with your matches."
      },
      {
        emoji: "📸",
        title: "Share Media",
        description: "Send photos and emojis."
      },
      {
        emoji: "🔔",
        title: "Notifications",
        description: "Get message alerts."
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
        description: "Add photos and bio."
      },
      {
        emoji: "⚙️",
        title: "Settings",
        description: "Set your preferences."
      },
      {
        emoji: "✨",
        title: "Complete Profile",
        description: "Get more matches!"
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
        description: "Swipe through profiles."
      },
      {
        emoji: "🎯",
        title: "Like or Pass",
        description: "Right = like, left = pass."
      },
      {
        emoji: "👥",
        title: "Get Matches",
        description: "Mutual likes = match!"
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
        description: "Find events nearby."
      },
      {
        emoji: "✅",
        title: "Join Events",
        description: "RSVP and see attendees."
      },
      {
        emoji: "🤝",
        title: "Meet People",
        description: "Connect with attendees."
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
        description: "See who liked you."
      },
      {
        emoji: "👀",
        title: "Check Profiles",
        description: "View their profiles."
      },
      {
        emoji: "💕",
        title: "Like Back",
        description: "Like back to match!"
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
        description: "Set your filters."
      },
      {
        emoji: "🔒",
        title: "Privacy",
        description: "Control your visibility."
      },
      {
        emoji: "🔔",
        title: "Notifications",
        description: "Manage your alerts."
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
        description: "Like unlimited profiles."
      },
      {
        emoji: "🚀",
        title: "Boost",
        description: "Get more visibility."
      },
      {
        emoji: "💎",
        title: "See Likes",
        description: "See likes first."
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
        description: "Keep personal info private."
      },
      {
        emoji: "📍",
        title: "Meet Safely",
        description: "Meet in public places."
      },
      {
        emoji: "🚨",
        title: "Report",
        description: "Report bad behavior."
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
