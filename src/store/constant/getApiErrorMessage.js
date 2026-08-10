const ERROR_KEYS = ["message", "detail", "non_field_errors", "error", "errors"];

const extractMessage = (value, visited = new WeakSet()) => {
  if (!value) return null;

  if (typeof value === "string") {
    const isHtml =
      value.includes("<html") ||
      value.includes("<!DOCTYPE") ||
      value.includes("Traceback") ||
      value.includes("Exception Type:");

    if (isHtml) {
      return "Something went wrong on the server. Please try again.";
    }

    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractMessage(item, visited))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return null;
    }

    visited.add(value);

    for (const key of ERROR_KEYS) {
      if (value[key]) {
        const message = extractMessage(value[key], visited);

        if (message) {
          return message;
        }
      }
    }

    for (const item of Object.values(value)) {
      const message = extractMessage(item, visited);

      if (message) {
        return message;
      }
    }
  }

  return null;
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!error) {
    return fallback;
  }

  const data = error?.response?.data;

  if (!error.response) {
    return "Network error. Please try again.";
  }

  return extractMessage(data) || fallback;
};

export default getApiErrorMessage;
