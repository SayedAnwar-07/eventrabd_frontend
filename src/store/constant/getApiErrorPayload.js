const sanitizeHtmlError = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  if (value.includes("<html") || value.includes("<!DOCTYPE")) {
    return {
      detail: "Server returned an invalid response.",
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
