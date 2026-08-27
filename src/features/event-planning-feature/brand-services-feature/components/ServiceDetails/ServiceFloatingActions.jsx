import { BriefcaseBusiness, MoreVertical, Pencil, Trash2 } from "lucide-react";

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
    <div className="fixed bottom-20 right-6 z-50 sm:bottom-6 sm:right-24">
      {/* NON OWNER */}
      {!isOwner && (
        <div ref={hireSheetRef}>
          <HireSellerSheet
            service={service}
            trigger={
              <button
                type="button"
                className="relative inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#b60018] px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[#960014]"
              >
                <span className="absolute inset-0 -z-10 animate-ping rounded-md bg-[#b60018]/40" />
                <BriefcaseBusiness className="h-4 w-4" />
                Hire
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
              className="relative flex h-11 w-11 items-center justify-center rounded-md border border-[#b60018] bg-[#b60018] text-white shadow-lg transition hover:bg-[#960014]"
              aria-label="Service actions"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-md bg-[#b60018]/40" />

              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-44 rounded-md"
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
                  className="cursor-pointer gap-2 rounded-md"
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
                  className="cursor-pointer gap-2 rounded-md text-red-600 focus:bg-red-50 focus:text-red-600"
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
