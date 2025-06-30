import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserGenres, getGenres } from "@/server/queries";
import { GenresForm } from "../genres-form";

export default async function GenresStep() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch genres and user genres in parallel
  const [genres, userGenres] = await Promise.all([
    getGenres(),
    getUserGenres(userId),
  ]);

  return <GenresForm genres={genres} userGenres={userGenres} />;
}
