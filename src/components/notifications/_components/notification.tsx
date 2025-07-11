import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Notification } from "@/types/notifications";

export default function Notification({
  notification,
  markAsRead,
  onClose,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => Promise<void>;
  onClose: () => void;
}) {
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      void markAsRead([notification.id]);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    onClose();
  };

  console.log("notification", notification);

  return (
    <div
      className={`cursor-pointer p-3 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start space-x-3">
        {"fromUserImage" in notification.data &&
          "fromUserName" in notification.data && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.data.fromUserImage as string} />
              <AvatarFallback>
                {(notification.data.fromUserName as string)?.[0] ?? "?"}
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

          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

          <p className="mt-2 text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
