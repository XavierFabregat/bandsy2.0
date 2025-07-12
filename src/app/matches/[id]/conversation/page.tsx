"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Add this import
import { Send, Music } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useConversationStore } from "@/lib/stores/conversationStore";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { toast } from "sonner";
import { useTypingIndicator } from "@/lib/hooks/useTypingIndicator";
import { useDebounceImmediate } from "@/lib/hooks/useDebounce";
import MessageBubble from "./_components/message-bubble";
import ChatHeader from "./_components/chat-header";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  senderId: string;
  content: string;
  conversationId?: string;
  matchId?: string;
  groupId?: string;
  senderName: string;
  senderClerkId: string;
  senderImage: string;
  fileUrl: string;
  type: "text" | "image" | "audio";
  createdAt: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  matchId: string;
  participants: {
    id: string;
    clerkId: string;
    displayName: string;
    profileImageUrl: string | null;
  }[];
}

interface MatchFactor {
  location: number;
  genres: number;
  instruments: number;
  skillLevel: number;
  activity: number;
}

interface Match {
  id: string;
  matchFactors: MatchFactor;
  createdAt: Date;
  matchScore: number;
  updatedAt: Date;
  user1: {
    id: string;
    clerkId: string;
    displayName: string;
    profileImageUrl: string | null;
  };
  user2: {
    id: string;
    clerkId: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

export default function MatchConversationPage() {
  const DEBOUNCE_DELAY = 10_000;
  const { user } = useUser();
  const currentUserId = user?.id;
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const {
    conversations,
    typingUsers,
    isLoading,
    setMessages,
    setLoading,
    fetchMessages,
    addMessage,
    removeMessage,
  } = useConversationStore();
  const { startTyping, stopTyping } = useTypingIndicator(
    matchId,
    DEBOUNCE_DELAY,
  );

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [_, ...messages] = conversations[conversation?.id ?? ""] ?? [];
  const typing = typingUsers[matchId] ?? {};
  const loading = isLoading[matchId] ?? false;
  // Debounced typing indicator - stops typing after 2 seconds of no input
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
    setLoading(matchId, true);
    let conversationId = "";
    try {
      const response = await fetch(`/api/matches/${matchId}/conversation`);
      if (response.ok) {
        const data = (await response.json()) as {
          conversation: Conversation;
          messages: Message[];
        };
        setConversation(data.conversation);
        setMessages(data.conversation.id, data.messages);
        conversationId = data.conversation.id;
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(matchId, false);
    }
    return conversationId;
  }, [matchId, setLoading, setMessages]);

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
      senderName: user?.username ?? "You",
      senderImage: user?.imageUrl ?? "",
      content: messageContent,
      matchId,
      type: "text",
      fileUrl: "",
      createdAt: new Date(),
      isRead: false,
    };

    // Add message optimistically
    addMessage(conversation?.id ?? "", optimisticMessage);

    try {
      const response = await fetch(`/api/matches/${matchId}/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        // If failed, remove the optimistic message
        removeMessage(conversation?.id ?? "", optimisticMessage.id);
        setNewMessage(messageContent); // Restore the message in input
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // If failed, remove the optimistic message
      removeMessage(conversation?.id ?? "", optimisticMessage.id);
      setNewMessage(messageContent); // Restore the message in input
      toast.error("Failed to send message");
    }
  }, [
    matchId,
    newMessage,
    currentUserId,
    user,
    removeMessage,
    addMessage,
    conversation,
    isCurrentlyTyping,
    stopTyping,
    cancelStopTyping,
  ]);

  // Handle key press events
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
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

  const fetchUserGroups = useCallback(async () => {
    setLoading(matchId, true);
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const groups = (await response.json()) as {
          id: string;
          name: string;
        }[];
        console.log("groups", groups);
        setUserGroups(groups);
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
    } finally {
      setLoading(matchId, false);
    }
  }, [matchId, setLoading]);

  const fetchMatch = useCallback(async () => {
    setLoading(matchId, true);
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      const data = (await response.json()) as Match;
      setMatch(data);
    } catch (error) {
      console.error("Error fetching match:", error);
    } finally {
      setLoading(matchId, false);
    }
  }, [matchId, setLoading]);

  // Load initial messages
  useEffect(() => {
    void fetchConversation().then((conversationId) => {
      void fetchUserGroups();
      void fetchMatch();
      void fetchMessages(matchId, conversationId);
    });
  }, [matchId, fetchConversation, fetchUserGroups, fetchMatch, fetchMessages]);

  const handleOutcome = useCallback(
    async (
      outcome: string,
      data?: {
        groupName?: string;
        existingGroupId?: string;
        inviteeUserId?: string;
      },
    ) => {
      try {
        const response = await fetch(`/api/matches/${matchId}/outcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outcome, data }),
        });

        if (response.ok) {
          const responseData = (await response.json()) as {
            groupId: string;
          };
          if (outcome === "unmatch") {
            router.replace("/matches");
          } else {
            toast.success("Success! Group created/joined.");
            router.replace(`/groups/${responseData.groupId}`);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error handling outcome:", error);
          toast.error(error.message);
        } else {
          console.error("Error handling outcome:", error);
          toast.error("An unknown error occurred");
        }
      }
    },
    [matchId],
  );

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

  if (!conversation || !match) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Conversation not found</p>
          <Link
            href="/matches"
            className="text-primary mt-2 text-sm hover:underline"
          >
            Back to matches
          </Link>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.clerkId !== currentUserId,
  );

  // Determine if current user is the invitee (the one who was liked, not who initiated)
  const isInvitee = match.user2.clerkId
    ? match.user2.clerkId === currentUserId
    : false;

  const isOtherUserTyping = Object.values(typing).some((typingUser) => {
    return typingUser.userId !== currentUserId;
  });

  return (
    <div className="no-scrollbar relative flex h-[100dvh] flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <ChatHeader
        otherParticipant={otherParticipant!}
        isTyping={isOtherUserTyping}
        isMobile={isMobile}
        isInvitee={isInvitee}
        groupName={groupName}
        setGroupName={setGroupName}
        handleOutcome={handleOutcome}
        userGroups={userGroups}
      />

      {/* Messages Area */}
      <div className="no-scrollbar flex flex-1 flex-col space-y-4 overflow-y-auto p-4 pt-20 pb-20">
        {/* Welcome message */}
        <div className="flex justify-center">
          <div className="max-w-xs rounded-lg bg-yellow-100 px-4 py-2 text-center text-sm dark:bg-yellow-900/30">
            <p className="font-medium">🎵 You matched!</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Start chatting and discuss your collaboration ideas
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
          {" "}
          {/* Changed from items-center to items-end */}
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
