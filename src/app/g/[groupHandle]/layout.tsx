import { getGroupByHandle } from "@/server/groups/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupHandle: string }>;
}) {
  const { groupHandle } = await params;
  const group = await getGroupByHandle(groupHandle);

  if (!group) {
    return {
      title: "Group Not Found",
      description: "This group does not exist.",
    };
  }

  return {
    title: `${group.name} - Bandsy`,
    description: group.description ?? `Check out ${group.name} on Bandsy`,
    openGraph: {
      title: group.name,
      description: group.description ?? `Check out ${group.name} on Bandsy`,
      images: group.imageUrl ? [group.imageUrl] : [],
    },
  };
}

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
