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
    label: "Contact",
    to: "/contact",
  },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const { theme, setTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);

  const { myBrandDetails, myBrand } = useSelector(
    (state) => state.eventPlanner,
  );

  const isSeller = user?.role === "seller";

  const canReceiveNotifications = user?.role === "customer" || isSeller;

  const sellerBrand = Array.isArray(myBrandDetails?.results)
    ? myBrandDetails.results.find((brand) => brand?.is_owner === true) || null
    : myBrandDetails?.id && myBrandDetails?.slug
      ? myBrandDetails
      : null;

  useEffect(() => {
    if (!isSeller) return;

    if (myBrandDetails || myBrand.loading) {
      return;
    }

    dispatch(fetchMyBrand());
  }, [dispatch, isSeller, myBrandDetails, myBrand.loading]);

  // Notification count
  useEffect(() => {
    if (!canReceiveNotifications) return;

    dispatch(fetchNotificationCount());
  }, [dispatch, user?.id, canReceiveNotifications]);

  // const handleThemeToggle = () => {
  //   setTheme(theme === "light" ? "dark" : "light");
  // };

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
    if (destination?.type === "hire" && isSeller && destination?.id) {
      navigate(`/seller/hire-requests/${destination.id}`);
    }
  };

  const navProps = {
    user,
    navItems: NAV_ITEMS,

    sellerBrand,
    sellerBrandLoading: isSeller && !sellerBrand && myBrand.loading,

    // onThemeToggle: handleThemeToggle,

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
