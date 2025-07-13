"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Notification } from "@/types/notifications";
import { useConversationStore } from "../stores/conversationStore";

export interface SSEEvent {
  type:
    | "connected"
    | "notification"
    | "unread_count"
    | "heartbeat"
    | "match_message"
    | "group_message"
    | "user_typing";
  notification?: Notification;
  count?: number;
  message?: {
    id: string;
    senderId: string;
    content: string;
    conversationId?: string;
    matchId?: string;
    groupId?: string;
    senderName: string;
    senderImage: string;
    senderClerkId: string;
    fileUrl: string;
    type: "text" | "image" | "audio";
    createdAt: Date;
    isRead: boolean;
  };
  typing?: {
    userId: string;
    isTyping: boolean;
    userName: string;
    userImage: string;
    conversationId: string;
  };
  timestamp: string;
}

export function useNotificationSSE() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead);
  }, [notifications]);

  const { addMessage, setTyping, setMessages } = useConversationStore();

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      // Already connected
      return;
    }

    // Attempt to connect
    try {
      const eventSource = new EventSource("/api/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        // Connection established
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        // Receive message from server

        try {
          const data: SSEEvent = JSON.parse(event.data as string) as SSEEvent;

          switch (data.type) {
            case "connected":
              // Connection confirmed
              break;

            case "notification":
              // New notification received
              if (data.notification) {
                setNotifications((prev) => {
                  // Add notification to state
                  return [data.notification!, ...prev.slice(0, 9)];
                });
                setUnreadCount((prev) => prev + 1);

                // Show browser notification if permission granted
                console.log(
                  "Notification permission:",
                  Notification.permission,
                );
                if (Notification.permission === "granted") {
                  new Notification(data.notification.title, {
                    body: data.notification.message,
                    icon: "/favicon.ico",
                    tag: data.notification.id,
                    badge: "/favicon.ico",
                    dir: "ltr",
                  });
                }
              }
              break;

            case "unread_count":
              // Unread count update
              if (typeof data.count === "number") {
                setUnreadCount(data.count);
              }
              break;

            case "match_message":
              console.log("SSE: Match message received", data.message);
              if (!data.message?.conversationId) {
                console.error("SSE: No conversationId in match message");
                throw new Error("No conversationId in match message");
              }
              addMessage(data.message.conversationId, data.message);
              break;

            case "group_message":
              if (!data.message?.conversationId) {
                console.error("SSE: No conversationId in group message");
                throw new Error("No conversationId in group message");
              }
              addMessage(data.message.conversationId, data.message);
              break;

            case "user_typing":
              setTyping(
                data.typing?.conversationId ?? "",
                data.typing?.userId ?? "",
                data.typing?.userName ?? "",
                data.typing?.userImage ?? "",
                data.typing?.isTyping ?? false,
              );
              break;
          }
        } catch (error) {
          console.error("SSE: Error parsing data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE: Connection error:", error);
        setIsConnected(false);

        if (eventSource.readyState === EventSource.CLOSED) {
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000,
            );
            console.log(
              `SSE: Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            setError("Connection failed. Please refresh the page.");
          }
        }
      };
    } catch (error) {
      console.error("SSE: Failed to create EventSource:", error);
      setError("Failed to establish connection");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        // Request permission from user gesture
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return Notification.permission === "granted";
    }
    return false;
  }, []);

  // Initial fetch of unread count and recent notifications
  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
      const data = (await response.json()) as {
        notifications: Notification[];
        unreadCount: number;
      };

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch initial notifications:", error);
    }
  }, []);

  useEffect(() => {
    void fetchInitialData();
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchInitialData]);

  return {
    unreadCount,
    notifications,
    isConnected,
    error,
    unreadNotifications,
    reconnect: connect,
    requestNotificationPermission,
  };
}
