"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Music, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { CandidateCard } from "./candidate-card";
import type { MatchCandidate } from "@/lib/matching/types/matching-types";

export function DiscoveryInterface({
  initialCandidates,
}: {
  initialCandidates: MatchCandidate[];
}) {
  const [candidates, setCandidates] =
    useState<MatchCandidate[]>(initialCandidates);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const currentCandidate = candidates[currentIndex];

  // Load more candidates when needed
  const loadCandidates = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/discovery?page=1&limit=10");
      const data = (await response.json()) as { candidates?: MatchCandidate[] };

      if (data.candidates && data.candidates.length > 0) {
        setCandidates(data.candidates);
        setCurrentIndex(0);
      } else {
        toast.info("No more candidates available. Check back later!");
      }
    } catch (error) {
      console.error("Failed to load candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!currentCandidate || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/discovery/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: currentCandidate.user.id,
          action: "invite",
          context: "discovery",
          message: inviteMessage.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Collaboration invite sent!</span>
          </div>,
        );
        setShowInviteModal(false);
        setInviteMessage("");
        handleNext();
      } else {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error ?? "Failed to send invite");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
      toast.error("Failed to send collaboration invite");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: "pass" | "invite") => {
    if (!currentCandidate || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/discovery/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: currentCandidate.user.id,
          action,
          context: "discovery",
        }),
      });

      if (response.ok) {
        handleNext();
      } else {
        const error = (await response.json()) as { error?: string };
        toast.error(error.error ?? "Failed to record action");
      }
    } catch (error) {
      console.error("Failed to record action:", error);
      toast.error("Failed to record action");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      void loadCandidates();
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">
            Finding your perfect collaborators...
          </p>
        </div>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Music className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">No more candidates</h3>
          <p className="text-muted-foreground mb-4">
            You&apos;ve seen all available musicians. Check back later for more!
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <CandidateCard
        candidate={currentCandidate}
        onInteraction={handleAction}
      />

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleAction("pass")}
          disabled={isProcessing}
          className="flex-1"
        >
          <X className="mr-2 h-5 w-5" />
          Pass
        </Button>

        <Button
          size="lg"
          onClick={() => setShowInviteModal(true)}
          disabled={isProcessing}
          className="flex-1"
        >
          <Send className="mr-2 h-5 w-5" />
          Send Invite
        </Button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Send Collaboration Invite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-muted-foreground text-sm">
                Send a collaboration invite to{" "}
                <span className="font-medium">
                  {currentCandidate.user.displayName}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Message (optional)
                </label>
                <Textarea
                  placeholder="Hi! I'd love to collaborate with you on some music..."
                  value={inviteMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInviteMessage(e.target.value)
                  }
                  maxLength={500}
                  className="min-h-[100px]"
                />
                <div className="text-muted-foreground mt-1 text-xs">
                  {inviteMessage.length}/500 characters
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteMessage("");
                  }}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
