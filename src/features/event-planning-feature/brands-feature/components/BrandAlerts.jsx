import StatusAlert from "@/components/shared/status-alert";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

export default function BrandAlerts({ errorMessage, successMessage }) {
  return (
    <>
      {errorMessage && <GlobalErrorMessage error={errorMessage} />}

      {successMessage && (
        <StatusAlert type="success" title="Success" message={successMessage} />
      )}
    </>
  );
}
