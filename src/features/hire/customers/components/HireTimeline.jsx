import { Check, Circle } from "lucide-react";

import { formatDateTime } from "@/components/shared/utils/date";

export default function HireTimeline({ hire }) {
  const timelineEvents = [
    {
      key: "created_at",
      label: "Hire Order Request",
      value: hire?.created_at,
      completed: Boolean(hire?.created_at),
    },
    {
      key: "accepted_at",
      label: "Seller Request Accepted",
      value: hire?.accepted_at,
      completed: Boolean(hire?.accepted_at),
    },
    {
      key: "invoice",
      label: "Invoice Created",
      value: hire?.invoice?.created_at,
      completed: Boolean(hire?.invoice),
    },
    {
      key: "completed_at",
      label: "Event Completed",
      value: hire?.completed_at,
      completed: Boolean(hire?.completed_at),
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="relative mt-8 flex items-start justify-between">
          <div className="absolute left-0 right-0 top-5 h-px bg-gray-200" />

          {timelineEvents.map((event) => (
            <div
              key={event.key}
              className="relative z-10 flex w-full flex-col items-center text-center"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                  event.completed
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {event.completed ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </span>

              <p
                className={`mt-4 text-sm font-semibold ${
                  event.completed
                    ? "text-gray-950 dark:text-gray-200"
                    : "text-gray-400"
                }`}
              >
                {event.label}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {event.value ? formatDateTime(event.value) : "Pending"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-8 space-y-6 md:hidden">
        {timelineEvents.map((event, index) => (
          <div key={event.key} className="relative flex gap-4">
            {index !== timelineEvents.length - 1 && (
              <span className="absolute left-5 top-10 h-full w-px bg-gray-200" />
            )}

            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                event.completed
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {event.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </span>

            <div>
              <p
                className={`text-sm font-semibold ${
                  event.completed
                    ? "text-gray-950 dark:text-gray-200"
                    : "text-gray-400"
                }`}
              >
                {event.label}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {event.value ? formatDateTime(event.value) : "Pending"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
