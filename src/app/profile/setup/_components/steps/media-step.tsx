import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MediaForm } from "../media-form";

export default async function MediaStep() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MediaForm />;
}
