"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  MessageCircle,
  Trash2,
  Plus,
  Edit,
  MoreVertical,
  Archive,
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

export default function ChatsSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateChat = async () => {
    if (!newChatName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChatName }),
      });

      if (response.ok) {
        toast.success("Chat created successfully");
        setNewChatName("");
        setIsCreatingChat(false);
        window.location.reload();
      } else {
        throw new Error("Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chat? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/groups/${group.id}/chats/${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Chat deleted successfully");
        window.location.reload();
      } else {
        throw new Error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div className="space-y-8">
      {/* Chat Overview */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Group Chats</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage conversations and notifications
              </p>
            </div>
          </div>
          <Dialog open={isCreatingChat} onOpenChange={setIsCreatingChat}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chatName">Chat Name</Label>
                  <Input
                    id="chatName"
                    placeholder="Enter chat name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateChat}
                  disabled={isLoading || !newChatName.trim()}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Chat"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chat Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {group.conversations?.length || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Chats
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {group.conversations?.filter((c) => c.status === "active").length || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Active Chats
            </div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Manage Chats</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure and manage your group conversations
            </p>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {group.conversations && group.conversations.length > 0 ? (
              group.conversations.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="truncate font-medium text-slate-900 dark:text-white">
                          {chat.name}
                        </p>
                        <Badge variant={chat.status === "active" ? "default" : "secondary"}>
                          {chat.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {chat.messages?.length || 0} messages
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Created {new Date(chat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          console.log("TODO: Implement edit chat");
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          console.log("TODO: Implement archive chat");
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteChat(chat.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  No chats created yet
                </p>
                <p className="text-sm text-slate-400">
                  Create your first chat to start conversations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
