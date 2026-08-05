export default function InformationSection({
  title,
  children,
  rightContent,
  className = "",
}) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex min-h-7 items-start justify-between gap-3 pb-2">
        <h2 className="whitespace-nowrap font-serif text-[12px] font-bold uppercase tracking-[0.06em] text-[#b60018]">
          {title}
        </h2>

        {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
      </div>

      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
