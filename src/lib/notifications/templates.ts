import type {
  NotificationData,
  NotificationType,
  NotificationTemplate,
} from "@/types/notifications";

export function getNotificationTemplate<T extends NotificationType>(
  type: T,
  data: NotificationData[T],
): NotificationTemplate {
  switch (type) {
    case "like_received":
      const likeData = data as NotificationData["like_received"];
      return {
        title: "Someone liked you!",
        message: `${likeData?.fromUserName} liked your profile`,
        actionUrl: `/u/${likeData?.fromUserDisplayName}`,
        actionType: "navigate",
      };

    case "super_like_received":
      const superLikeData = data as NotificationData["super_like_received"];
      return {
        title: "Someone super liked you! ⭐",
        message: `${superLikeData?.fromUserName} super liked your profile`,
        actionUrl: `/u/${superLikeData?.fromUserDisplayName}`,
        actionType: "navigate",
      };

    case "match_created":
      const matchData = data as NotificationData["match_created"];
      return {
        title: "New Match! 🎉",
        message: `You matched with ${matchData?.otherUserName}`,
        actionUrl: `/matches/${matchData?.matchId}`,
        actionType: "navigate",
      };

    case "message_received":
      const messageData = data as NotificationData["message_received"];
      return {
        title: "New Message",
        message: `${messageData?.senderName}: ${messageData?.messagePreview}`,
        actionUrl: `/conversations/${messageData?.conversationId}`,
        actionType: "navigate",
      };

    case "profile_viewed":
      const viewData = data as NotificationData["profile_viewed"];
      return {
        title: "Profile View",
        message: `${viewData?.viewerName} viewed your profile`,
        actionUrl: `/u/${viewData?.viewerDisplayName}`,
        actionType: "navigate",
      };

    case "group_invitation":
      const groupData = data as NotificationData["group_invitation"];
      return {
        title: "Group Invitation",
        message: `${groupData?.inviterName} invited you to join ${groupData?.groupName}`,
        actionUrl: `/groups/${groupData?.groupId}/invite`,
        actionType: "modal",
      };

    case "event_reminder":
      const eventData = data as NotificationData["event_reminder"];
      return {
        title: "Event Reminder",
        message: `${eventData?.eventTitle} starts soon`,
        actionUrl: `/events/${eventData?.eventId}`,
        actionType: "navigate",
      };

    case "system_update":
      const systemData = data as NotificationData["system_update"];
      return {
        title: "System Update",
        message: `New features available! ${systemData?.features?.join(", ")}`,
        actionUrl: "/updates",
        actionType: "navigate",
      };

    case "collaboration_invite":
      const inviteData = data as NotificationData["collaboration_invite"];
      return {
        title: "Collaboration Invite",
        message: `${inviteData?.fromUserName} wants to collaborate with you${inviteData?.message ? `: "${inviteData.message}"` : ""}`,
        actionUrl: `/invites`,
        actionType: "navigate",
      };

    case "invite_accepted":
      const acceptData = data as NotificationData["invite_accepted"];
      return {
        title: "Invite Accepted! 🎉",
        message: `${acceptData?.fromUserName} accepted your collaboration invite`,
        actionUrl: `/u/${acceptData?.fromUserUsername}`,
        actionType: "navigate",
      };

    case "group_member_removed":
      const removalData = data as NotificationData["group_member_removed"];
      return {
        title: "Removed from Group",
        message: `You were removed from ${removalData?.groupName} by ${removalData?.removedByUserName}`,
        actionUrl: `/groups`,
        actionType: "navigate",
      };

    default:
      return {
        title: "Notification",
        message: "You have a new notification",
      };
  }
}
