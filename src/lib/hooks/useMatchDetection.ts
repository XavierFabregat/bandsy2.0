"use client";

import { useState } from "react";
import { recordInteraction } from "@/lib/api";

export function useMatchDetection() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInteraction = async (
    targetUserId: string,
    action: "like" | "pass" | "super_like" | "block",
    context: "search" | "discovery" = "discovery",
    onMatch?: (matchId: string) => void,
  ) => {
    setIsProcessing(true);
    try {
      const result = await recordInteraction(targetUserId, action, context);

      if (result.matchCreated && result.matchId && onMatch) {
        onMatch(result.matchId);
      }

      return result;
    } catch (error) {
      console.error("Error recording interaction:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleInteraction,
    isProcessing,
  };
}
