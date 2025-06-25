import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserInstruments, getInstruments } from "@/server/queries";
import { InstrumentsForm } from "../instruments-form";

export default async function InstrumentsStep() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch instruments and user instruments in parallel
  const [instruments, userInstruments] = await Promise.all([
    getInstruments(),
    getUserInstruments(userId),
  ]);

  return (
    <InstrumentsForm
      instruments={instruments}
      userInstruments={userInstruments}
    />
  );
}
