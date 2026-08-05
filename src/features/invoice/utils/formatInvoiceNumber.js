export const formatInvoiceNumber = (invoiceNumber) => {
  if (!invoiceNumber) {
    return "";
  }

  const normalizedInvoiceNumber = String(invoiceNumber).trim().toUpperCase();

  const match = normalizedInvoiceNumber.match(/^INV-\d{8}/);

  if (match) {
    return match[0];
  }

  return normalizedInvoiceNumber.split("-").slice(0, 2).join("-");
};
