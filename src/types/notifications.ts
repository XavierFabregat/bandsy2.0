export interface NotificationData {
  // Like/Super Like notifications
  like_received?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    interactionId: string;
  };
  super_like_received?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    interactionId: string;
  };
  // Match notifications
  match_created?: {
    matchId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserImage?: string;
    matchScore?: number;
  };
  // Message notifications
  message_received?: {
    conversationId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
  };
  // Profile notifications
  profile_viewed?: {
    viewerId: string;
    viewerName: string;
    viewerImage?: string;
  };
  // Group notifications
  group_invitation?: {
    groupId: string;
    groupName: string;
    inviterId: string;
    inviterName: string;
  };
  // Event notifications
  event_reminder?: {
    eventId: string;
    eventTitle: string;
    startTime: string;
  };
  // System notifications
  system_update?: {
    updateType: string;
    version?: string;
    features?: string[];
  };
}

export type NotificationType = keyof NotificationData;

export interface CreateNotificationParams<T extends NotificationType> {
  userId: string;
  type: T;
  data: NotificationData[T];
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface NotificationTemplate {
  title: string;
  message: string;
  actionUrl?: string;
  actionType?: "navigate" | "modal" | "external";
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  actionUrl?: string;
  actionType?: "navigate" | "modal" | "external";
  isRead: boolean;
  createdAt: Date;
}
