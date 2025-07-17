import { getMyGroups } from "@/server/groups/queries";
import GroupCard from "./_components/group-card";
import { Plus, Users, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function GroupsPage() {
  const myGroups = await getMyGroups();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  My Groups
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Collaborate with musicians and create amazing music together
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {myGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Music className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              No groups yet
            </h3>
            <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
              Join or create your first group to start collaborating with other
              musicians and share your musical journey.
            </p>
            <Button
              size="lg"
              className="border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {myGroups.length}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Groups Joined
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {myGroups.reduce(
                        (sum, group) => sum + group.groupMembers.length,
                        0,
                      )}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total Members
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {
                        myGroups.filter((group) =>
                          group.groupMembers.some(
                            (member) => member.role === "admin",
                          ),
                        ).length
                      }
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Admin Groups
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
