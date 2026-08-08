const ERROR_KEYS = ["message", "detail", "non_field_errors", "error", "errors"];

const extractMessage = (value, visited = new WeakSet()) => {
  if (!value) return null;

  if (typeof value === "string") {
    const message = value.trim();

    return message || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractMessage(item, visited);

      if (message) return message;
    }

    return null;
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return null;
    }

    visited.add(value);

    for (const key of ERROR_KEYS) {
      if (value[key]) {
        const message = extractMessage(value[key], visited);

        if (message) return message;
      }
    }

    for (const item of Object.values(value)) {
      const message = extractMessage(item, visited);

      if (message) return message;
    }
  }

  return null;
};

const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const responseData = error?.response?.data;

  return extractMessage(responseData) || extractMessage(error) || fallback;
};

export default getApiErrorMessage;
export { getApiErrorMessage };
