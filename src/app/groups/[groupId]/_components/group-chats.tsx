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
import ConversationCard from "./conversation-card";

export default function GroupChats({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <div className="space-y-4 px-4">
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
      <div className="grid gap-4 py-4 md:grid-cols-2 md:px-20 lg:grid-cols-3">
        {group.conversations.length > 0 ? (
          group.conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              group={group}
            />
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
    </div>
  );
}
