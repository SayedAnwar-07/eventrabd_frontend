import SEO from "@/components/seo/SEO";
import { Outlet } from "react-router-dom";

const Register = () => {
  return (
    <main className="min-h-screen text-foreground">
      {/* SEO content */}
      <SEO
        title="Create Your EventraBD Account"
        description="Join EventraBD to discover event planning services, connect with professional service providers, and manage your event planning activities in one place."
        noIndex={true}
      />
      <Outlet />
    </main>
  );
};

export default Register;
