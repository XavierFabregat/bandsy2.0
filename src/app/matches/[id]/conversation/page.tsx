"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Users,
  UserPlus,
  Send,
  Music,
  ArrowLeft,
  MoreVertical,
  UserX,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useConversationStore } from "@/lib/stores/conversationStore";
import { useMediaQuery } from "../../../../lib/hooks/useMediaQuery";
import { toast } from "sonner";
import { useTypingIndicator } from "../../../../lib/hooks/useTypingIndicator";
import { useDebounceImmediate } from "../../../../lib/hooks/useDebounce";

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

  // Handle input changes with typing indicators
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

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
    setNewMessage(""); // Clear input immediately

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
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      const response = await fetch("/api/groups/my-groups");
      if (response.ok) {
        const groups = (await response.json()) as {
          id: string;
          name: string;
        }[];
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
          if (outcome === "unmatch") {
            window.location.href = "/matches";
          } else {
            toast.success("Success! Group created/joined.");
            // Optionally redirect to group page
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

  return (
    <div className="no-scrollbar relative flex h-[100dvh] flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 right-0 z-20 flex w-full items-center gap-3 border-b bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Link href="/matches">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant?.profileImageUrl ?? ""} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {otherParticipant?.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate font-semibold">
            {otherParticipant?.displayName}
          </h1>
          {/* Typing Indicator */}
          <div className="mt-[-5px] flex h-2 flex-col">
            {Object.values(typing).map((typingUser) => {
              return (
                <div key={typingUser.userId}>
                  <span className="text-xs text-gray-500">
                    Typing <span className="animate-pulse">...</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Match Outcomes Drawer */}
          <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-full">
              <DrawerHeader>
                <DrawerTitle>Match Options</DrawerTitle>
              </DrawerHeader>

              <div className="space-y-4 p-6">
                {/* Collaboration Options - Only for invitee */}
                {isInvitee && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-green-600 dark:text-green-400">
                      Ready to Collaborate?
                    </h3>

                    {/* Create New Group */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full"
                      />
                      <Button
                        onClick={() =>
                          handleOutcome("create_group", { groupName })
                        }
                        className="w-full justify-start"
                        disabled={!groupName.trim()}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Create New Group
                      </Button>
                    </div>

                    {/* Invite to Existing Group */}
                    {userGroups.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                          Or invite to existing group:
                        </p>
                        {userGroups.map((group) => (
                          <Button
                            key={group.id}
                            onClick={() =>
                              handleOutcome("join_group", {
                                existingGroupId: group.id,
                                inviteeUserId: otherParticipant?.id,
                              })
                            }
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite to &quot;{group.name}&quot;
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Unmatch - Available to both users */}
                <div className="my-8 space-y-2">
                  <h3 className="font-medium text-red-600 dark:text-red-400">
                    Danger Zone
                  </h3>
                  <Button
                    onClick={() => handleOutcome("unmatch")}
                    variant="outline"
                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Unmatch - End this conversation
                  </Button>
                </div>

                {/* Info for non-invitee */}
                {!isInvitee && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 Wait for {otherParticipant?.displayName} to decide on
                      collaboration options, or continue chatting!
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 pt-0">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Messages Area - Much more padding */}
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
        {messages.map((message, index) => {
          const isOwn = message.senderClerkId === currentUserId;
          return (
            <div
              key={`${message.id}-${index}`}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[75%] items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar - Only show for other person's messages */}
                {!isOwn && (
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={message.senderImage ?? ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {message.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div className="flex flex-col">
                  {/* Sender Name - Only show for other person's messages */}
                  {!isOwn && (
                    <p className="text-muted-foreground mb-1 text-xs font-medium">
                      {message.senderName}
                    </p>
                  )}

                  {/* Message Content */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "rounded-bl-md bg-white shadow-sm dark:bg-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area - Fixed positioning */}
      <div className="fixed right-0 bottom-0 left-0 z-50 w-full border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onBlur={handleInputBlur}
              placeholder="Type a message..."
              className="focus:border-primary rounded-full border-gray-300 bg-gray-50 pr-12 text-base dark:border-gray-600 dark:bg-gray-700"
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
