export const PACKAGE_SUPPORTED_SERVICE_TYPES = ["photography", "videography"];

export const BASIC_PACKAGE_LIMIT = 3;

export const MAX_SHORT_INFO_ITEMS = 3;
export const MAX_SHORT_INFO_LENGTH = 120;

export const supportsPackages = (serviceName) =>
  PACKAGE_SUPPORTED_SERVICE_TYPES.includes(serviceName);

export const getPackageLimit = (membershipType) => {
  const membership = membershipType || "basic";

  if (membership === "basic") {
    return BASIC_PACKAGE_LIMIT;
  }

  // For now Pro / Plus are not limited on frontend.
  if (membership === "pro" || membership === "plus") {
    return null;
  }

  // Unknown / missing membership = Basic
  return BASIC_PACKAGE_LIMIT;
};

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
