"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  Star,
  MessageCircle,
  Users,
  Calendar,
  Info,
  X,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Notification } from "@/types/notifications";

interface NotificationProps {
  notification: Notification;
  onMarkRead?: (id: string) => Promise<void>;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like_received":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "super_like_received":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "match_created":
      return <Users className="h-4 w-4 text-green-500" />;
    case "message_received":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "group_invitation":
      return <Users className="h-4 w-4 text-purple-500" />;
    case "event_reminder":
      return <Calendar className="h-4 w-4 text-orange-500" />;
    case "system_update":
      return <Info className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "like_received":
      return "border-l-red-500 bg-red-50/50";
    case "super_like_received":
      return "border-l-yellow-500 bg-yellow-50/50";
    case "match_created":
      return "border-l-green-500 bg-green-50/50";
    case "message_received":
      return "border-l-blue-500 bg-blue-50/50";
    case "group_invitation":
      return "border-l-purple-500 bg-purple-50/50";
    case "event_reminder":
      return "border-l-orange-500 bg-orange-50/50";
    default:
      return "border-l-gray-500 bg-gray-50/50";
  }
};

export default function NotificationComponent({
  notification,
  onMarkRead,
  onDelete,
  showActions = true,
  compact = false,
}: NotificationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.isRead && onMarkRead) {
      setIsMarking(true);
      await onMarkRead(notification.id);
      setIsMarking(false);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      if (notification.actionType === "external") {
        window.open(notification.actionUrl, "_blank");
      } else {
        router.push(notification.actionUrl);
      }
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead) {
      setIsMarking(true);
      await onMarkRead(notification.id);
      setIsMarking(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const renderUserAvatar = () => {
    const userData = notification.data;
    if ("fromUserImage" in userData && "fromUserName" in userData) {
      return (
        <Avatar className="h-10 w-10 shadow-sm ring-2 ring-white">
          <AvatarImage
            src={userData.fromUserImage as string}
            alt={userData.fromUserName as string}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
            {(userData.fromUserName as string)?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      );
    }
    return null;
  };

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : "Unknown time";

  if (compact) {
    return (
      <div
        className={`group flex items-center gap-3 border-l-4 p-3 transition-all duration-200 ${getNotificationColor(notification.type)} ${!notification.isRead ? "border-r-4 border-r-blue-400" : ""} ${notification.actionUrl ? "cursor-pointer hover:shadow-md" : ""} ${isMarking ? "opacity-50" : ""} `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="truncate text-xs text-gray-500">
            {notification.message}
          </p>
        </div>

        {!notification.isRead && (
          <Badge variant="secondary" className="text-xs">
            New
          </Badge>
        )}

        <span className="text-xs whitespace-nowrap text-gray-400">
          {timeAgo}
        </span>
      </div>
    );
  }

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 ${!notification.isRead ? "shadow-md ring-2 ring-blue-400/20" : "hover:shadow-md"} ${isMarking ? "opacity-50" : ""} `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* User Avatar or Icon */}
          <div className="flex-shrink-0">
            {renderUserAvatar() ?? (
              <div
                className={`rounded-full p-2 ${getNotificationColor(notification.type).replace("bg-", "bg-").replace("/50", "")} `}
              >
                {getNotificationIcon(notification.type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {notification.message}
                </p>
              </div>

              {/* Status Badge */}
              {!notification.isRead && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-xs text-blue-700"
                >
                  New
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                {getNotificationIcon(notification.type)}
                {timeAgo}
              </span>

              {/* Actions */}
              {showActions && isHovered && (
                <div className="flex items-center gap-1">
                  {!notification.isRead && onMarkRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleMarkRead}
                      disabled={isMarking}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Mark read
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleDelete}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Indicator */}
        {notification.actionUrl && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <span>•</span>
              Click to{" "}
              {notification.actionType === "external"
                ? "open link"
                : "view details"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
