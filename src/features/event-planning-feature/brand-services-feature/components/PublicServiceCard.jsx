import PublicServiceImage from "./PublicServiceImage";
import PublicServiceInfo from "./PublicServiceInfo";

const PublicServiceCard = ({ service }) => {
  return (
    <article className="group overflow-hidden rounded-md border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* ================= IMAGE ================= */}
      <PublicServiceImage service={service} />

      {/* ================= INFORMATION ================= */}
      <PublicServiceInfo service={service} />
    </article>
  );
};

export default PublicServiceCard;
