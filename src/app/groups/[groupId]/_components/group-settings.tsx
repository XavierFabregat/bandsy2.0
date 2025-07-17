"use client";

import { Button } from "@/components/ui/button";
import { type getGroupById } from "@/server/groups/queries";
import { Settings, Users, MessageCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./settings/general-settings";
import { MembersSettings } from "./settings/member-settings";
import ChatsSettings from "./settings/chat-settings";
import { Separator } from "@radix-ui/react-separator";

export default function GroupSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[85vh] max-w-4xl overflow-hidden bg-white p-0 dark:border-slate-700 dark:bg-slate-900">
        <Tabs defaultValue="general" className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <DialogTitle className="text-lg font-semibold">
              Group Settings
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              Manage your group configuration
            </DialogDescription>

            {/* Tab Navigation */}
            <TabsList className="h-fulldark:border-slate-700 w-full flex-shrink-0 justify-start border-slate-200 bg-slate-50 dark:bg-slate-900/50">
              <TabsTrigger
                value="general"
                className="flex items-center gap-2 px-4 py-2"
              >
                <Info className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 px-4 py-2"
              >
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger
                value="chats"
                className="flex items-center gap-2 px-4 py-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chats
              </TabsTrigger>
            </TabsList>
          </DialogHeader>

          <Separator className="border-b border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-700" />

          {/* Scrollable Content Area */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            <TabsContent value="general" className="m-0 p-6">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  General Settings
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configure your group&apos;s basic information and appearance
                </p>
              </div>
              <GeneralSettings group={group} />
            </TabsContent>

            <TabsContent value="members" className="m-0 p-6">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  Member Management
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage group members, roles, and invitations
                </p>
              </div>
              <MembersSettings group={group} />
            </TabsContent>

            <TabsContent value="chats" className="m-0 p-6">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  Chat Settings
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configure group conversations and communication
                </p>
              </div>
              <ChatsSettings group={group} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
