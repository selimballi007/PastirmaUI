import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296/api/';
const HUB_URL = API_URL.replace('/api/', '/hubs/order');

interface OrderNotification {
  orderId: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  timestamp: string;
}

interface OrderStatusUpdate {
  orderId: number;
  status: string;
  timestamp: string;
}

export const useOrderHub = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Create connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Set up event handlers
    connection.on('NewOrderCreated', (orderData: OrderNotification & { id: number; userName?: string; guestName?: string }) => {
      console.log('New order received:', orderData);

      const notification: OrderNotification = {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        customerName: orderData.userName || orderData.guestName || 'Misafir',
        totalAmount: orderData.totalAmount,
        timestamp: new Date().toISOString(),
      };

      setNotifications(prev => [notification, ...prev]);

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Yeni Sipariş!', {
          body: `${notification.customerName} - ${notification.totalAmount.toFixed(2)} TL`,
          icon: '/logo.png',
        });
      }
    });

    connection.on('OrderStatusChanged', (update: OrderStatusUpdate) => {
      console.log('Order status changed:', update);
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

    // Start connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR connected to OrderHub');
        setIsConnected(true);
      } catch (err) {
        console.error('SignalR connection error:', err);
        setIsConnected(false);
        // Retry after 5 seconds
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    isConnected,
    notifications,
    clearNotifications,
    requestNotificationPermission,
  };
};
