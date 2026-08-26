import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import DesktopAndLaptopNav from "./DesktopAndLaptopNav";
import MobileAndTabNav from "./MobileAndTabNav";

import { logoutUser } from "@/store/features/auth/authSlice";

import {
  clearMyBrandDetails,
  fetchMyBrand,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import {
  clearNotifications,
  fetchNotificationCount,
} from "@/store/features/notification/notificationSlice";

const NAV_ITEMS = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Services",
    to: "/services",
  },
  {
    label: "Contact",
    to: "/contact",
  },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, authInitialized } = useSelector(
    (state) => state.auth,
  );

  const { myBrandDetails, myBrand } = useSelector(
    (state) => state.eventPlanner,
  );

  const isSeller = user?.role === "seller";

  const canReceiveNotifications = user?.role === "customer" || isSeller;

  // Current seller brand
  const sellerBrand = Array.isArray(myBrandDetails?.results)
    ? (myBrandDetails.results.find(
        (brand) => brand?.slug === user?.brand_slug || brand?.is_owner === true,
      ) ??
      myBrandDetails.results[0] ??
      null)
    : myBrandDetails?.id && myBrandDetails?.slug
      ? myBrandDetails
      : null;

  // Fetch brand after auth restore
  useEffect(() => {
    if (
      !authInitialized ||
      !isAuthenticated ||
      !isSeller ||
      myBrand.loading ||
      sellerBrand
    ) {
      return;
    }

    dispatch(fetchMyBrand());
  }, [
    dispatch,
    authInitialized,
    isAuthenticated,
    isSeller,
    myBrand.loading,
    sellerBrand,
  ]);

  // Fetch notification count after auth restore
  useEffect(() => {
    if (!authInitialized || !isAuthenticated || !canReceiveNotifications) {
      return;
    }

    dispatch(fetchNotificationCount());
  }, [
    dispatch,
    authInitialized,
    isAuthenticated,
    user?.id,
    canReceiveNotifications,
  ]);

  // Logout
  const handleLogout = async () => {
    // Clear UI state immediately
    dispatch(clearNotifications());
    dispatch(clearMyBrandDetails());

    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      navigate("/login/", {
        replace: true,
      });
    }
  };

  const handleViewNotifications = () => {
    navigate("/notifications");
  };

  const handleNotificationNavigate = (destination) => {
    if (!destination?.id) {
      return;
    }

    if (destination.type === "hire" && user?.role === "seller") {
      navigate(`/seller/hire-requests/${destination.id}`);

      return;
    }

    if (destination.type === "invoice" && user?.role === "customer") {
      navigate(`/customer/hire-requests/${destination.id}`);
    }
  };

  const navProps = {
    user,
    navItems: NAV_ITEMS,

    sellerBrand,

    sellerBrandLoading:
      authInitialized &&
      isAuthenticated &&
      isSeller &&
      !sellerBrand &&
      myBrand.loading,

    onLogout: handleLogout,

    onViewNotifications: handleViewNotifications,

    onNotificationNavigate: handleNotificationNavigate,
  };

  return (
    <>
      <DesktopAndLaptopNav {...navProps} />

      <MobileAndTabNav {...navProps} />
    </>
  );
}
