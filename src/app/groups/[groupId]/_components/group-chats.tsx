import type { getGroupById } from "@/server/groups/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Users,
  Clock,
  Plus,
  Hash,
  Mic,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createGroupChat } from "../_actions/createGroupChat";

export default function GroupChats({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <div className="space-y-4">
      {/* Header with Create Chat Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Group Chats</h3>
          <p className="text-muted-foreground text-sm">
            {group.conversations.length} conversation
            {group.conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Fixed Dialog Structure */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
              <DialogDescription>
                <p>
                  Create a new chat with your group members to collaborate on
                  music projects.
                </p>
              </DialogDescription>
            </DialogHeader>
            <form action={createGroupChat} className="space-y-4">
              <Input type="hidden" name="groupId" value={group.id} />
              <div className="space-y-2">
                <label htmlFor="chatName" className="text-sm font-medium">
                  Chat Name
                </label>
                <Input
                  id="chatName"
                  type="text"
                  placeholder="Enter chat name"
                  name="name"
                  defaultValue={`${group.name} Chat`}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" className="w-full">
                  Create Chat
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {group.conversations.length > 0 ? (
          group.conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/groups/${group.id}/chat/${conversation.id}`}
            >
              <Card className="group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                        <MessageCircle className="text-primary h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base font-semibold">
                          {conversation.name ?? "General Chat"}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {conversation.messages?.length || 0} messages
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Last Message Preview */}
                    {conversation.messages &&
                    conversation.messages.length > 0 ? (
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage
                            src={
                              conversation.messages[0]?.sender
                                ?.profileImageUrl ?? ""
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {conversation.messages[0]?.sender?.displayName?.charAt(
                              0,
                            ) ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-xs font-medium">
                            {conversation.messages[0]?.sender?.displayName ??
                              "Unknown"}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {conversation.messages[0]?.content ??
                              "No messages yet"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">No messages yet</span>
                      </div>
                    )}

                    {/* Chat Stats */}
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {conversation.participants?.length || 0} members
                        </span>
                      </div>
                      {conversation.messages &&
                        conversation.messages.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(
                                conversation.messages[0]?.createdAt ??
                                  Date.now(),
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                  <MessageCircle className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No conversations yet
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm">
                  Start a conversation with your group members to collaborate on
                  music projects.
                </p>
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {group.conversations.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            General
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Voice Chat
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Events
          </Badge>
        </div>
      )}
    </div>
  );
}
