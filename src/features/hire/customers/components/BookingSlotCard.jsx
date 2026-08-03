import { MapPin } from "lucide-react";

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
      icon: MapPin,
      label: "Venue Name",
      value: slot?.venue_name || "Venue not provided",
    },
    {
      icon: MapPin,
      label: "Venue Address",
      value: slot?.venue_address || "Address not provided",
    },
  ];

  return (
    <div className="p-5 sm:p-6">
      <div className="space-y-6">
        {rows.map((row, index) => {
          const Icon = row.icon;

          return (
            <div key={row.label} className="relative flex gap-3">
              {index !== rows.length - 1 && (
                <span className="absolute left-4 top-10 h-full w-px bg-gray-200" />
              )}

              {row.type === "image" ? (
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
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
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <Icon className="h-4 w-4 text-red-600" />
                </span>
              )}

              <div>
                <p className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                  {row.label}
                </p>

                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
