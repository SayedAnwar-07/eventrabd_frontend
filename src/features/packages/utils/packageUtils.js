export const PACKAGE_SUPPORTED_SERVICE_TYPES = ["photography", "videography"];

export const supportsPackages = (serviceName) =>
  PACKAGE_SUPPORTED_SERVICE_TYPES.includes(serviceName);

export const formatPackagePrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "৳0";
  }

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
