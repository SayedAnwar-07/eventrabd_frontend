const sanitizeHtmlError = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const isHtmlError =
    value.includes("<html") ||
    value.includes("<!DOCTYPE") ||
    value.includes("Traceback (most recent call last)") ||
    value.includes("ImproperlyConfigured") ||
    value.includes("Django") ||
    value.includes("Exception Type:");

  if (isHtmlError) {
    return {
      detail: "Something went wrong on the server. Please try again.",
    };
  }

  return {
    detail: value.replace(/<[^>]*>/g, "").trim(),
  };
};

const getApiErrorPayload = (error) => {
  const responseData = error?.response?.data;

  if (responseData !== undefined && responseData !== null) {
    return typeof responseData === "string"
      ? sanitizeHtmlError(responseData)
      : responseData;
  }

  if (!error?.response) {
    return {
      detail: "Unable to connect to server.",
    };
  }

  return {
    detail: error.message || "Something went wrong.",
  };
};

export default getApiErrorPayload;
export { getApiErrorPayload };
