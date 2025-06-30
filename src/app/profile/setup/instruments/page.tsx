import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FormError } from "../_components/form-error";
import InstrumentsStep from "../_components/steps/instruments-step";
import { Progress } from "@/components/ui/progress";

export default async function InstrumentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step 2 of 5</span>
          <span className="text-muted-foreground">40%</span>
        </div>
        <Progress value={40} className="h-2" />
      </div>

      {/* Error Display */}
      <FormError />

      {/* Instruments Step */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <span className="text-muted-foreground ml-2">
              Loading instruments...
            </span>
          </div>
        }
      >
        <InstrumentsStep />
      </Suspense>
    </div>
  );
}
