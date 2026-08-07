import PersonCard from "./PersonCard";

export default function PeopleInformation({ hire, customerRole = "Customer" }) {
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
            person={hire?.seller}
            whatsapp={hire?.brand?.whatsapp_number}
            location={{
              division: hire?.brand?.division,
              district: hire?.brand?.district,
            }}
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
            person={hire?.customer}
            whatsapp={hire?.booking_slots?.[0]?.customer_whatsapp_number}
            location={{
              division: hire?.customer?.division,
              district: hire?.customer?.district,
            }}
            note={hire?.customer_note}
            noteLabel="Customer Note"
          />
        </div>
      </div>
    </section>
  );
}
