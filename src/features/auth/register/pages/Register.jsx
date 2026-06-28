import { Outlet, useMatch } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../../../../../public/logo-png.png";

const branding = {
  seller: {
    heading: "Start selling today",
    body: "List your services and reach thousands of clients across Bangladesh.",
  },
  customer: {
    heading: "Discover great services",
    body: "Sign up and book event services in seconds.",
  },
  default: {
    heading: "Join our community",
    body: "Choose how you'd like to use the platform.",
  },
};

const Register = () => {
  const sellerMatch = useMatch("/register/seller");
  const customerMatch = useMatch("/register/customer");

  const role = sellerMatch ? "seller" : customerMatch ? "customer" : "default";
  const { heading, body } = branding[role];

  return (
    <div className="container mx-auto">
      <section className="flex md:flex-row flex-col w-full justify-center min-h-screen">
        {/* Left branding panel */}
        <div className="hidden md:flex flex-col w-full md:w-1/3 justify-center items-center gap-4 px-8 py-10">
          <img
            src={logo}
            className="h-60 w-60 object-contain"
            alt="Eventra BD"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-foreground">{heading}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                {body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — child routes render here */}
        <div className="w-full md:w-2/3 overflow-hidden">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default Register;
