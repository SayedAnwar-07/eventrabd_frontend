export default function InformationRow({
  label,
  value,
  href,
  title,
  compact = false,
}) {
  const content = value || "Not available";
  const isExternalLink = href?.startsWith("http");

  return (
    <div
      className={`grid min-w-0 items-start gap-x-2 ${
        compact
          ? "grid-cols-[84px_minmax(0,1fr)]"
          : "grid-cols-[92px_minmax(0,1fr)]"
      }`}
    >
      <div className="flex items-start justify-between gap-1 pt-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-gray-400">
        <span>{label}</span>
        <span>:</span>
      </div>

      {href && value ? (
        <a
          href={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
          title={title}
          className="min-w-0 wrap-break-word text-[11px] font-medium leading-5 text-gray-700 transition hover:text-[#b60018] hover:underline"
        >
          {content}
        </a>
      ) : (
        <span
          title={title}
          className="min-w-0 wrap-break-word text-[11px] font-medium leading-5 text-gray-700"
        >
          {content}
        </span>
      )}
    </div>
  );
}
