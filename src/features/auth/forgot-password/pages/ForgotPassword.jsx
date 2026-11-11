import SEO from "@/components/seo/SEO";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <>
      <SEO
        title="Forgot Password? Recover Your Account"
        description="Forgot your EventraBD password? Enter your registered email address to receive password recovery instructions and regain access to your account."
        noIndex={true}
      />
      <ForgotPasswordForm />;
    </>
  );
};

export default ForgotPassword;
