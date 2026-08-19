import { MapPin, StickyNote } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

const getDivisionLabels = (divisions) => {
  if (!Array.isArray(divisions) || divisions.length === 0) {
    return "";
  }

  if (divisions.includes("whole_bangladesh")) {
    return "Whole Bangladesh";
  }

  return divisions
    .map(
      (value) =>
        DIVISION_OPTIONS.find((division) => division.value === value)?.label ||
        value,
    )
    .join(", ");
};

const getWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("01")) {
    return `88${digits}`;
  }

  return digits;
};

const getInitials = (name) => {
  return String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");
};

export default function PersonCard({
  role,
  person,
  whatsapp,
  location,
  note,
  noteLabel,
}) {
  const whatsappNumber = getWhatsAppNumber(whatsapp);

  const personName = person?.full_name?.trim() || "Not available";

  const divisionText = getDivisionLabels(location?.division);

  const officeAddress = location?.office_address?.trim() || "";

  const isSeller = role?.toLowerCase() === "seller";

  const emptyNoteText = isSeller
    ? "No additional note was provided by the seller."
    : "No additional note was provided by the customer.";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="relative shrink-0">
          {person?.profile_image_url ? (
            <img
              src={person.profile_image_url}
              alt={personName}
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-700"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-base font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700">
              {getInitials(personName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-950 dark:text-white">
              {personName}
            </h3>

            <p
              className={`rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
                isSeller
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              }`}
            >
              {role}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {whatsapp && whatsappNumber && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FaWhatsapp className="h-4 w-4 shrink-0 text-[#25D366]" />

                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all transition-colors hover:text-[#1eaa52] hover:underline"
                >
                  {whatsapp}
                </a>
              </div>
            )}

            {divisionText && (
              <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />

                <span>{divisionText}</span>
              </div>
            )}

            {officeAddress && (
              <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />

                <span className="break-words">{officeAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {note !== undefined && (
        <div className="mt-auto border-t border-gray-100 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-900/40 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-gray-400 dark:text-gray-500" />

            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {noteLabel}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-950">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
              {note || emptyNoteText}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
