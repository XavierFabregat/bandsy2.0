"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Music, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useConversationStore } from "@/lib/stores/conversationStore";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { toast } from "sonner";
import { useTypingIndicator } from "@/lib/hooks/useTypingIndicator";
import { useDebounceImmediate } from "@/lib/hooks/useDebounce";
import MessageBubble from "./_components/message-bubble";
import type { getGroupChat } from "@/server/conversations/queries";
import type { getGroupById } from "../../../../../server/groups/queries";

interface Message {
  id: string;
  senderId: string;
  content: string;
  conversationId: string;
  groupId: string;
  senderName: string;
  senderClerkId: string;
  senderImage: string;
  fileUrl: string;
  type: "text" | "image" | "audio";
  createdAt: Date;
  isRead: boolean;
}
type Group = Awaited<ReturnType<typeof getGroupById>>;
type Conversation = Awaited<ReturnType<typeof getGroupChat>>;

export default function GroupChatPage() {
  const DEBOUNCE_DELAY = 10_000;
  const { user } = useUser();
  const currentUserId = user?.id;
  const params = useParams();
  const { groupId, chatId } = params as { groupId: string; chatId: string };
  const {
    conversations,
    typingUsers,
    isLoading,
    setMessages,
    setLoading,
    addMessage,
    removeMessage,
  } = useConversationStore();
  const { startTyping, stopTyping } = useTypingIndicator(
    "", // no matchId for group chats
    DEBOUNCE_DELAY,
    true,
    groupId,
    chatId,
  );

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = useMemo(
    () => conversations[chatId] ?? [],
    [conversations, chatId],
  );
  const typing = typingUsers[chatId] ?? {};
  const loading = isLoading[chatId] ?? false;

  // Debounced typing indicator - stops typing after delay of no input
  const {
    immediate: handleStopTyping,
    debounced: debouncedStopTyping,
    cancel: cancelStopTyping,
  } = useDebounceImmediate(
    () => {
      if (isCurrentlyTyping) {
        setIsCurrentlyTyping(false);
        stopTyping();
      }
    },
    DEBOUNCE_DELAY,
    [isCurrentlyTyping, stopTyping],
  );

  function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }

  function resetTextareaSize(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
  }

  // Handle input changes with typing indicators
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      // Auto-resize textarea
      autoResizeTextarea(e.target);

      if (value.trim().length > 0) {
        // Start typing if not already typing
        if (!isCurrentlyTyping) {
          setIsCurrentlyTyping(true);
          startTyping();
        }

        // Reset the stop typing timer
        debouncedStopTyping();
      } else {
        // Empty input - stop typing immediately
        cancelStopTyping();
        if (isCurrentlyTyping) {
          setIsCurrentlyTyping(false);
          stopTyping();
        }
      }
    },
    [
      isCurrentlyTyping,
      startTyping,
      stopTyping,
      debouncedStopTyping,
      cancelStopTyping,
    ],
  );

  const fetchConversation = useCallback(async () => {
    setLoading(chatId, true);
    try {
      const response = await fetch(`/api/groups/${groupId}/chat/${chatId}`);
      if (response.ok) {
        const data = (await response.json()) as {
          conversation: Conversation;
          messages: Message[];
          group: Group;
        };

        if (!data.conversation) return;

        setConversation(data.conversation);
        setGroup(data.group);
        setMessages(data.conversation.id, data.conversation.messages);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(chatId, false);
    }
  }, [chatId, groupId, setLoading, setMessages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    // Stop typing indicator when sending message
    cancelStopTyping();
    if (isCurrentlyTyping) {
      setIsCurrentlyTyping(false);
      stopTyping();
    }

    const messageContent = newMessage.trim();
    if (textareaRef.current) {
      resetTextareaSize(textareaRef.current);
      setNewMessage(""); // Clear input immediately
    }

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      senderId: currentUserId!,
      senderClerkId: currentUserId!,
      senderName: user?.fullName ?? user?.username ?? "You",
      senderImage: user?.imageUrl ?? "",
      content: messageContent,
      conversationId: chatId,
      groupId,
      type: "text",
      fileUrl: "",
      createdAt: new Date(),
      isRead: false,
    };

    // Add message optimistically
    addMessage(chatId, optimisticMessage);

    try {
      const response = await fetch(`/api/groups/${groupId}/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        // If failed, remove the optimistic message
        removeMessage(chatId, optimisticMessage.id);
        setNewMessage(messageContent); // Restore the message in input
        toast.error("Failed to send message", {
          description: "Please try again later",
          dismissible: true,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // If failed, remove the optimistic message
      removeMessage(chatId, optimisticMessage.id);
      setNewMessage(messageContent); // Restore the message in input
      toast.error("Failed to send message");
    }
  }, [
    chatId,
    groupId,
    newMessage,
    currentUserId,
    user,
    removeMessage,
    addMessage,
    isCurrentlyTyping,
    stopTyping,
    cancelStopTyping,
  ]);

  // Handle key press events
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage],
  );

  // Handle input blur - stop typing immediately
  const handleInputBlur = useCallback(() => {
    cancelStopTyping();
    if (isCurrentlyTyping) {
      setIsCurrentlyTyping(false);
      stopTyping();
    }
  }, [isCurrentlyTyping, stopTyping, cancelStopTyping]);

  // Load initial data
  useEffect(() => {
    void fetchConversation();
  }, [fetchConversation]);

  // Add ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-2 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!conversation || !group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Chat not found</p>
          <Link
            href={`/groups/${groupId}`}
            className="text-primary mt-2 text-sm hover:underline"
          >
            Back to group
          </Link>
        </div>
      </div>
    );
  }

  const isOtherUserTyping = Object.values(typing).some((typingUser) => {
    return typingUser.userId !== currentUserId;
  });

  return (
    <div className="no-scrollbar relative flex h-[100dvh] flex-col bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="sticky top-0 right-0 left-0 z-40 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Link href={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">{conversation.name}</h2>
            <p className="text-muted-foreground text-xs">
              {group.groupMembers
                .map((member) => member.user.displayName)
                .join(", ")}
              {isOtherUserTyping && !isMobile ? " • Someone is typing..." : ""}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Music className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="no-scrollbar flex flex-1 flex-col space-y-4 overflow-y-auto p-4 pt-20 pb-20">
        {/* Welcome message */}
        <div className="flex justify-center">
          <div className="max-w-xs rounded-lg bg-blue-100 px-4 py-2 text-center text-sm dark:bg-blue-900/30">
            <p className="font-medium">💬 Welcome to {conversation.name}!</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Start collaborating with your group members
            </p>
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId ?? ""}
          />
        ))}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed positioning */}
      <div className="fixed right-0 bottom-0 left-0 z-50 w-full border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              value={newMessage}
              ref={textareaRef}
              onInput={handleInputChange}
              onKeyDown={handleKeyPress}
              onBlur={handleInputBlur}
              placeholder="Type a message..."
              className="focus:border-primary max-h-32 min-h-[40px] resize-none border-gray-300 bg-gray-50 pr-12 text-base dark:border-gray-600 dark:bg-gray-700"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-full"
            >
              <Music className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={sendMessage}
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
