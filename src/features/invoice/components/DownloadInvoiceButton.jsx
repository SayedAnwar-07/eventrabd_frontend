import { useState } from "react";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const sanitizeFileName = (value) => {
  return String(value || "eventra-invoice")
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-");
};

const DownloadInvoiceButton = ({
  targetRef,
  invoiceNumber,
  disabled = false,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const invoiceElement = targetRef?.current;

    if (!invoiceElement || downloading || disabled) {
      return;
    }

    setDownloading(true);

    const fileName = `${sanitizeFileName(invoiceNumber)}.pdf`;

    const options = {
      margin: [8, 8, 8, 8],

      filename: fileName,

      image: {
        type: "jpeg",
        quality: 0.98,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },

      pagebreak: {
        mode: ["css", "legacy"],
        avoid: ["tr", ".invoice-summary", ".invoice-information"],
      },
    };

    try {
      await html2pdf().set(options).from(invoiceElement).save();
    } catch (error) {
      console.error("Invoice PDF download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || downloading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download className="h-4 w-4" />

      {downloading ? "Preparing PDF..." : "Download Invoice"}
    </button>
  );
};

export default DownloadInvoiceButton;
