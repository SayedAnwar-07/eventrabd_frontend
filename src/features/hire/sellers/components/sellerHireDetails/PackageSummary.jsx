export default function PackageSummary({
  packageData,
  bookingTitle,
  bookingPrice,
}) {
  const title =
    bookingTitle || packageData?.package_title || "Selected Package";

  const price = bookingPrice ?? packageData?.package_price;

  const formattedPrice =
    price !== undefined && price !== null && price !== ""
      ? Number(price).toLocaleString("en-US")
      : null;

  return (
    <aside className="h-fit overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
          Package Hire
        </p>

        <h2 className="mt-1 font-semibold text-gray-950 dark:text-white">
          Package Summary
        </h2>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Selected Package
          </p>

          <p className="mt-1 text-base font-semibold text-gray-950 dark:text-white">
            {title}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="text-sm text-gray-500">Package Price</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {formattedPrice ? `৳${formattedPrice}` : "Unavailable"}
          </p>
        </div>
      </div>
    </aside>
  );
}
