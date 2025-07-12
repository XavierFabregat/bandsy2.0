import { create } from "zustand";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderClerkId: string;
  content: string;
  senderImage: string;
  type: "text" | "audio" | "image";
  fileUrl: string | null;
  createdAt: Date;
  isRead: boolean;
  matchId?: string;
  groupId?: string;
}

interface ConversationState {
  conversations: Record<string, Message[]>;
  typingUsers: Record<
    string,
    Record<
      string,
      {
        userId: string;
        userName: string;
        userImage: string;
      }
    >
  >;
  isLoading: Record<string, boolean>;

  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setTyping: (
    conversationId: string,
    userId: string,
    userName: string,
    userImage: string,
    isTyping: boolean,
  ) => void;
  setLoading: (conversationId: string, loading: boolean) => void;

  // Fetch messages (simple fetch for now)
  fetchMessages: (matchId: string, conversationId: string) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: {},
  typingUsers: {},
  isLoading: {},

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: [
          ...(state.conversations[conversationId] ?? []),
          message,
        ],
      },
    })),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]:
          state.conversations[conversationId]?.filter(
            (m) => m.id !== messageId,
          ) ?? [],
      },
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: messages,
      },
    })),

  setTyping: (conversationId, userId, userName, userImage, isTyping) =>
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] ?? {};
      const newTyping = { ...currentTyping };

      if (isTyping) {
        newTyping[userId] = { userId, userName, userImage };
      } else {
        delete newTyping[userId];
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: newTyping,
        },
      };
    }),

  setLoading: (conversationId, loading) =>
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [conversationId]: loading,
      },
    })),

  fetchMessages: async (matchId, conversationId) => {
    const state = get();

    // Don't fetch if already loading
    if (state.isLoading[conversationId]) return;

    state.setLoading(conversationId, true);

    try {
      const response = await fetch(`/api/matches/${matchId}/conversation`);
      const data = (await response.json()) as { messages: Message[] };
      state.setMessages(conversationId, data.messages ?? []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      state.setLoading(conversationId, false);
    }
  },
}));
