const PRIORITY_ERROR_KEYS = [
  "message",
  "detail",
  "non_field_errors",
  "error",
  "errors",
];

const findFirstErrorMessage = (value, visited = new WeakSet()) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstErrorMessage(item, visited);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return null;
    }

    visited.add(value);

    for (const key of PRIORITY_ERROR_KEYS) {
      if (!(key in value)) {
        continue;
      }

      const message = findFirstErrorMessage(value[key], visited);

      if (message) {
        return message;
      }
    }

    for (const [key, item] of Object.entries(value)) {
      if (PRIORITY_ERROR_KEYS.includes(key)) {
        continue;
      }

      const message = findFirstErrorMessage(item, visited);

      if (message) {
        return message;
      }
    }
  }

  return null;
};

export const getApiErrorMessage = (
  errorOrData,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  const responseData = errorOrData?.response?.data;

  const messageFromResponse = findFirstErrorMessage(responseData);

  if (messageFromResponse) {
    return messageFromResponse;
  }

  const messageFromValue = findFirstErrorMessage(errorOrData);

  if (messageFromValue) {
    return messageFromValue;
  }

  if (typeof errorOrData?.message === "string") {
    return errorOrData.message;
  }

  return fallbackMessage;
};

export default getApiErrorMessage;
