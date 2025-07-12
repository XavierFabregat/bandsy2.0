import { getMyGroups } from "@/server/groups/queries";
import GroupCard from "./_components/group-card";

export default async function GroupsPage() {
  const myGroups = await getMyGroups();

  return (
    <div className="space-y-6 p-4 md:px-40">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        My Groups
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
