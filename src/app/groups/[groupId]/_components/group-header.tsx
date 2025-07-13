import Link from "next/link";
import type { getGroupById } from "@/server/groups/queries";
import { ArrowLeft, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";

export function GroupHeader({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
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
            <Avatar className="h-10 w-10 items-center justify-center rounded-full">
              <AvatarImage
                src={group.imageUrl ?? "https://placehold.co/400x400"}
                className="h-full w-full rounded-full"
              />
            </Avatar>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {group.name}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            {group.description ?? "A collaborative music group"}
          </p>
        </div>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
