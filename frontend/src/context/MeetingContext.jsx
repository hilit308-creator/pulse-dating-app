import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Meeting states
export const MEETING_STATE = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
};

// SOS states
export const SOS_STATE = {
  NONE: 'none',
  SEARCHING: 'searching',
  HELPER_FOUND: 'helper_found',
  HELPER_APPROACHING: 'helper_approaching',
  HELPER_ARRIVED: 'helper_arrived',
};

const MeetingContext = createContext(null);

export function MeetingProvider({ children }) {
  // Meeting state
  const [meetingState, setMeetingState] = useState(MEETING_STATE.INACTIVE);
  const [meetingWith, setMeetingWith] = useState(null);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [showMeetingScreen, setShowMeetingScreen] = useState(false);
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

  // End meeting
  const endMeeting = useCallback(() => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    setSosState(SOS_STATE.NONE);
    setSosRequestId(null);
    setSosHelperDistance(null);
    setLocationSharing(false);
    setMeetingState(MEETING_STATE.INACTIVE);
    setMeetingWith(null);
    setMeetingStartTime(null);
    setShowMeetingScreen(false);
    setContactsNotifiedThisMeeting([]);
    setCurrentLocation(null);
  }, []);

  // Trigger SOS
  const triggerSOS = useCallback(() => {
    if (meetingState !== MEETING_STATE.ACTIVE) return;
    const requestId = `sos_${Date.now()}`;
    setSosRequestId(requestId);
    setSosState(SOS_STATE.SEARCHING);
    
    // Simulate helper found after 3s
    setTimeout(() => {
      setSosState(SOS_STATE.HELPER_FOUND);
      setSosHelperDistance(1.2);
      setTimeout(() => {
        setSosState(SOS_STATE.HELPER_APPROACHING);
        setSosHelperDistance(0.8);
        setTimeout(() => {
          setSosHelperDistance(0.3);
          setTimeout(() => {
            setSosState(SOS_STATE.HELPER_ARRIVED);
            setSosHelperDistance(0);
          }, 3000);
        }, 3000);
      }, 2000);
    }, 3000);
  }, [meetingState]);

  // Cancel SOS
  const cancelSOS = useCallback(() => {
    setSosState(SOS_STATE.NONE);
    setSosRequestId(null);
    setSosHelperDistance(null);
  }, []);

  // Notify contact
  const notifyContact = useCallback((contactId) => {
    if (!contactsNotifiedThisMeeting.includes(contactId)) {
      setContactsNotifiedThisMeeting(prev => [...prev, contactId]);
    }
  }, [contactsNotifiedThisMeeting]);

  const value = {
    // State
    meetingState,
    meetingWith,
    meetingStartTime,
    showMeetingScreen,
    setShowMeetingScreen,
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
    
    // Actions
    startMeeting,
    endMeeting,
    triggerSOS,
    cancelSOS,
    notifyContact,
    
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
