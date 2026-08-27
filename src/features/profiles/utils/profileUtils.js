export const normalizeBangladeshPhoneInput = (value = "") => {
  let digits = String(value).replace(/\D/g, "");

  if (digits.startsWith("880")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("88")) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 11);
};

export const getInitialProfileValues = (user) => ({
  full_name: user?.full_name || "",
  username: user?.username || "",
  bio: user?.bio || "",

  contact_number: normalizeBangladeshPhoneInput(user?.contact_number || ""),

  whatsapp_number: normalizeBangladeshPhoneInput(user?.whatsapp_number || ""),
});

export const getUsernameRemainingDays = (usernameLastChanged) => {
  if (!usernameLastChanged) return 0;

  const lastChanged = new Date(usernameLastChanged);
  const now = new Date();

  const sixtyDays = 60 * 24 * 60 * 60 * 1000;

  const elapsed = now.getTime() - lastChanged.getTime();
  const remaining = sixtyDays - elapsed;

  if (remaining <= 0) return 0;

  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
};

export const getChangedProfileValues = (values, initialValues) => {
  const changes = {};

  Object.keys(values).forEach((key) => {
    const currentValue = values[key] ?? "";
    const initialValue = initialValues[key] ?? "";

    if (currentValue !== initialValue) {
      changes[key] = currentValue;
    }
  });

  return changes;
};

export const getProfileErrorMessage = (payload) => {
  if (!payload) {
    return "Failed to update profile.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (payload.message) {
    return payload.message;
  }

  if (payload.errors && typeof payload.errors === "object") {
    const values = Object.values(payload.errors).flat();

    if (values.length) {
      return values.join(" ");
    }
  }

  const values = Object.values(payload).flat();

  return values.length ? values.join(" ") : "Failed to update profile.";
};
