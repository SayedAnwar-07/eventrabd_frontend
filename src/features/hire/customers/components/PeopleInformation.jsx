import PersonCard from "./PersonCard";

export default function PeopleInformation({ hire }) {
  return (
    <section className="relative">
      <div className="flex flex-col md:flex-row gap-8 md:items-start">
        <div className="flex flex-1 flex-col">
          <p className="mb-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
            Seller Information
          </p>

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

        <div className="flex flex-1 flex-col">
          <p className="mb-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
            Customer Information
          </p>

          <PersonCard
            role="You"
            person={hire?.customer}
            whatsapp={hire?.booking_slots?.[0]?.customer_whatsapp_number}
            location={{
              division: hire?.brand?.division,
              district: hire?.brand?.district,
            }}
            note={hire?.customer_note}
            noteLabel="My Note"
          />
        </div>
      </div>
    </section>
  );
}
