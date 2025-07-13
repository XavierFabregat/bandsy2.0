import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, UserPlus, Users, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import Link from "next/link";

export default function ChatHeader({
  otherParticipant,
  isTyping,
  isMobile,
  isInvitee,
  groupName,
  setGroupName,
  handleOutcome,
  userGroups,
}: {
  otherParticipant: {
    profileImageUrl: string | null;
    displayName: string;
    id: string;
  };
  isTyping: boolean;
  isMobile: boolean;
  isInvitee: boolean;
  groupName: string;
  setGroupName: (name: string) => void;
  handleOutcome: (
    outcome: string,
    data?: {
      groupName?: string;
      existingGroupId?: string;
      inviteeUserId?: string;
    },
  ) => void;
  userGroups: { id: string; name: string }[];
}) {
  return (
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
          {isTyping && (
            <div>
              <span className="text-xs text-gray-500">
                Typing <span className="animate-pulse">...</span>
              </span>
            </div>
          )}
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
  );
}
