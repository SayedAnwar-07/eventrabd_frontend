import { MapPin, StickyNote } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const capitalize = (value) => {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export default function PersonCard({
  role,
  person,
  whatsapp,
  location = "Bangladesh",
  note,
  noteLabel,
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <img
          src={person?.profile_image_url}
          alt={person?.full_name || role}
          className="h-16 w-16 rounded-full object-cover"
        />

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-950 dark:text-white">
              {person?.full_name || "Not available"}
            </h3>

            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              {role}
            </span>
          </div>

          {whatsapp && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FaWhatsapp className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />

              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#25D366] hover:underline"
              >
                {whatsapp}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />

            <span>
              {capitalize(location?.division)}, {capitalize(location?.district)}
            </span>
          </div>
        </div>
      </div>

      {note && (
        <div className="mt-4">
          <div className="mb-1 ml-2 flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />

            <p className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
              {noteLabel}
            </p>
          </div>

          <div className="mt-2 flex min-h-16 items-start rounded-md bg-gray-50 px-4 py-3 dark:bg-gray-900">
            <p className="text-sm leading-5 text-gray-700 dark:text-gray-300">
              {note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
