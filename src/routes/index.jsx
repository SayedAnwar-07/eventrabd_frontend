import { RouterProvider, createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

// Public pages
import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/login/pages/Login";
import Register from "@/features/auth/register/pages/Register";
import Verified from "@/features/auth/Verified";
import ForgotPassword from "@/features/auth/forgot-password/pages/ForgotPassword";
import ResetPassword from "@/features/auth/reset-password/pages/ResetPassword";
import RoleSelector from "@/features/auth/register/components/RoleSelector";
import SellerForm from "@/features/auth/register/components/SellerForm";
import CustomerForm from "@/features/auth/register/components/CustomerForm";

// Private route wrapper
import PrivateRoute from "./PrivateRoute";

// Profile pages
import ProfilePage from "@/features/profiles/pages/ProfilePage";
import UpdateProfile from "@/features/profiles/pages/UpdateProfile";

// Event planner pages
import CreateBrandPage from "@/features/event-planning-feature/brands-feature/pages/CreateBrandPage";
import BrandDetailsPage from "@/features/event-planning-feature/brands-feature/pages/BrandDetailsPage";
import EditBrandPage from "@/features/event-planning-feature/brands-feature/pages/EditBrandPage";
import ServiceDetailsPage from "@/features/event-planning-feature/brand-services-feature/pages/ServiceDetailsPage";

// Common pages
import NotFoundPage from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // =========================
      // Public Routes
      // =========================
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
        children: [
          {
            index: true,
            element: <RoleSelector />,
          },
          {
            path: "seller",
            element: <SellerForm />,
          },
          {
            path: "customer",
            element: <CustomerForm />,
          },
        ],
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "verify-otp",
        element: <Verified />,
      },

      // =========================
      // Private Profile Routes
      // =========================
      {
        path: "profile/:slug",
        element: <PrivateRoute element={<ProfilePage />} />,
      },
      {
        path: "profile/:slug/edit",
        element: <PrivateRoute element={<UpdateProfile />} />,
      },

      // =========================
      // Private Event Planner Routes
      // Seller only
      // Keep these before dynamic brand detail route
      // =========================
      {
        path: "event-planner/brands/create",
        element: (
          <PrivateRoute
            element={<CreateBrandPage />}
            allowedRoles={["seller"]}
          />
        ),
      },
      {
        path: "event-planner/brands/:slug/edit",
        element: (
          <PrivateRoute element={<EditBrandPage />} allowedRoles={["seller"]} />
        ),
      },
      {
        path: "event-planner/seller/brands/:slug",
        element: (
          <PrivateRoute
            element={<SellerBrandDetails />}
            allowedRoles={["seller"]}
          />
        ),
      },

      // =========================
      // Public Event Planner Routes
      // =========================
      {
        path: "event-planner/brands/:slug",
        element: <BrandDetailsPage />,
      },
      {
        path: "event-planner/brands/:brandSlug/services/:serviceId/:serviceName",
        element: <ServiceDetailsPage />,
      },

      // =========================
      // Not Found Route
      // Must stay at the end
      // =========================
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function MainRoutes() {
  return <RouterProvider router={router} />;
}
