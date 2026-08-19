import PersonCard from "./PersonCard";

export default function PeopleInformation({ hire, customerRole = "Customer" }) {
  const seller = hire?.seller;
  const customer = hire?.customer;
  const brand = hire?.brand;

  const sellerLocation = {
    division: Array.isArray(brand?.division) ? brand.division : [],
    office_address: brand?.office_address || "",
  };

  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-5">
        {/* Seller Information */}
        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Seller Information
            </p>

            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          <PersonCard
            role="Seller"
            person={seller}
            whatsapp={brand?.whatsapp_number}
            location={sellerLocation}
            note={hire?.seller_note}
            noteLabel="Seller Note"
          />
        </div>

        {/* Customer Information */}
        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Customer Information
            </p>

            <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          <PersonCard
            role={customerRole}
            person={customer}
            whatsapp={hire?.customer_whatsapp_number}
            note={hire?.customer_note}
            noteLabel="Customer Note"
          />
        </div>
      </div>
    </section>
  );
}
