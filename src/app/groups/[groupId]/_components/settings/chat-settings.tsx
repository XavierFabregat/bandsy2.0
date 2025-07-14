"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="h-full overflow-y-auto">
      <Accordion
        type="single"
        collapsible
        defaultValue="overview"
        className="w-full space-y-3 px-2 py-2"
      >
        {/* Chat Overview */}
        <AccordionItem value="overview" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium">
            Chat Overview
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Group Chats</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage conversations and notifications
                  </p>
                </div>
                <Dialog open={isCreatingChat} onOpenChange={setIsCreatingChat}>
                  <DialogTrigger asChild>
                    <Button size="sm">
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
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-primary text-xl font-bold sm:text-2xl">
                    {group.conversations?.length || 0}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Total Chats
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 sm:text-2xl">
                    {group.conversations?.filter((c) => c.status === "active")
                      .length || 0}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Active Chats
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Chat List */}
        <AccordionItem value="chats" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium">
            Manage Chats
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Chats</h4>
              <div className="max-h-[250px] overflow-y-auto pr-2">
                <div className="space-y-2">
                  {group.conversations && group.conversations.length > 0 ? (
                    group.conversations.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                            <MessageCircle className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {chat.name}
                              </p>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {chat.messages?.length || 0} messages
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
                    <div className="py-6 text-center">
                      <MessageCircle className="text-muted-foreground mx-auto h-8 w-8 sm:h-12 sm:w-12" />
                      <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                        No chats created yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
