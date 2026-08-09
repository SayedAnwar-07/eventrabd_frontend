import { Link } from "react-router-dom";
import { BriefcaseBusiness, KeyRound, Phone, UserRound } from "lucide-react";

const tabs = [
  {
    id: "basic",
    label: "Basic Information",
    icon: UserRound,
  },
  {
    id: "contact",
    label: "Contact Details",
    icon: Phone,
  },
  {
    id: "professional",
    label: "Professional Info",
    icon: BriefcaseBusiness,
  },
];

export default function ProfileEditSidebar({ activeTab, onTabChange }) {
  return (
    <div className="sticky top-8">
      <nav className="space-y-3">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex w-full items-center rounded-md border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-gray-300 bg-gray-50 font-medium dark:border-gray-600 dark:bg-[#151515]"
                  : "hover:bg-gray-50 dark:hover:bg-[#151515]"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />

              {label}
            </button>
          );
        })}

        <Link
          to="/forgot-password"
          className="flex w-full items-center rounded-md border px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#151515]"
        >
          <KeyRound className="mr-3 h-5 w-5" />
          Forgot Password
        </Link>
      </nav>
    </div>
  );
}
