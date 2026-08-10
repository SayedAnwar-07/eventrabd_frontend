const TermsConditions = ({  terms, brandName }) => {
  const validTerms = Array.isArray(terms)
    ? terms
        .filter((term) => typeof term === "string" && term.trim().length > 0)
        .map((term) => term.trim())
        .slice(0, 3)
    : [];

  if (validTerms.length === 0) {
    return null;
  }

  return (
    <section className="mb-5 w-full min-w-0 break-inside-avoid">
      <h3 className="font-serif text-sm font-bold text-gray-950">
        {brandName} Terms &amp; Conditions
      </h3>

      <ul className="mt-2 space-y-1.5">
        {validTerms.map((term, index) => (
          <li
            key={`${index}-${term}`}
            className="grid grid-cols-[10px_minmax(0,1fr)] items-start gap-1.5 text-[11px] leading-4 text-gray-600"
          >
            <span aria-hidden="true" className="font-bold text-[#b60018]">
              •
            </span>

            <span className="min-w-0 wrap-break-word">{term}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TermsConditions;
