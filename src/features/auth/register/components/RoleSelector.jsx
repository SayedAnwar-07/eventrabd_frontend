import { Link, useNavigate } from "react-router-dom";
import { Store, ShoppingBag, ArrowRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roles = {
  seller: {
    icon: Store,
    title: "Seller",
    subtitle: "List services and reach thousands of clients.",
    highlights: [
      "Create service listings",
      "Manage bookings",
      "Grow your business",
    ],
  },
  customer: {
    icon: ShoppingBag,
    title: "Customer",
    subtitle: "Find and book event services easily.",
    highlights: ["Browse services", "Book services", "Track your orders"],
  },
};

const RoleCard = ({ roleKey, role }) => {
  const navigate = useNavigate();
  const Icon = role.icon;

  return (
    <div className="w-full border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center border border-border bg-background text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-semibold text-foreground">{role.title}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {role.subtitle}
      </p>

      <ul className="mt-5 space-y-2">
        {role.highlights.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 bg-primary" />
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => navigate(`/register/${roleKey}`)}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Continue as {role.title}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const RoleSelector = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Create Account
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            Choose your role
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Select how you want to use the platform
          </p>
        </div>

        <Tabs defaultValue="seller" className="block w-full">
          <TabsList className="flex h-11 w-full">
            <TabsTrigger
              value="seller"
              className="flex-1 text-sm font-semibold"
            >
              Seller
            </TabsTrigger>

            <TabsTrigger
              value="customer"
              className="flex-1 text-sm font-semibold"
            >
              Customer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seller" className="mt-5 w-full">
            <RoleCard roleKey="seller" role={roles.seller} />
          </TabsContent>

          <TabsContent value="customer" className="mt-5 w-full">
            <RoleCard roleKey="customer" role={roles.customer} />
          </TabsContent>
        </Tabs>

        <p className="mt-7 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default RoleSelector;
