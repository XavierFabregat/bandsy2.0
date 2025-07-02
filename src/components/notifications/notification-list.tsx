"use client";

import { Button } from "@/components/ui/button";
import type { Notification as INotification } from "@/types/notifications";
import Link from "next/link";
import Notification from "./_components/notification";

interface Props {
  notifications: INotification[];
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
  onClose: () => void;
}

export function NotificationsList({
  notifications,
  isConnected,
  error,
  onReconnect,
  onClose,
}: Props) {
  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_read",
          notificationIds,
        }),
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      void markAsRead(unreadIds);
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notifications</h3>
          <div
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
        </div>

        <Button size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>

        {error && (
          <Button variant="ghost" size="sm" onClick={onReconnect}>
            Reconnect
          </Button>
        )}
      </div>

      {error && (
        <div className="border-b bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <>
          <div className="divide-y">
            {notifications.map((notification) => (
              <Notification
                key={notification.id}
                notification={notification}
                markAsRead={markAsRead}
                onClose={onClose}
              />
            ))}
          </div>
          <Link href="/notifications" className="w-full">
            <Button variant="link" className="w-full">
              View all notifications
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
