export default function InformationRow({
  label,
  value,
  href,
  title,
  compact = false,
}) {
  const content = value || "Not available";
  const isExternalLink = href?.startsWith("http");

  const columnStyle = compact
    ? "grid-cols-[76px_minmax(0,1fr)] sm:grid-cols-[84px_minmax(0,1fr)]"
    : "grid-cols-[76px_minmax(0,1fr)] sm:grid-cols-[92px_minmax(0,1fr)]";

  const contentClassName =
    "min-w-0 break-words [overflow-wrap:anywhere] text-[10px] font-medium leading-4 text-gray-700 sm:text-[11px] sm:leading-5";

  return (
    <div
      className={`grid min-w-0 items-start gap-x-2 sm:gap-x-2.5 ${columnStyle}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-1 pt-0.5 text-[9px] font-bold uppercase leading-4 tracking-[0.03em] text-gray-400 sm:text-[10px] sm:tracking-[0.04em]">
        <span className="min-w-0 wrap-break-word">{label}</span>
        <span className="shrink-0">:</span>
      </div>

      {href && value ? (
        <a
          href={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
          title={title}
          className={`${contentClassName} transition hover:text-[#b60018] hover:underline`}
        >
          {content}
        </a>
      ) : (
        <span title={title} className={contentClassName}>
          {content}
        </span>
      )}
    </div>
  );
}
