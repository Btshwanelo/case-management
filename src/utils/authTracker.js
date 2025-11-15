// authTracker.js
import UAParser from 'ua-parser-js';

export class AuthTracker {
  constructor() {
    this.parser = new UAParser();
  }

  getDeviceInfo() {
    const result = this.parser.getResult();
    return {
      browser: {
        name: result.browser.name,
        version: result.browser.version,
      },
      os: {
        name: result.os.name,
        version: result.os.version,
      },
      device: result.device.type || 'desktop',
      screenResolution: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  getLocationInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  async trackAuth(userId, eventType = 'login') {
    const timestamp = new Date().toISOString();
    const deviceInfo = this.getDeviceInfo();
    const locationInfo = this.getLocationInfo();

    const authEvent = {
      userId,
      eventType,
      timestamp,
      deviceInfo,
      locationInfo,
      sessionId: this.generateSessionId(),
    };

    // Store locally
    this.storeLocally(authEvent);

    // Send to your API
    await this.sendToApi(authEvent);

    return authEvent;
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  storeLocally(authEvent) {
    const events = JSON.parse(localStorage.getItem('authEvents') || '[]');
    events.push(authEvent);
    localStorage.setItem('authEvents', JSON.stringify(events));
  }

  async sendToApi(authEvent) {
    try {
      const response = await fetch('/api/auth/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authEvent),
      });
      return response.json();
    } catch (error) {
      console.error('Failed to send auth event:', error);
      return null;
    }
  }
}

// Usage in React component
import { useEffect } from 'react';

const authTracker = new AuthTracker();

export function useAuthTracking(userId) {
  useEffect(() => {
    if (userId) {
      authTracker.trackAuth(userId, 'login');

      return () => {
        authTracker.trackAuth(userId, 'logout');
      };
    }
  }, [userId]);
}
