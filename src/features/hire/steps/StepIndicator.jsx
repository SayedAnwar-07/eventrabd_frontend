const StepIndicator = ({ currentStep = 1, hasPackages = false }) => {
  const steps = hasPackages
    ? [
        {
          id: 1,
          title: "Select",
          description: "Booking Type",
        },
        {
          id: 2,
          title: "Package",
          description: "Choose Package",
        },
        {
          id: 3,
          title: "Details",
          description: "Booking Info",
        },
        {
          id: 4,
          title: "Confirm",
          description: "Review",
        },
      ]
    : [
        {
          id: 1,
          title: "Select",
          description: "Booking Type",
        },
        {
          id: 2,
          title: "Details",
          description: "Booking Info",
        },
        {
          id: 3,
          title: "Confirm",
          description: "Review",
        },
      ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const active = currentStep === step.id;
          const completed = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Circle + Text */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-full border-2
                    text-sm font-bold
                    transition-all duration-300

                    ${
                      active
                        ? "border-green-700 bg-green-700 text-white shadow-lg shadow-green-200"
                        : completed
                          ? "border-green-700 bg-green-50 text-green-700"
                          : "border-gray-300 bg-white text-gray-400"
                    }
                  `}
                >
                  {completed ? "✓" : step.id}
                </div>

                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-xs font-semibold

                      ${
                        active || completed ? "text-green-700" : "text-gray-400"
                      }
                    `}
                  >
                    {step.title}
                  </p>

                  <p className="hidden text-[11px] text-gray-400 sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Line */}
              {index !== steps.length - 1 && (
                <div
                  className={`
                    mx-3 h-0.5 flex-1
                    transition-all duration-500

                    ${completed ? "bg-green-700" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
