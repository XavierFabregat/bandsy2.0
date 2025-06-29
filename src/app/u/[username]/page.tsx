import { notFound } from "next/navigation";
import { getUserByUsername, getUserSamples } from "@/server/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Profile from "../_components/profile";
import Gallery from "../_components/gallery";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const samples = await getUserSamples(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user.displayName}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>
      <Tabs defaultValue="profile" className="mb-8 flex flex-col items-center">
        <TabsList className="mb-5 flex w-full justify-center sm:w-1/4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Profile user={user} />
        </TabsContent>
        <TabsContent value="gallery" className="h-full w-full">
          <Gallery samples={samples} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
