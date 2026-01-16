import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useNotificationStore } from '@/app/lib/store/notificationStore';

// In production (Railway), use relative URL to go through Next.js rewrites
// In development, use absolute backend URL
const getHubUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/hubs/order'; // Relative URL - will be rewritten by Next.js
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296/api/';
  return API_URL.replace('/api/', '/hubs/order'); // Absolute URL for development
};

const HUB_URL = getHubUrl();

export const useOrderHub = () => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isInitializedRef = useRef(false);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.log('Could not play notification sound:', err);
      });
    } catch (err) {
      console.log('Audio playback error:', err);
    }
  };

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (isInitializedRef.current) {
      console.log('Already initialized, skipping...');
      return;
    }
    isInitializedRef.current = true;
    console.log('Initializing SignalR connection...');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Just increment counter when new order arrives
    connection.on('NewOrder', () => {
      console.log('New order notification received');
      // Get increment directly from store instead of using dependency
      useNotificationStore.getState().increment();
      playNotificationSound();
    });

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log('SignalR connection closed');
      setIsConnected(false);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR connected to OrderHub');
        setIsConnected(true);
      } catch (err) {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      console.log('Cleanup: stopping connection');
      connection.stop();
    };
  }, []); // Empty dependency array - run only once

  return { isConnected };
};
