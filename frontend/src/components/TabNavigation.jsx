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
import { useLanguage } from "../context/LanguageContext";

const getTabsConfig = () => [
  { to: "/chat", labelKey: "chat", icon: <MessageCircle size={26} />, key: "chat" },
  { to: "/matches", labelKey: "matches", icon: <HeartHandshake size={26} />, key: "matches" },
  { to: "/nearby", labelKey: "nearby", icon: <Radar size={26} />, key: "nearby", showActivityBadge: true },
  { to: "/", labelKey: "home", icon: <Flame size={26} />, key: "home" },
  { to: "/events", labelKey: "events", icon: <CalendarPlus size={26} />, key: "events" },
  { to: "/explore", labelKey: "explore", icon: <Coffee size={26} />, key: "explore" },
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
          <span style={{ marginTop: 2, display: 'block' }}>{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
