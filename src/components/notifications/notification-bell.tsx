"use client";

import { useState, useEffect } from "react";
import { Bell, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsList } from "./notification-list";
import { useNotificationSSE } from "@/lib/hooks/useNotificationsSSE";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const {
    unreadCount,
    notifications,
    isConnected,
    error,
    reconnect,
    requestNotificationPermission,
  } = useNotificationSSE();

  useEffect(() => {
    // Check if Notifications API is supported
    const isNotificationSupported =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator;

    setIsSupported(isNotificationSupported);

    if (isNotificationSupported) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {!isConnected && (
            <WifiOff className="absolute -top-1 -left-1 h-3 w-3 text-red-500" />
          )}
          <Bell className={`h-5 w-5 ${!isConnected ? "text-gray-400" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {!hasPermission && (
          <div className="border-b bg-blue-50 p-3">
            <p className="mb-2 text-sm text-blue-800">
              Enable notifications to stay updated
            </p>
            <Button
              size="sm"
              onClick={handleRequestPermission}
              className="w-full"
            >
              Enable Notifications
            </Button>
          </div>
        )}
        <NotificationsList
          notifications={notifications}
          isConnected={isConnected}
          error={error}
          onReconnect={reconnect}
          onClose={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
