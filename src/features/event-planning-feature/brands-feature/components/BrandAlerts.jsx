import { useEffect } from "react";
import toast from "react-hot-toast";

export default function BrandAlerts({ errorMessage, successMessage }) {
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        id: "brand-form-error",
        duration: 5000,
        style: {
          background: "#FFFFFF",
          color: "#3D3530",
          border: "1px solid #E5DDD5",
          borderRadius: "8px",
          padding: "14px 16px",
          fontSize: "13px",
          boxShadow: "0 8px 24px -12px rgba(61,53,48,0.20)",
        },
      });
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        id: "brand-form-success",
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#3D3530",
          border: "1px solid #E5DDD5",
          borderRadius: "8px",
          padding: "14px 16px",
          fontSize: "13px",
          boxShadow: "0 8px 24px -12px rgba(61,53,48,0.20)",
        },
      });
    }
  }, [successMessage]);

  return null;
}
