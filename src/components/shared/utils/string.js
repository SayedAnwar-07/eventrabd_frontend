export function formatServiceName(name = "") {
  return name

    .replaceAll("_", " ")

    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function initials(name = "") {
  return name

    .split(" ")

    .filter(Boolean)

    .slice(0, 2)

    .map((word) => word[0])

    .join("")

    .toUpperCase();
}

export function capitalize(value = "") {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
