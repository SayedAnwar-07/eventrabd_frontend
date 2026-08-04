import { Building2, MapPin } from "lucide-react";

import map from "@/assets/map.webp";

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;

export default function BookingSlotCard({ slot, brand }) {
  const rows = [
    {
      type: "image",
      label: "Brand",
      value: brand?.brand_name || "Service provider",
      image: brand?.logo,
    },
    {
      icon: Building2,
      label: "Venue Name",
      value: slot?.venue_name || "Venue not provided",
    },
    {
      icon: MapPin,
      label: "Venue Address",
      value: slot?.venue_address || "Address not provided",
    },
  ];

  const mapLink = slot?.google_map_link;

  return (
    <div className="p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {rows.map((row, index) => {
            const Icon = row.icon;

            return (
              <div key={row.label} className="relative flex gap-3">
                {index !== rows.length - 1 && (
                  <span className="absolute left-4 top-10 h-full w-px bg-gray-200 dark:bg-gray-800" />
                )}

                {row.type === "image" ? (
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {row.image ? (
                      <img
                        src={`${CLOUDINARY_URL}/${row.image}`}
                        alt={row.value}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">
                        {row.value?.charAt(0)}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
                    <Icon className="h-4 w-4 text-red-600" />
                  </span>
                )}

                <div className="min-w-0">
                  <p className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                    {row.label}
                  </p>

                  <p className="text-sm font-medium text-gray-950 dark:text-white">
                    {row.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <a
            href={mapLink || undefined}
            target={mapLink ? "_blank" : undefined}
            rel={mapLink ? "noopener noreferrer" : undefined}
            className={`group relative block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 ${
              mapLink ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <img
              src={map}
              alt="Location map"
              className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
            />

            <div className="absolute left-[55%] top-[45%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-40" />

                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow">
              {mapLink ? "Open Google Map" : "Map link unavailable"}
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}