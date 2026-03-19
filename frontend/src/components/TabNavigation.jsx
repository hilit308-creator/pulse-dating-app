import React, { useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Flame,
  Radar,
  MessageCircle,
  HeartHandshake,
  Coffee,
  CalendarPlus,
  Compass,
} from "lucide-react";
import { useActivity } from "../context/ActivityContext";
import { useLanguage } from "../context/LanguageContext";

const getTabsConfig = () => [
  { to: "/chat", labelKey: "chat", icon: <MessageCircle size={24} />, key: "chat" },
  { to: "/matches", labelKey: "matches", icon: <HeartHandshake size={24} />, key: "matches" },
  { to: "/nearby", labelKey: "nearby", icon: <Radar size={24} />, key: "nearby", showActivityBadge: true },
  { to: "/", labelKey: "home", icon: <Flame size={24} />, key: "home" },
  { to: "/events", labelKey: "events", icon: <CalendarPlus size={24} />, key: "events" },
  { to: "/explore", labelKey: "explore", icon: <Coffee size={24} />, key: "explore" },
];

// Event name for scroll-to-focus functionality
export const TAB_SCROLL_EVENT = 'pulse:tab_scroll_to_focus';

const activeColor = "#ff6f61";
const inactiveColor = "#b0b0b0";

// Badge dot component for unread activity indicator
const ActivityBadge = () => (
  <span
    style={{
      position: 'absolute',
      top: 2,
      right: -2,
      width: 10,
      height: 10,
      backgroundColor: '#6C5CE7',
      borderRadius: '50%',
      border: '2px solid #fff',
      boxShadow: '0 2px 4px rgba(108, 92, 231, 0.4)',
    }}
  />
);

export default function TabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasUnreadActivity, markActivityAsRead } = useActivity();
  const { t } = useLanguage();
  const tabs = getTabsConfig();

  // Clear activity badge when user enters Nearby tab
  useEffect(() => {
    if (location.pathname === '/nearby' || location.pathname.startsWith('/nearby/')) {
      if (hasUnreadActivity) {
        markActivityAsRead();
      }
    }
  }, [location.pathname, hasUnreadActivity, markActivityAsRead]);

  // Handle tab click - scroll to focus area if already on that tab
  const handleTabClick = useCallback((e, tab) => {
    const isCurrentTab = (tab.to === '/' && location.pathname === '/') || 
                         (tab.to !== '/' && location.pathname === tab.to);
    
    if (isCurrentTab) {
      // Already on this tab - dispatch scroll event
      e.preventDefault();
      window.dispatchEvent(new CustomEvent(TAB_SCROLL_EVENT, { 
        detail: { tab: tab.key } 
      }));
    }
    // If not on current tab, let NavLink handle navigation normally
  }, [location.pathname]);

  return (
    <nav 
      className="tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: 56,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: '#ffffff',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          end={tab.to === "/"}
          style={{ position: 'relative' }}
          onClick={(e) => handleTabClick(e, tab)}
        >
          <span style={{ position: 'relative', display: 'inline-block' }}>
            {tab.icon}
            {/* Show badge dot only on Nearby tab when there's unread activity */}
            {tab.showActivityBadge && hasUnreadActivity && <ActivityBadge />}
          </span>
          <span style={{ marginTop: 2, display: 'block' }}>{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
