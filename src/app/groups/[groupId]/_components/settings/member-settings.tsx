"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Crown,
  User,
  Search,
  MoreVertical,
  Mail,
  Copy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { type getGroupById } from "@/server/groups/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function MembersSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  // Filter members based on search term
  const filteredMembers =
    group.groupMembers?.filter(
      (member) =>
        member.user.displayName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        member.user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (response.ok) {
        toast.success("Invitation sent successfully");
        setInviteEmail("");
        setIsInviteDialogOpen(false);
      } else {
        throw new Error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateBlankInvite = async () => {
    setIsInviting(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createBlankInvite: true }),
      });

      if (response.ok) {
        const result = (await response.json()) as { inviteLink: string };
        const inviteLink = result.inviteLink;

        // Copy the invite link to clipboard
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Blank invite link copied to clipboard");
        setIsInviteDialogOpen(false);
      } else {
        throw new Error("Failed to create blank invite");
      }
    } catch (error) {
      console.error("Error creating blank invite:", error);
      toast.error("Failed to create blank invite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/groups/${group.id}/members/${memberId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Member removed successfully");
        router.refresh();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleChangeRole = async (
    memberId: string,
    role: "admin" | "member",
  ) => {
    try {
      const response = await fetch(
        `/api/groups/${group.id}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );

      if (response.ok) {
        toast.success("Member role updated successfully");
        router.refresh();
      } else {
        throw new Error("Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
    }
  };

  return (
    <div className="space-y-8">
      {/* Member Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {group.groupMembers?.length || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Members
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
              <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {group.groupMembers?.filter((m) => m.role === "admin").length ||
                  0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Admins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Invite Members
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Add new members to your group
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-around gap-3 sm:flex-row">
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Invite by Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleInviteMember}
                  disabled={isInviting || !inviteEmail.trim()}
                  className="w-full"
                >
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleCreateBlankInvite}
            disabled={isInviting}
            className="w-full sm:w-auto"
          >
            <Copy className="mr-2 h-4 w-4" />
            {isInviting ? "Creating..." : "Create invite link"}
          </Button>
        </div>
      </div>

      {/* Member List */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Members
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage group members and their roles
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white pl-10 dark:bg-slate-900"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const isSelf = member.user.clerkId === user?.id;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
                        <AvatarImage src={member.user.profileImageUrl ?? ""} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 font-semibold text-white">
                          {member.user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="truncate font-medium text-slate-900 dark:text-white">
                            {member.user.displayName || "Unknown User"}
                          </p>
                          {member.role === "admin" && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              <Crown className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {isSelf && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                          @{member.user.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {!isSelf && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.userId, "admin")
                              }
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {member.role === "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.userId, "member")
                              }
                            >
                              <User className="mr-2 h-4 w-4" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setMemberToRemove(member.userId);
                              setIsRemoveDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm
                    ? "No members found matching your search."
                    : "No members yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to remove this member? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRemoveDialogOpen(false);
                  setMemberToRemove(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (memberToRemove) {
                    await handleRemoveMember(memberToRemove);
                  }
                  setIsRemoveDialogOpen(false);
                  setMemberToRemove(null);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
