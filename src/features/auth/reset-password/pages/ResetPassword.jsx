import ResetPasswordForm from "../components/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <>
      <SEO
        title="Reset Your Password"
        description="Create a new password for your EventraBD account. Reset your password securely and regain access to your event planning profile."
        noIndex={true}
      />
      <ResetPasswordForm />;
    </>
  );
};

export default ResetPassword;
