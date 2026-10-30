const StepIndicator = ({
  currentStep = 1,
  highestCompletedStep = 0,
  hasPackages = false,
  supportsPackages = true,
  onStepClick,
}) => {
  const steps = hasPackages
    ? [
        { id: 1, title: "Select", description: "Booking Type" },
        { id: 2, title: "Package", description: "Choose Package" },
        { id: 3, title: "Details", description: "Booking Info" },
        { id: 4, title: "Confirm", description: "Review" },
      ]
    : supportsPackages
      ? [
          { id: 1, title: "Select", description: "Booking Type" },
          { id: 2, title: "Details", description: "Booking Info" },
          { id: 3, title: "Confirm", description: "Review" },
        ]
      : [
          { id: 2, title: "Details", description: "Booking Info" },
          { id: 3, title: "Confirm", description: "Review" },
        ];

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex w-full items-start gap-0">
        {steps.map((step, index) => {
          const active = currentStep === step.id;
          const completed = step.id <= highestCompletedStep;
          const clickable = completed && !active && Boolean(onStepClick);

          return (
            <li
              key={step.id}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {index !== steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4.5 z-0 h-0.5 transition-colors duration-300 sm:left-[calc(50%+20px)] sm:right-[calc(-50%+20px)] sm:top-5 ${
                    step.id <= highestCompletedStep
                      ? "bg-theme-color"
                      : "bg-border"
                  }`}
                />
              )}

              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStepClick?.(step.id)}
                aria-current={active ? "step" : undefined}
                aria-label={`Go to ${step.title} step`}
                className="group relative z-10 flex w-full cursor-pointer flex-col items-center rounded-md px-1 py-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-theme-color/30 focus-visible:ring-offset-2 disabled:cursor-default"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm ${
                    active
                      ? "border-theme-color bg-theme-color text-white shadow-md shadow-theme-color/20"
                      : completed
                        ? "border-theme-color bg-theme-color/10 text-theme-color group-hover:bg-theme-color/20"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {completed ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="mt-2 flex w-full flex-col items-center text-center sm:mt-2.5">
                  <span
                    className={`whitespace-nowrap text-[11px] font-semibold leading-tight transition-colors duration-300 sm:text-xs ${
                      active || completed
                        ? "text-theme-color"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>

                  <span className="mt-1 hidden whitespace-nowrap text-[11px] leading-tight text-muted-foreground md:block">
                    {step.description}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
