import { notFound } from "next/navigation";
import { getGroupByHandle } from "@/server/groups/queries";
import { GroupPublicProfile } from "../_components/group-public-profile";

export default async function GroupPublicProfilePage({
  params,
}: {
  params: Promise<{ groupHandle: string }>;
}) {
  const { groupHandle } = await params;

  const group = await getGroupByHandle(groupHandle);

  if (!group) {
    notFound();
  }

  return <GroupPublicProfile group={group} />;
}
