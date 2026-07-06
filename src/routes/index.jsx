import { RouterProvider, createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/login/pages/Login";
import Register from "@/features/auth/register/pages/Register";
import Verified from "@/features/auth/Verified";
import ForgotPassword from "@/features/auth/forgot-password/pages/ForgotPassword";
import ResetPassword from "@/features/auth/reset-password/pages/ResetPassword";
import PrivateRoute from "./PrivateRoute";
import RoleSelector from "@/features/auth/register/components/RoleSelector";
import SellerForm from "@/features/auth/register/components/SellerForm";
import CustomerForm from "@/features/auth/register/components/CustomerForm";
import CreateBrandPage from "@/features/event-planning-feature/brands-feature/pages/CreateBrandPage";
import ProfilePage from "@/features/profiles/pages/ProfilePage";
import UpdateProfile from "@/features/profiles/pages/UpdateProfile";
import BrandDetailsPage from "@/features/event-planning-feature/brands-feature/pages/BrandDetailsPage";
import EditBrandPage from "@/features/event-planning-feature/brands-feature/pages/EditBrandPage";
import ServiceDetailsPage from "@/features/event-planning-feature/brand-services-feature/pages/ServiceDetailsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
        children: [
          { index: true, element: <RoleSelector /> },
          { path: "seller", element: <SellerForm /> },
          { path: "customer", element: <CustomerForm /> },
        ],
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/verify-otp",
        element: <Verified />,
      },
      {
        path: "/profile/:slug",
        element: <PrivateRoute element={<ProfilePage />} />,
      },
      {
        path: "/profile/:slug/edit",
        element: <PrivateRoute element={<UpdateProfile />} />,
      },

      // event planner routes,
      {
        path: "/event-planner/brands/create",
        element: (
          <PrivateRoute
            element={<CreateBrandPage />}
            allowedRoles={["seller"]}
          />
        ),
      },

      {
        path: "/event-planner/brands/:slug/edit",
        element: <EditBrandPage />,
      },
      {
        path: "/event-planner/brands/:slug",
        element: <BrandDetailsPage />,
      },

      {
        path: "/event-planner/brands/:brandSlug/services/:serviceName",
        element: <ServiceDetailsPage />,
      },
    ],
  },
]);

export default function MainRoutes() {
  return <RouterProvider router={router} />;
}
