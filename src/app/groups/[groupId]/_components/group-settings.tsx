"use client";

import { Button } from "@/components/ui/button";
import { type getGroupById } from "@/server/groups/queries";
import { Settings } from "lucide-react";
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

export default function GroupSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Group settings");
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[70%] w-[95%]">
        <Tabs defaultValue="general" className="w-full min-w-[90%]">
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
            <DialogDescription>Manage your group settings</DialogDescription>
            <TabsList className="w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="chats">Chats</TabsTrigger>
            </TabsList>
          </DialogHeader>
          <TabsContent value="general">
            <GeneralSettings group={group} />
          </TabsContent>
          <TabsContent value="members">
            <MembersSettings group={group} />
          </TabsContent>
          <TabsContent value="chats">
            <ChatsSettings group={group} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
