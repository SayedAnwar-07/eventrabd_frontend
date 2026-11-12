import { MessageCircle, Phone, MapPin } from "lucide-react";

import { formatWhatsAppNumber } from "../../utils/Formatters";

const BrandSidebarPanel = ({ brand }) => {
  if (!brand) return null;

  const seller = brand?.seller_info;

  const whatsappNumber = formatWhatsAppNumber(brand?.whatsapp_number);
  const phoneNumber = seller?.contact_number?.trim() || "";
  const officeAddress = brand?.office_address?.trim() || "";

  const sellerName = seller?.full_name || "Seller";

  const initials = sellerName
    .trim()
    .split(/\s+/)
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const phoneHref = phoneNumber.replace(/[^\d+]/g, "");

  return (
    <aside className="w-full rounded-md border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Seller Identity */}
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="shrink-0 rounded-md">
          {seller?.profile_image_url ? (
            <img
              src={seller.profile_image_url}
              alt={sellerName}
              className="h-16 w-16 rounded-sm object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-lg font-semibold tracking-wide text-foreground">
              {initials || "?"}
            </div>
          )}
        </div>

        {/* Seller Information */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
            {sellerName}
          </h3>

          {officeAddress && (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
              <p className="line-clamp-2 wrap-break-word">{officeAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 h-px w-full bg-border" />

      {/* Contact Actions */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Phone Call */}
        {phoneNumber && (
          <a
            href={`tel:${phoneHref}`}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground transition-all duration-200 hover:border-theme-color hover:bg-muted active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:text-theme-color" />
            {phoneNumber}
          </a>
        )}

        {/* WhatsApp */}
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1fa855] px-3 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#189B4E] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
          >
            <MessageCircle className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
            Chat on WhatsApp
          </a>
        )}
      </div>
    </aside>
  );
};

export default BrandSidebarPanel;
