export const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "৳0";
  }

  return `৳${Math.round(amount).toLocaleString("en-US")}`;
};

export const toDecimalString = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "0.00";
  }

  const amount = Number(value);

  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};
