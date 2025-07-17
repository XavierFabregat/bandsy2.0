import { getGroupById } from "@/server/groups/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  Headphones,
  Guitar,
  Drum,
  Piano,
  Calendar,
  type LucideProps,
} from "lucide-react";
import { GroupHeader } from "./_components/group-header";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { GroupOverview } from "./_components/group-overview";
import GroupMembers from "./_components/group-members";
import GroupChats from "./_components/group-chats";
import { redirect } from "next/navigation";

// Instrument icon mapping
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="flex-shrink-0">
          <GroupHeader group={group} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            {/* Tabs Navigation */}
            <div className="mb-8 flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-4 border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value="chats"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Chats
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Events
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mx-auto max-w-6xl">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="p-6 sm:p-8">
                    <GroupOverview group={group} />
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-0">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="p-6 sm:p-8">
                    <GroupMembers group={group} />
                  </div>
                </div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chats" className="mt-0">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="p-6 sm:p-8">
                    <GroupChats group={group} />
                  </div>
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-0">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="p-6 sm:p-8">
                    <div className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        Events Coming Soon
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Event management features will be available here soon.
                      </p>
                    </div>
                  </div>
                </div>
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
