import { Store, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    key: "seller",
    icon: Store,
    title: "Seller",
    subtitle: "List services & reach thousands of clients",
    highlights: [
      "Create service listings",
      "Manage bookings",
      "Grow your business",
    ],
  },
  {
    key: "customer",
    icon: ShoppingBag,
    title: "Customer",
    subtitle: "Find and book event services instantly",
    highlights: ["Browse services", "Book instantly", "Track your orders"],
  },
];

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Join as a…</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose how you want to use the platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                type="button"
                onClick={() => navigate(`/register/${role.key}`)}
                className="group relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>

                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">
                    {role.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {role.subtitle}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {role.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/login"
            className="underline text-primary hover:text-primary/80 transition-colors"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RoleSelector;
