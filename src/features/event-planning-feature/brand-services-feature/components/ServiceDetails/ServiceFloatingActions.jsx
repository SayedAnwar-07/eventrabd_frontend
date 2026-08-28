import { CalendarCheck2, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EventServiceSheet from "../services-create-update/EventServiceSheet";
import ServiceDelete from "../ServiceDelete";

import HireSellerSheet from "@/features/hire/components/HireRequestSheet";

const ServiceFloatingActions = ({
  service,
  brandSlug,
  isOwner,
  hireSheetRef,
  onServiceUpdated,
  onServiceDeleted,
}) => {
  if (!service) return null;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-50 lg:bottom-6 lg:right-28">
      {/* NON OWNER */}
      {!isOwner && (
        <div ref={hireSheetRef}>
          <HireSellerSheet
            service={service}
            trigger={
              <button
                type="button"
                className="relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b60018] px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#960014] active:scale-95"
              >
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#b60018]/30" />

                <CalendarCheck2 className="h-5 w-5" />

                <span>Book Now</span>
              </button>
            }
          />
        </div>
      )}

      {/* OWNER */}
      {isOwner && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#b60018] bg-[#b60018] text-white shadow-lg transition hover:bg-[#960014] active:scale-95"
              aria-label="Service actions"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#b60018]/30" />

              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={10}
            className="w-44 rounded-lg"
          >
            {/* EDIT */}
            <EventServiceSheet
              brandSlug={brandSlug}
              service={service}
              serviceId={service.id}
              serviceName={service.slug || service.service_name}
              onSuccess={onServiceUpdated}
              trigger={
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Service
                </DropdownMenuItem>
              }
            />

            {/* DELETE */}
            <ServiceDelete
              brandSlug={brandSlug}
              serviceId={service.id}
              serviceName={service.slug || service.service_name}
              serviceTitle={
                service.service_display_name || service.service_name
              }
              onSuccess={onServiceDeleted}
              trigger={
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Service
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ServiceFloatingActions;
