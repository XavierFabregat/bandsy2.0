export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <div>GroupPage {groupId}</div>;
}
