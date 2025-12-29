import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

const tabs = [
  { to: "/chat", label: "Chat", icon: <MessageCircle size={26} />, key: "chat" },
  { to: "/matches", label: "Matches", icon: <HeartHandshake size={26} />, key: "matches" },
  { to: "/nearby", label: "Nearby", icon: <Radar size={26} />, key: "nearby", showActivityBadge: true },
  { to: "/", label: "Home", icon: <Flame size={26} />, key: "home" },
  { to: "/events", label: "Events", icon: <CalendarPlus size={26} />, key: "events" },
  { to: "/explore", label: "Cafes", icon: <Coffee size={26} />, key: "explore" },
];

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
  const { hasUnreadActivity, markActivityAsRead } = useActivity();

  // Clear activity badge when user enters Nearby tab
  useEffect(() => {
    if (location.pathname === '/nearby' || location.pathname.startsWith('/nearby/')) {
      if (hasUnreadActivity) {
        markActivityAsRead();
      }
    }
  }, [location.pathname, hasUnreadActivity, markActivityAsRead]);

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          end={tab.to === "/"}
          style={{ position: 'relative' }}
        >
          <span style={{ position: 'relative', display: 'inline-block' }}>
            {tab.icon}
            {/* Show badge dot only on Nearby tab when there's unread activity */}
            {tab.showActivityBadge && hasUnreadActivity && <ActivityBadge />}
          </span>
          <span style={{ marginTop: 2, display: 'block' }}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
