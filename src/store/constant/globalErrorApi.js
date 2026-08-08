import { getApiErrorMessage } from "./getApiErrorMessage";

import { getApiErrorPayload } from "./getApiErrorPayload";

export const handleApiError = (error, options = {}) => {
  const { showToast, setError, defaultMessage } = options;

  const message = getApiErrorMessage(error, defaultMessage);

  const payload = getApiErrorPayload(error);

  /**
   * Optional UI notification
   * Example:
   * react-hot-toast
   */
  if (showToast) {
    showToast(message);
  }

  /**
   * Redux form/server error
   */
  if (setError) {
    setError(payload);
  }

  return {
    message,
    payload,
    status: error?.response?.status ?? null,
  };
};

export default handleApiError;
