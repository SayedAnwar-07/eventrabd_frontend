import { RouterProvider, createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Verified from "@/pages/auth/Verified";
import ProfilePage from "@/pages/profile/ProfilePage";
import UpdateProfile from "@/pages/profile/UpdateProfile";
import ForgotPassword from "@/pages/reset_and_forgot_password/ForgotPassword";
import ResetPassword from "@/pages/reset_and_forgot_password/ResetPassword";
import PrivateRoute from "./PrivateRoute";
import RoleSelector from "@/components/auth/RoleSelector";
import SellerForm from "@/components/auth/SellerForm";
import CustomerForm from "@/components/auth/CustomerForm";
import BrandsPage from "@/pages/eventPlanner/brands-page";
import CreateBrandPage from "@/pages/eventPlanner/create-brand-page";
import BrandDetailsPage from "@/pages/eventPlanner/brand-details-page";
import EditBrandPage from "@/pages/eventPlanner/edit-brand-page";

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

      // event planner routes
      {
        path: "/event-planner/brands",
        element: <BrandsPage />,
      },
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
        path: "/event-planner/brands/:slug",
        element: <BrandDetailsPage />,
      },
      {
        path: "/event-planner/brands/:slug/edit",
        element: (
          <PrivateRoute element={<EditBrandPage />} allowedRoles={["seller"]} />
        ),
      },
    ],
  },
]);

export default function MainRoutes() {
  return <RouterProvider router={router} />;
}
