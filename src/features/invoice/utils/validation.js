export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error?.detail === "string") {
    return error.detail;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
};

export const isPositiveNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
};

export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== "";
};
