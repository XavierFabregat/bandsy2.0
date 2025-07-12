import type { Notification } from "../../types/notifications";

interface SSEConnection {
  write: (data: Uint8Array) => void;
  userId: string;
  connectedAt: Date;
}

export interface SSEMessage {
  type:
    | "notification"
    | "unread_count"
    | "user_typing"
    | "match_message"
    | "group_message";
  notification?: Notification;
  count?: number;
  timestamp: string;
  typing?: {
    userId: string;
    userName: string;
    userImage: string;
    isTyping: boolean;
    conversationId: string;
  };
  message?: {
    id: string;
    senderId: string;
    content: string | null;
    matchId?: string;
    senderName?: string;
    senderImage?: string;
    senderClerkId?: string;
    fileUrl: string | null;
    type: "text" | "image" | "audio";
    createdAt: Date;
    isRead: boolean | null;
    conversationId: string;
    sender?: {
      id: string;
      clerkId: string;
      displayName: string;
      profileImageUrl: string | null;
    };
  };
}

// Use globalThis to persist across module reloads
const globalForSSE = globalThis as unknown as {
  sseConnections: Map<string, SSEConnection> | undefined;
};

// Create or reuse the connections map
const connections =
  globalForSSE.sseConnections ?? new Map<string, SSEConnection>();
globalForSSE.sseConnections = connections;

export interface SSEEvent {
  type: "notification" | "unread_count" | "user_typing";
  notification?: Notification;
  count?: number;
  timestamp: string;
}

export class NotificationSSEService {
  static addConnection(
    userId: string,
    writer: { write: (data: Uint8Array) => Promise<void> },
  ) {
    connections.set(userId, {
      write: (data: Uint8Array) => {
        writer.write(data).catch((error) => {
          console.error(`SSE write error for user ${userId}:`, error);
          connections.delete(userId);
        });
      },
      userId,
      connectedAt: new Date(),
    });
    console.log(
      `SSE: Added connection for user ${userId}. Total: ${connections.size}`,
    );
  }

  static getConnection(userId: string) {
    return connections.get(userId);
  }

  static removeConnection(userId: string) {
    const removed = connections.delete(userId);
    console.log(
      `SSE: Removed connection for user ${userId}. Success: ${removed}. Total: ${connections.size}`,
    );
    return removed;
  }

  static sendToUser(userId: string, data: SSEMessage) {
    console.log(`SSE: Attempting to send to user ${userId}`, data.type);
    console.log(`SSE: Current connections count: ${connections.size}`);

    const connection = connections.get(userId);
    if (!connection) {
      console.log(`SSE: No connection found for user ${userId}`);
      console.log(
        `SSE: Available connections:`,
        Array.from(connections.keys()),
      );
      return false;
    }

    console.log(`SSE: Connection found for user ${userId}`);

    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    try {
      console.log(`SSE: About to write message...`);
      connection.write(encoder.encode(message));
      console.log(
        `SSE: Successfully sent message to user ${userId}:`,
        data.type,
      );
      return true;
    } catch (error) {
      console.error(`SSE: Failed to send to user ${userId}:`, error);
      connections.delete(userId);
      return false;
    }
  }

  static sendNotification(userId: string, notification: Notification) {
    console.log(
      `SSE: Sending notification to user ${userId}:`,
      notification.title,
    );
    return this.sendToUser(userId, {
      type: "notification",
      notification,
      timestamp: new Date().toISOString(),
    });
  }

  static sendUnreadCount(userId: string, count: number) {
    return this.sendToUser(userId, {
      type: "unread_count",
      count,
      timestamp: new Date().toISOString(),
    });
  }

  static getConnectionCount() {
    return connections.size;
  }

  static hasConnection(userId: string) {
    return connections.has(userId);
  }

  static getAllConnections() {
    return Array.from(connections.entries()).map(([userId, conn]) => ({
      userId,
      connectedAt: conn.connectedAt,
    }));
  }

  static sendTypingIndicator(
    userId: string,
    typing: {
      userId: string;
      userName: string;
      userImage: string;
      isTyping: boolean;
      conversationId: string;
    },
  ) {
    console.log(
      `SSE: Sending typing indicator to user ${userId}:`,
      typing.isTyping ? "started" : "stopped",
    );
    return this.sendToUser(userId, {
      type: "user_typing",
      typing,
      timestamp: new Date().toISOString(),
    });
  }

  static sendTypingIndicators(
    otherParticipantsIds: string[],
    typing: {
      userId: string;
      userName: string;
      userImage: string;
      isTyping: boolean;
      conversationId: string;
    },
  ) {
    otherParticipantsIds.forEach((userId) => {
      this.sendToUser(userId, {
        type: "user_typing",
        typing,
        timestamp: new Date().toISOString(),
      });
    });
    return true;
  }

  static sendMatchMessage(
    userId: string,
    message: {
      id: string;
      senderId: string;
      content: string | null;
      matchId?: string;
      senderName?: string;
      senderImage?: string;
      senderClerkId?: string;
      fileUrl: string | null;
      type: "text" | "image" | "audio";
      createdAt: Date;
      isRead: boolean | null;
      conversationId: string;
      sender?: {
        id: string;
        clerkId: string;
        displayName: string;
        profileImageUrl: string | null;
      };
    },
  ) {
    console.log(`SSE: Sending match message to user ${userId}`);
    return this.sendToUser(userId, {
      type: "match_message",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static sendGroupChatMessage(
    otherParticipantsIds: string[],
    message: {
      id: string;
      senderId: string;
      content: string;
      senderName: string;
      senderImage: string;
      senderClerkId: string;
      fileUrl: string | null;
      type: "text" | "image" | "audio";
      createdAt: Date;
      isRead: boolean;
      conversationId: string;
    },
  ) {
    otherParticipantsIds.forEach((userId) => {
      this.sendToUser(userId, {
        type: "group_message",
        message,
        timestamp: new Date().toISOString(),
      });
    });
  }
}
