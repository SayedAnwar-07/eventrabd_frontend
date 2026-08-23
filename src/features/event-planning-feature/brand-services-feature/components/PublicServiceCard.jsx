import PublicServiceImage from "./PublicServiceImage";
import PublicServiceInfo from "./PublicServiceInfo";

const PublicServiceCard = ({ service }) => {
  if (!service) {
    return null;
  }

  return (
    <article className="group overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* IMAGE */}
      <PublicServiceImage service={service} />

      {/* INFO */}
      <div className="bg-card">
        <PublicServiceInfo service={service} />
      </div>
    </article>
  );
};

export default PublicServiceCard;
