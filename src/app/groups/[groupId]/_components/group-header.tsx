import Link from "next/link";
import type { getGroupById } from "@/server/groups/queries";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GroupSettings from "./group-settings";

export async function GroupHeader({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const user = await auth();
  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = group.groupMembers.some(
    (member) => member.user.clerkId === user.userId && member.role === "admin",
  );

  return (
    <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Link href="/groups">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Avatar className="h-10 w-10 items-center justify-center rounded-full">
                <AvatarImage
                  src={group.imageUrl ?? "https://placehold.co/400x400"}
                  className="h-full w-full rounded-full"
                />
              </Avatar>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {group.name}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            {group.description ?? "A collaborative music group"}
          </p>
        </div>

        {isAdmin && <GroupSettings group={group} />}
      </div>
    </div>
  );
}
