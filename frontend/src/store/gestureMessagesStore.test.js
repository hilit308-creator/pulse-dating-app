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

  describe('canSendGesture - Monthly Limits', () => {
    it('should allow first gesture for free', () => {
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('free');
    });

    it('should block second gesture if no points and not Pro', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 1,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(false);
      expect(result.reason).toBe('limit_reached');
    });

    it('should allow second gesture if user has 60+ points', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 1,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 60,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('points');
      expect(result.cost).toBe(60);
    });

    it('should allow unlimited gestures for Pro users', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 10,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 0,
        isPulsePro: true,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.canSendGesture();
      
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('pro');
    });
  });

  describe('useGesture - Consuming Gestures', () => {
    it('should use free gesture and increment count', () => {
      const store = useGestureMessagesStore.getState();
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('free');
      
      const state = useGestureMessagesStore.getState();
      expect(state.monthlyGestureUsage.count).toBe(1);
    });

    it('should deduct 60 points when free gesture is used', () => {
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
      const result = store.useGesture();
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('points');
      expect(result.pointsUsed).toBe(60);
      
      const state = useGestureMessagesStore.getState();
      expect(state.pointsBalance).toBe(140);
    });

    it('should fail if no free gesture and insufficient points', () => {
      useGestureMessagesStore.setState({
        monthlyGestureUsage: {
          count: 1,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        },
        pointsBalance: 50,
        isPulsePro: false,
      });
      
      const store = useGestureMessagesStore.getState();
      const result = store.useGesture();
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_resources');
    });

    it('should not deduct points for Pro users', () => {
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
      expect(result.method).toBe('pro');
      
      const state = useGestureMessagesStore.getState();
      expect(state.pointsBalance).toBe(200); // Points unchanged
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

  describe('Monthly Reset', () => {
    it('should reset count when month changes', () => {
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
      
      // Should reset and allow free gesture
      expect(result.canSend).toBe(true);
      expect(result.reason).toBe('free');
    });
  });
});
