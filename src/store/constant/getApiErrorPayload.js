const stripHtmlResponse = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const titleMatch = value.match(/<title>(.*?)<\/title>/i);

  if (titleMatch?.[1]) {
    return {
      detail: titleMatch[1].trim(),
    };
  }

  if (value.includes("<!DOCTYPE") || value.includes("<html")) {
    return {
      detail:
        "The server returned an HTML error page. Check the backend console.",
    };
  }

  const cleanMessage = value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    detail: cleanMessage || "Server error.",
  };
};

const getApiErrorPayload = (error) => {
  const responseData = error?.response?.data;

  // Preserve DRF field errors, nested serializers, arrays and non_field_errors.
  if (
    responseData !== undefined &&
    responseData !== null &&
    responseData !== ""
  ) {
    return typeof responseData === "string"
      ? stripHtmlResponse(responseData)
      : responseData;
  }

  if (!error?.response) {
    return {
      detail:
        error?.message ||
        "Unable to connect to the server. Check your connection.",
    };
  }

  return {
    detail: error?.message || "Something went wrong.",
  };
};

export default getApiErrorPayload;
