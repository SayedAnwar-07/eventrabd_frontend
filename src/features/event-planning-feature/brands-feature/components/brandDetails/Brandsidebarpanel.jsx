import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import { formatWhatsAppNumber } from "../../utils/Formatters";

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

const ContactRow = ({ icon: Icon, label, value, href }) => {
  if (!value) {
    return null;
  }

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

const BrandSidebarPanel = ({ brand }) => {
  if (!brand) {
    return null;
  }

  const seller = brand?.seller_info;

  const whatsappNumber = formatWhatsAppNumber(brand?.whatsapp_number);

  const serviceAreas = getDivisionLabels(brand?.division);

  const officeAddress = brand?.office_address?.trim() || "";

  return (
    <aside className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      {/* Seller identity */}
      {seller && (
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            {seller?.profile_image_url ? (
              <img
                src={seller.profile_image_url}
                alt={seller?.full_name || "Seller"}
                className="h-12 w-12 shrink-0 rounded-full object-cover object-top ring-2 ring-border"
                loading="lazy"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
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

              {serviceAreas && (
                <p
                  className="mt-1 flex items-start gap-1 text-sm text-muted-foreground"
                  title={serviceAreas}
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                  <span className="line-clamp-2">{serviceAreas}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {officeAddress && (
              <ContactRow
                icon={MapPin}
                label="Office Address"
                value={officeAddress}
              />
            )}

            <ContactRow
              icon={Mail}
              label="Email"
              value={seller?.email}
              href={seller?.email ? `mailto:${seller.email}` : undefined}
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
      )}

      {/* WhatsApp CTA */}
      {whatsappNumber && (
        <div className="p-5">
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

export default BrandSidebarPanel;
