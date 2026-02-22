import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Meeting states
export const MEETING_STATE = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  ENDING: 'ending', // Brief state before bar disappears
};

// SOS states
export const SOS_STATE = {
  NONE: 'none',
  SEARCHING: 'searching',
  HELPER_FOUND: 'helper_found',
  HELPER_APPROACHING: 'helper_approaching',
  HELPER_ARRIVED: 'helper_arrived',
};

// SOS Timeouts (per spec)
const SOS_HELPER_UNAVAILABLE_TIMEOUT = 90000; // 90 seconds - no heartbeat/location
const SOS_NO_PROGRESS_TIMEOUT = 180000; // 3 minutes - no distance decrease

const MeetingContext = createContext(null);

export function MeetingProvider({ children }) {
  // Meeting state
  const [meetingState, setMeetingState] = useState(MEETING_STATE.INACTIVE);
  const [meetingWith, setMeetingWith] = useState(null);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [showMeetingScreen, setShowMeetingScreen] = useState(false);
  const [showMeetingScreenTrigger, setShowMeetingScreenTrigger] = useState(0); // Counter to force re-render
  const [previousPath, setPreviousPath] = useState(null); // Path to return to when minimizing
  
  // Meeting contacts
  const [meetingContacts, setMeetingContacts] = useState(() => {
    const saved = localStorage.getItem('pulse_meeting_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [contactsNotifiedThisMeeting, setContactsNotifiedThisMeeting] = useState([]);
  
  // Location
  const [locationSharing, setLocationSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationWatchRef = useRef(null);
  
  // SOS state
  const [sosState, setSosState] = useState(SOS_STATE.NONE);
  const [sosRequestId, setSosRequestId] = useState(null);
  const [sosHelperDistance, setSosHelperDistance] = useState(null);
  const [sosHelper, setSosHelper] = useState(null);
  const [sosMessage, setSosMessage] = useState(null); // Toast message for SOS events
  
  // SOS timeout refs
  const sosSearchTimeoutRef = useRef(null);
  const sosHelperHeartbeatTimeoutRef = useRef(null);
  const sosNoProgressTimeoutRef = useRef(null);
  const sosHelperLastDistanceRef = useRef(null);
  const sosRequestLockedRef = useRef(false); // First accept wins lock

  // Save contacts to localStorage
  useEffect(() => {
    localStorage.setItem('pulse_meeting_contacts', JSON.stringify(meetingContacts));
  }, [meetingContacts]);

  // Location tracking during meeting
  useEffect(() => {
    if (meetingState === MEETING_STATE.ACTIVE && locationSharing) {
      if (navigator.geolocation) {
        locationWatchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, [meetingState, locationSharing]);

  // Clear all SOS timeouts (must be defined before endMeeting)
  const clearAllSosTimeouts = useCallback(() => {
    if (sosSearchTimeoutRef.current) {
      clearTimeout(sosSearchTimeoutRef.current);
      sosSearchTimeoutRef.current = null;
    }
    if (sosHelperHeartbeatTimeoutRef.current) {
      clearTimeout(sosHelperHeartbeatTimeoutRef.current);
      sosHelperHeartbeatTimeoutRef.current = null;
    }
    if (sosNoProgressTimeoutRef.current) {
      clearTimeout(sosNoProgressTimeoutRef.current);
      sosNoProgressTimeoutRef.current = null;
    }
  }, []);

  // Start meeting
  const startMeeting = useCallback((user) => {
    if (!user) return;
    setMeetingState(MEETING_STATE.ACTIVE);
    setMeetingWith(user);
    setMeetingStartTime(Date.now());
    setLocationSharing(true);
    setShowMeetingScreen(true);
    setContactsNotifiedThisMeeting([]);
  }, []);

  // End meeting with brief ending indication
  const endMeeting = useCallback(() => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    
    // Clear SOS state
    clearAllSosTimeouts();
    setSosState(SOS_STATE.NONE);
    setSosRequestId(null);
    setSosHelper(null);
    setSosHelperDistance(null);
    sosHelperLastDistanceRef.current = null;
    sosRequestLockedRef.current = false;
    
    setLocationSharing(false);
    setShowMeetingScreen(false);
    setContactsNotifiedThisMeeting([]);
    setCurrentLocation(null);
    
    // Show brief "ending" state before fully hiding (1.5s)
    setMeetingState(MEETING_STATE.ENDING);
    
    setTimeout(() => {
      setMeetingState(MEETING_STATE.INACTIVE);
      setMeetingWith(null);
      setMeetingStartTime(null);
    }, 1500);
  }, [clearAllSosTimeouts]);

  // Show SOS message (auto-clears after 5s)
  const showSosMessage = useCallback((message) => {
    setSosMessage(message);
    setTimeout(() => setSosMessage(null), 5000);
  }, []);

  // Auto-resume scanning when helper fails
  const resumeScanning = useCallback(() => {
    clearAllSosTimeouts();
    setSosHelper(null);
    setSosHelperDistance(null);
    sosHelperLastDistanceRef.current = null;
    sosRequestLockedRef.current = false;
    setSosState(SOS_STATE.SEARCHING);
    
    // Simulate finding another helper after 5s (in production: real network call)
    sosSearchTimeoutRef.current = setTimeout(() => {
      simulateHelperAccept();
    }, 5000);
  }, [clearAllSosTimeouts]);

  // Simulate helper accepting (in production: real network event)
  const simulateHelperAccept = useCallback(() => {
    // First accept wins - lock the request
    if (sosRequestLockedRef.current) {
      // Another helper already accepted - show message to late helper
      // (In production this would be sent to the late helper's device)
      console.log('Late accept blocked - request already locked');
      return;
    }
    
    sosRequestLockedRef.current = true;
    
    const helper = {
      id: `helper_${Date.now()}`,
      name: 'Sarah',
      lastHeartbeat: Date.now(),
    };
    
    setSosHelper(helper);
    setSosState(SOS_STATE.HELPER_FOUND);
    setSosHelperDistance(1.2);
    sosHelperLastDistanceRef.current = 1.2;
    
    // Start heartbeat timeout (90s)
    sosHelperHeartbeatTimeoutRef.current = setTimeout(() => {
      // Helper unavailable - no heartbeat for 90s
      showSosMessage("It looks like the person who responded is currently unavailable. We're continuing to search.");
      resumeScanning();
    }, SOS_HELPER_UNAVAILABLE_TIMEOUT);
    
    // Start no-progress timeout (3 min)
    sosNoProgressTimeoutRef.current = setTimeout(() => {
      // Check if distance decreased
      if (sosHelperLastDistanceRef.current !== null && sosHelperDistance >= sosHelperLastDistanceRef.current) {
        showSosMessage("It looks like the person who responded isn't approaching right now. We're continuing to search.");
        resumeScanning();
      }
    }, SOS_NO_PROGRESS_TIMEOUT);
    
    // Simulate helper approaching (with heartbeats and distance updates)
    setTimeout(() => {
      if (sosState === SOS_STATE.HELPER_FOUND || sosState === SOS_STATE.HELPER_APPROACHING) {
        setSosState(SOS_STATE.HELPER_APPROACHING);
        setSosHelperDistance(0.8);
        sosHelperLastDistanceRef.current = 0.8;
        // Reset heartbeat timeout on update
        if (sosHelperHeartbeatTimeoutRef.current) {
          clearTimeout(sosHelperHeartbeatTimeoutRef.current);
        }
        sosHelperHeartbeatTimeoutRef.current = setTimeout(() => {
          showSosMessage("It looks like the person who responded is currently unavailable. We're continuing to search.");
          resumeScanning();
        }, SOS_HELPER_UNAVAILABLE_TIMEOUT);
      }
    }, 3000);
    
    // Simulate helper getting closer
    setTimeout(() => {
      if (sosState === SOS_STATE.HELPER_APPROACHING) {
        setSosHelperDistance(0.3);
        sosHelperLastDistanceRef.current = 0.3;
      }
    }, 6000);
    
    // Simulate helper arrived
    setTimeout(() => {
      if (sosState === SOS_STATE.HELPER_APPROACHING) {
        clearAllSosTimeouts();
        setSosState(SOS_STATE.HELPER_ARRIVED);
        setSosHelperDistance(0);
        sosHelperLastDistanceRef.current = 0;
      }
    }, 10000);
  }, [sosState, sosHelperDistance, showSosMessage, resumeScanning, clearAllSosTimeouts]);

  // Trigger SOS
  const triggerSOS = useCallback(() => {
    if (meetingState !== MEETING_STATE.ACTIVE) return;
    
    const requestId = `sos_${Date.now()}`;
    setSosRequestId(requestId);
    setSosState(SOS_STATE.SEARCHING);
    setSosHelper(null);
    setSosHelperDistance(null);
    sosHelperLastDistanceRef.current = null;
    sosRequestLockedRef.current = false;
    
    // Start searching for helper (simulate finding one after 3s)
    sosSearchTimeoutRef.current = setTimeout(() => {
      simulateHelperAccept();
    }, 3000);
  }, [meetingState, simulateHelperAccept]);

  // Cancel SOS
  const cancelSOS = useCallback(() => {
    clearAllSosTimeouts();
    sosRequestLockedRef.current = false;
    setSosState(SOS_STATE.NONE);
    setSosRequestId(null);
    setSosHelper(null);
    setSosHelperDistance(null);
    sosHelperLastDistanceRef.current = null;
    showSosMessage("The request was cancelled.");
  }, [clearAllSosTimeouts, showSosMessage]);

  // Handle late helper accept (called when another helper tries to accept after lock)
  const handleLateHelperAccept = useCallback(() => {
    // This would be called from network event in production
    // Returns message to show to the late helper
    if (sosRequestLockedRef.current) {
      return "Someone has already responded to this request. Thank you for wanting to help.";
    }
    if (sosState === SOS_STATE.NONE) {
      return "This request is no longer active. Thank you for responding.";
    }
    return null;
  }, [sosState]);

  // Handle helper returning after reassignment
  const handleHelperReturnAfterReassignment = useCallback(() => {
    return "The request has already been reassigned. Thank you for responding.";
  }, []);

  // Notify contact
  const notifyContact = useCallback((contactId) => {
    if (!contactsNotifiedThisMeeting.includes(contactId)) {
      setContactsNotifiedThisMeeting(prev => [...prev, contactId]);
    }
  }, [contactsNotifiedThisMeeting]);

  // Trigger to force ChatScreen to show meeting screen
  const triggerShowMeetingScreen = useCallback(() => {
    setShowMeetingScreen(true);
    setShowMeetingScreenTrigger(prev => prev + 1);
  }, []);

  const value = {
    // State
    meetingState,
    meetingWith,
    meetingStartTime,
    showMeetingScreen,
    setShowMeetingScreen,
    showMeetingScreenTrigger,
    triggerShowMeetingScreen,
    previousPath,
    setPreviousPath,
    meetingContacts,
    setMeetingContacts,
    contactsNotifiedThisMeeting,
    locationSharing,
    currentLocation,
    sosState,
    sosRequestId,
    sosHelperDistance,
    sosHelper,
    sosMessage, // Toast message for SOS events
    
    // Actions
    startMeeting,
    endMeeting,
    triggerSOS,
    cancelSOS,
    notifyContact,
    handleLateHelperAccept,
    handleHelperReturnAfterReassignment,
    
    // Constants
    MEETING_STATE,
    SOS_STATE,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
}

export default MeetingContext;
