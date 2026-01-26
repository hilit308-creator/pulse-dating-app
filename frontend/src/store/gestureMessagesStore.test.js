import useGestureMessagesStore from './gestureMessagesStore';

// Reset store before each test
beforeEach(() => {
  const store = useGestureMessagesStore.getState();
  // Reset all state
  useGestureMessagesStore.setState({
    gestureMessages: {},
    recipientUsers: {},
    sentGestures: {},
    monthlyGestureUsage: {
      count: 0,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    },
    isPulsePro: false,
    pointsBalance: 0,
  });
});

describe('gestureMessagesStore', () => {
  describe('addGestureMessage', () => {
    it('should add a gesture message for a user', () => {
      const store = useGestureMessagesStore.getState();
      
      store.addGestureMessage('user1', {
        gestureType: 'coffee',
        message: 'Hey! Want to grab coffee?',
        details: { cafe: 'Starbucks', drink: 'Latte' },
      }, {
        id: 'user1',
        name: 'Dana',
        age: 25,
        photoUrl: 'https://example.com/photo.jpg',
      });
      
      const state = useGestureMessagesStore.getState();
      expect(state.gestureMessages['user1']).toHaveLength(1);
      expect(state.gestureMessages['user1'][0].gestureType).toBe('coffee');
      expect(state.gestureMessages['user1'][0].text).toBe('Hey! Want to grab coffee?');
      expect(state.recipientUsers['user1'].name).toBe('Dana');
    });
  });

  describe('markGestureSent', () => {
    it('should mark a gesture as sent for a user', () => {
      const store = useGestureMessagesStore.getState();
      
      store.markGestureSent('user1', 'coffee');
      
      const state = useGestureMessagesStore.getState();
      expect(state.sentGestures['user1'].coffee).toBe(true);
    });

    it('should track multiple gestures for the same user', () => {
      const store = useGestureMessagesStore.getState();
      
      store.markGestureSent('user1', 'coffee');
      store.markGestureSent('user1', 'flower');
      
      const state = useGestureMessagesStore.getState();
      expect(state.sentGestures['user1'].coffee).toBe(true);
      expect(state.sentGestures['user1'].flower).toBe(true);
    });
  });

  // TRIAL PERIOD: All gestures are free and unlimited
  // These tests reflect the current trial period behavior
  describe('canSendGesture - Trial Period (Unlimited)', () => {
    it('should always allow gestures during trial period', () => {
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('trial');
    });

    it('should allow gestures even with high usage count during trial', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 100,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('trial');
    });

    it('should allow gestures with zero points during trial', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 10,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('trial');
    });

    it('should allow gestures for non-Pro users during trial', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 10,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('trial');
    });
  });

  describe('useGesture - Trial Period (No Counting)', () => {
    it('should succeed without counting during trial', () => {
      const store = useGestureMessagesStore.getState();
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('trial');
    });

    it('should not deduct points during trial', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 1,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 200,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const initialPoints = store.pointsBalance;
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('trial');
      
      const state = useGestureMessagesStore.getState();
      expect(state.pointsBalance).toBe(initialPoints); // Points unchanged during trial
    });

    it('should always succeed during trial regardless of points', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 100,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('trial');
    });

    it('should succeed for any user during trial', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 5,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 200,
        isPulsePro: true,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('trial');
      
      const state = useGestureMessagesStore.getState();
      expect(state.pointsBalance).toBe(200); // Points unchanged during trial
    });
  });

  describe('clearMessagesForUser', () => {
    it('should clear messages and user info for a specific user', () => {
      const store = useGestureMessagesStore.getState();
      
      // Add messages for two users
      store.addGestureMessage('user1', {
        gestureType: 'coffee',
        message: 'Coffee?',
        details: {},
      }, { id: 'user1', name: 'Dana' });
      
      store.addGestureMessage('user2', {
        gestureType: 'flower',
        message: 'Flowers!',
        details: {},
      }, { id: 'user2', name: 'Tom' });
      
      // Clear user1
      store.clearMessagesForUser('user1');
      
      const state = useGestureMessagesStore.getState();
      expect(state.gestureMessages['user1']).toBeUndefined();
      expect(state.recipientUsers['user1']).toBeUndefined();
      expect(state.gestureMessages['user2']).toHaveLength(1);
      expect(state.recipientUsers['user2'].name).toBe('Tom');
    });
  });

  // TRIAL PERIOD: Monthly reset is not relevant during trial
  // When trial ends, this test should be updated to check monthly reset behavior
  describe('Monthly Reset - Trial Period', () => {
    it('should allow gestures regardless of month during trial', () => {
      const lastMonth = new Date().getMonth() - 1;
      const year = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
      const adjustedMonth = lastMonth < 0 ? 11 : lastMonth;
      
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 1,
          month: adjustedMonth,
          year: year,
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      // During trial, always allow
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('trial');
    });
  });
});
