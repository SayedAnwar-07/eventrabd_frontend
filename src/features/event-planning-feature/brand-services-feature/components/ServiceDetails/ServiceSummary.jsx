import { Phone, Clock3, Wallet, MessageCircle } from "lucide-react";

const ServiceSummary = ({ service, formatServiceName }) => {
  const sellerPhone =
    service?.brand?.seller?.contact_number ||
    service?.brand?.contact_number ||
    "";

  const whatsappNumber = sellerPhone.replace(/\D/g, "");

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;

  return (
    <div className="p-6 border rounded-md shadow-md">
      <p className="text-sm text-muted-foreground">Summary</p>

      <h2 className="mt-3 text-2xl font-bold">
        {formatServiceName(service.service_name)}
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">Price</p>

            <p className="font-semibold">৳{service.shift_charge}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock3 className="h-5 w-5 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">Shift Hour</p>

            <p className="font-semibold">
              {service.shift_hour
                ? `${service.shift_hour} hours`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">Seller WhatsApp</p>

            <p className="font-semibold">{sellerPhone || "Not available"}</p>
          </div>
        </div>
      </div>

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          Contact Seller
        </a>
      )}
    </div>
  );
};

export default ServiceSummary;
