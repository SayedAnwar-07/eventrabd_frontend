export default function InformationSection({
  title,
  children,
  rightContent,
  className = "",
}) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 pb-2 sm:min-h-7 sm:flex-nowrap sm:gap-3">
        <h2 className="min-w-0 font-serif text-[11px] font-bold uppercase leading-5 tracking-[0.05em] text-[#b60018] sm:whitespace-nowrap sm:text-[12px] sm:tracking-[0.06em]">
          {title}
        </h2>

        {rightContent ? (
          <div className="max-w-full shrink-0">{rightContent}</div>
        ) : null}
      </div>

      <div className="space-y-2 sm:space-y-2.5">{children}</div>
    </section>
  );
}
