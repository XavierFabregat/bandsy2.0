export interface NotificationData {
  // Like/Super Like notifications
  like_received?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    interactionId: string;
    fromUserDisplayName: string;
  };
  super_like_received?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    interactionId: string;
    fromUserDisplayName: string;
  };
  // Match notifications
  match_created?: {
    matchId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserImage?: string;
    matchScore?: number;
    otherUserDisplayName: string;
  };
  // Message notifications
  message_received?: {
    conversationId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    senderDisplayName: string;
  };
  // Profile notifications
  profile_viewed?: {
    viewerId: string;
    viewerName: string;
    viewerImage?: string;
    viewerDisplayName: string;
  };
  // Group notifications
  group_invitation?: {
    groupId: string;
    groupName: string;
    inviterId: string;
    inviterName: string;
    inviterDisplayName: string;
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
  // Collaboration invite notifications
  collaboration_invite?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    fromUserUsername: string;
    message?: string;
  };
  // Invite accepted notifications
  invite_accepted?: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string;
    fromUserUsername: string;
  };
  // Group member removal notifications
  group_member_removed?: {
    groupId: string;
    groupName: string;
    removedByUserId: string;
    removedByUserName: string;
    removedByUserDisplayName: string;
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
