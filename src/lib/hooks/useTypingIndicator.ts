import { useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export const useTypingIndicator = (matchId: string, delay: number) => {
  const { user } = useUser();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!user) return;

      try {
        await fetch(`/api/matches/${matchId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping }),
        });
      } catch (error) {
        console.error("Failed to send typing indicator:", error);
      }
    },
    [matchId, user],
  );

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      void sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after delay
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      void sendTypingIndicator(false);
    }, delay);
  }, [sendTypingIndicator, delay]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      void sendTypingIndicator(false);
    }
  }, [sendTypingIndicator]);

  return { startTyping, stopTyping };
};
