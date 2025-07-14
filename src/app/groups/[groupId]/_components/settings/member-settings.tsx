"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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

export function MembersSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

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
    console.log("TODO: Implement invite member");
    return;
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

  const handleRemoveMember = async (memberId: string) => {
    console.log("TODO: Implement remove member");
    return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `/api/groups/${group.id}/members/${memberId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Member removed successfully");
        window.location.reload();
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
    console.log("TODO: Implement change role");
    return;
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
        window.location.reload();
      } else {
        throw new Error("Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/${group.id}/join`;
    void navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <Accordion
        type="single"
        collapsible
        defaultValue="stats"
        className="w-full space-y-3 px-2 py-2"
      >
        {/* Member Stats */}
        <AccordionItem value="stats" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium">
            Member Stats
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-primary text-xl font-bold sm:text-2xl">
                  {group.groupMembers?.length || 0}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Total Members
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 sm:text-2xl">
                  {group.groupMembers?.filter((m) => m.role === "admin")
                    .length || 0}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Admins
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Invite Section */}
        <AccordionItem value="invite" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium">
            Invite Members
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
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
                onClick={copyInviteLink}
                className="w-full sm:w-auto"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Invite Link
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Member List */}
        <AccordionItem value="members" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium">
            Members
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="relative py-2">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="max-h-[250px] overflow-y-auto pr-2 md:h-[300px]">
              <div className="space-y-2">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const isSelf = member.user.clerkId === user?.id;
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                            <AvatarImage
                              src={member.user.profileImageUrl ?? ""}
                            />
                            <AvatarFallback className="text-xs">
                              {member.user.displayName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {member.user.displayName || "Unknown User"}
                              </p>
                              {member.role === "admin" && (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                              @{member.user.username}
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
                                    handleChangeRole(member.id, "admin")
                                  }
                                >
                                  <Crown className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {member.role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangeRole(member.id, "member")
                                  }
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id)}
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
                  <div className="py-6 text-center">
                    <Users className="text-muted-foreground mx-auto h-8 w-8 sm:h-12 sm:w-12" />
                    <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                      {searchTerm
                        ? "No members found matching your search."
                        : "No members yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
