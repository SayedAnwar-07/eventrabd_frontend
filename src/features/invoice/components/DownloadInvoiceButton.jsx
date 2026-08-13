import { useState } from "react";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const sanitizeFileName = (value) => {
  return String(value || "eventra-invoice")
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-");
};

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }),
  );
};

const waitForClonedStylesheets = (clonedDocument) => {
  const linkPromises = Array.from(
    clonedDocument.querySelectorAll('link[rel="stylesheet"]'),
  ).map((link) => {
    if (link.sheet) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 2000);
    });
  });

  const clonedWindow = clonedDocument.defaultView;

  const framePromise = new Promise((resolve) => {
    if (clonedWindow?.requestAnimationFrame) {
      clonedWindow.requestAnimationFrame(() =>
        clonedWindow.requestAnimationFrame(resolve),
      );
    } else {
      setTimeout(resolve, 100);
    }
  });

  return Promise.all([...linkPromises, framePromise]);
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

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(invoiceElement);

      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      const options = {
        margin: [0, 0, 0, 0],

        filename: fileName,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 1440,
          windowHeight: 1800,

          scrollX: 0,
          scrollY: 0,

          onclone: (clonedDocument) => {
            const clonedInvoice = clonedDocument.querySelector(
              '[data-invoice-pdf="true"]',
            );

            if (!clonedInvoice) {
              return waitForClonedStylesheets(clonedDocument);
            }

            const clonedContainer = clonedDocument.querySelector(
              '[data-invoice-preview-container="true"]',
            );
            const clonedFrame = clonedDocument.querySelector(
              '[data-invoice-preview-frame="true"]',
            );
            const clonedScaler = clonedDocument.querySelector(
              '[data-invoice-preview-scaler="true"]',
            );

            if (clonedContainer) {
              clonedContainer.style.overflow = "visible";
              clonedContainer.style.width = "210mm";
            }

            if (clonedFrame) {
              clonedFrame.style.width = "210mm";
              clonedFrame.style.height = "297mm";
            }

            if (clonedScaler) {
              clonedScaler.style.width = "210mm";
              clonedScaler.style.height = "297mm";
              clonedScaler.style.transform = "none";
            }

            clonedInvoice.style.width = "210mm";
            clonedInvoice.style.minWidth = "210mm";
            clonedInvoice.style.maxWidth = "210mm";

            clonedInvoice.style.height = "297mm";
            clonedInvoice.style.minHeight = "297mm";
            clonedInvoice.style.maxHeight = "297mm";

            clonedInvoice.style.padding = "8mm 12mm";
            clonedInvoice.style.margin = "0";

            clonedInvoice.style.boxSizing = "border-box";
            clonedInvoice.style.overflow = "hidden";

            clonedInvoice.style.transform = "none";
            clonedInvoice.style.backgroundColor = "#ffffff";
            return waitForClonedStylesheets(clonedDocument);
          },
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },

        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            "tr",
            ".invoice-summary",
            ".invoice-information",
            ".invoice-section",
          ],
        },
      };

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
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#b60018] px-4 text-xs font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-auto sm:px-6 sm:text-sm"
    >
      <Download className="h-4 w-4 shrink-0" />

      {downloading ? "Preparing PDF..." : "Download Invoice"}
    </button>
  );
};

export default DownloadInvoiceButton;
