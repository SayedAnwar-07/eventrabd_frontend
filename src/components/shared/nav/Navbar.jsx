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

  const { user } = useSelector((state) => state.auth);

  const { myBrandDetails, myBrand } = useSelector(
    (state) => state.eventPlanner,
  );

  const isSeller = user?.role === "seller";

  const canReceiveNotifications = user?.role === "customer" || isSeller;

  // Normalize brand response
  const sellerBrand = Array.isArray(myBrandDetails?.results)
    ? myBrandDetails.results.find(
        (brand) => brand?.slug === user?.brand_slug || brand?.is_owner === true,
      ) || myBrandDetails.results[0]
    : myBrandDetails?.id && myBrandDetails?.slug
      ? myBrandDetails
      : null;

  // Fetch seller brand after refresh
  useEffect(() => {
    if (!isSeller) {
      return;
    }

    if (myBrand.loading) {
      return;
    }

    if (sellerBrand) {
      return;
    }

    dispatch(fetchMyBrand());
  }, [dispatch, isSeller, sellerBrand, myBrand.loading]);

  // Notification count
  useEffect(() => {
    if (!canReceiveNotifications) {
      return;
    }

    dispatch(fetchNotificationCount());
  }, [dispatch, user?.id, canReceiveNotifications]);

  const handleLogout = () => {
    dispatch(clearNotifications());

    dispatch(clearMyBrandDetails());

    dispatch(logoutUser());

    navigate("/", {
      replace: true,
    });
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

    sellerBrandLoading: isSeller && !sellerBrand && myBrand.loading,

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
