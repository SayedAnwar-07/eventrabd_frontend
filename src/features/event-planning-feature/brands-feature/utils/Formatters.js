export const formatWhatsAppNumber = (number) => {
  if (!number) return "";

  return number.replace(/\D/g, "");
};
