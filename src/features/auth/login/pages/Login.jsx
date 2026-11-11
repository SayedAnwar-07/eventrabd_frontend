import SEO from "@/components/seo/SEO";
import LoginForm from "@/features/auth/login/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen w-full text-foreground">
      {/* SEO contemnt */}
      <SEO
        title="Log In to EventraBD"
        description="Log in to your EventraBD account to manage your profile, explore event services, connect with service providers, and manage your event planning activities."
        noIndex={true}
      />

      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="w-full text-start">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
