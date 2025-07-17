import { getGroupById } from "@/server/groups/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  Headphones,
  Guitar,
  Drum,
  Piano,
  type LucideProps,
} from "lucide-react";
import { GroupHeader } from "./_components/group-header";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { GroupOverview } from "./_components/group-overview";
import GroupMembers from "./_components/group-members";
import GroupChats from "./_components/group-chats";
import { redirect } from "next/navigation";

// Instrument icon mapping
const instrumentIcons: Record<
  string,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  guitar: Guitar,
  drums: Drum,
  piano: Piano,
  mic: Mic,
  headphones: Headphones,
};

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  try {
    const group = await getGroupById(groupId);
    console.log(group);

    return (
      <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <div className="relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600" />

            {/* Header */}
            <GroupHeader group={group} />
          </div>
        </div>

        {/* Tabs Container - Fixed TabsList + Scrollable Content */}
        <div className="flex-1 overflow-hidden px-20">
          <Tabs defaultValue="overview" className="flex h-full flex-col">
            {/* Fixed TabsList */}
            <div className="flex-shrink-0 bg-transparent px-4 py-4 shadow-sm">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="chats">Chats</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden px-20">
              {/* Overview Tab */}
              <TabsContent
                value="overview"
                className="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
              >
                <GroupOverview group={group} />
              </TabsContent>

              {/* Members Tab */}
              <TabsContent
                value="members"
                className="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
              >
                <GroupMembers group={group} />
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent
                value="chats"
                className="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
              >
                <GroupChats group={group} />
              </TabsContent>

              {/* Events Tab */}
              <TabsContent
                value="events"
                className="h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
              >
                <div className="space-y-6">Implement events here</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    // Handle the case where user is not a member or other errors
    console.error("Error accessing group:", error);
    redirect("/groups");
  }
}
