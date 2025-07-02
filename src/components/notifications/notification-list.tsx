"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Notification } from "@/types/notifications";
import Link from "next/link";

interface Props {
  notifications: Notification[];
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      void markAsRead([notification.id]);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    onClose();
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
              <div
                key={notification.id}
                className={`cursor-pointer p-3 transition-colors hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  {"fromUserImage" in notification.data &&
                    "fromUserName" in notification.data && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={notification.data.fromUserImage as string}
                        />
                        <AvatarFallback>
                          {(notification.data.fromUserName as string)?.[0] ??
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
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
