import {
  Layers,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Phone,
} from "lucide-react";

import { formatWhatsAppNumber } from "@/features/event-planning-feature/brands-feature/utils/Formatters";

const ContactRow = ({ icon: Icon, label, value, href }) => {
  if (!value) return null;

  const content = (
    <div className="flex items-start gap-3 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p
          className="wrap-break-word font-medium text-foreground"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="-mx-2 block rounded-lg px-2 py-1 transition-colors hover:bg-muted/60"
    >
      {content}
    </a>
  );
};

const formatDivision = (value) => {
  if (!value) return "";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const SellerInfo = ({ brand }) => {
  if (!brand) return null;

  const seller = brand?.seller_info;

  if (!seller) return null;

  const whatsappNumber = formatWhatsAppNumber(brand?.whatsapp_number);

  const officeAddress = brand?.office_address?.trim() || "";

  const serviceAreas = Array.isArray(brand?.division)
    ? brand.division.map(formatDivision).join(", ")
    : "";

  return (
    <aside className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="p-5">
        {/* Seller Identity */}
        <div className="flex items-center gap-3">
          {seller?.profile_image_url ? (
            <img
              src={seller.profile_image_url}
              alt={seller?.full_name || "Seller"}
              className="h-12 w-12 shrink-0 rounded-full object-cover object-top ring-2 ring-border"
              loading="lazy"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {seller?.full_name?.trim()?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          <div className="min-w-0">
            <p
              className="truncate font-semibold text-foreground"
              title={seller?.full_name}
            >
              {seller?.full_name || "Seller"}
            </p>

            {brand?.display_name && (
              <p
                className="truncate text-sm text-muted-foreground"
                title={brand.display_name}
              >
                {brand.display_name}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-5 space-y-3">
          <ContactRow
            icon={MapPin}
            label="Office Address"
            value={officeAddress}
          />

          <ContactRow
            icon={MapPinned}
            label="Service Area"
            value={serviceAreas}
          />

          <ContactRow
            icon={Phone}
            label="Phone"
            value={seller?.contact_number}
            href={
              seller?.contact_number
                ? `tel:${seller.contact_number}`
                : undefined
            }
          />
        </div>
      </div>

      {/* WhatsApp */}
      {whatsappNumber && (
        <div className="border-t border-border p-5">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1FBF5C]"
          >
            <MessageCircle className="h-4 w-4" />
            Message on WhatsApp
          </a>
        </div>
      )}
    </aside>
  );
};

export default SellerInfo;
