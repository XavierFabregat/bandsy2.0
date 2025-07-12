"use client";

import type { getMyGroups } from "@/server/groups/queries";
import { ArrowRight, Dot } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function GroupCard({
  group,
}: {
  group: Awaited<ReturnType<typeof getMyGroups>>[number];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <Link href={`/groups/${group.id}`}>
        <div className="from-primary/20 hover:from-primary/20 flex flex-row items-center justify-between rounded-lg bg-gradient-to-r to-cyan-500/20 p-4 hover:bg-gradient-to-r hover:to-cyan-500/20">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {group.name}
          </h2>
          <div className="gap-2">
            <ArrowRight className="text-accent-foreground h-5 w-5" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="from-primary/20 hover:from-primary/20 bg-gradient-to-r to-cyan-500/20 p-4 hover:bg-gradient-to-r hover:to-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {group.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {group.description}
            </p>
            <ArrowRight className="text-accent-foreground h-5 w-5" />
          </div>
          <div className="mt-10 flex flex-row items-center justify-center gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {group.groupMembers.length} members
            </p>
            <Dot className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {group.groupMembers
                .map((member) => member.user.displayName)
                .join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
