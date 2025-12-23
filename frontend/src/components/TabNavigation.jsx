import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Flame,
  Radar,
  MessageCircle,
  HeartHandshake,
  Wine,
  CalendarPlus,
} from "lucide-react";

const tabs = [
  { to: "/chat", label: "Chat", icon: <MessageCircle size={26} />, key: "chat" },
  { to: "/matches", label: "Matches", icon: <HeartHandshake size={26} />, key: "matches" },
  { to: "/nearby", label: "Nearby", icon: <Radar size={26} />, key: "nearby" },
  { to: "/", label: "Home", icon: <Flame size={26} />, key: "home" },
  { to: "/events", label: "Events", icon: <CalendarPlus size={26} />, key: "add-event" },
  { to: "/explore", label: "Explore", icon: <Wine size={26} />, key: "explore" },
];

const activeColor = "#ff6f61";
const inactiveColor = "#b0b0b0";

export default function TabNavigation() {
  const location = useLocation();

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          end={tab.to === "/"}
        >
          {tab.icon}
          <span style={{ marginTop: 2, display: 'block' }}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
