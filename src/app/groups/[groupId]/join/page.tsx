// this page will have a query param invite with the verification code
import { notFound } from "next/navigation";
import { JoinGroupClient } from "./_components/join-group-client";
import { getGroupInfoForInvite } from "@/server/groups/queries";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { groupId } = await params;
  const { invite } = await searchParams;

  // Get group information without requiring membership
  const group = await getGroupInfoForInvite(groupId);

  if (!group) {
    return notFound();
  }

  return <JoinGroupClient group={group} inviteCode={invite} />;
}
