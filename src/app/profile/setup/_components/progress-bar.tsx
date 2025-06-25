interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  completionPercentage,
}: ProgressBarProps) {
  const stepProgress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-6">
      {/* Step Progress */}
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">Step Progress</span>
        <span className="font-medium">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="bg-muted h-2 rounded-full">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${stepProgress}%` }}
        />
      </div>

      {/* Overall Profile Completion */}
      <div className="mt-4 mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">Profile Completion</span>
        <span className="font-medium">{completionPercentage}%</span>
      </div>
      <div className="bg-muted h-2 rounded-full">
        <div
          className="h-2 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
