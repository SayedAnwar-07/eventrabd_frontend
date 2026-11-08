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

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const normalizeUserId = (id) =>
  id === null || id === undefined ? null : String(id);

const getOwnedBrand = (brandData, userId) => {
  if (!brandData || !userId) {
    return null;
  }

  const brands = Array.isArray(brandData)
    ? brandData
    : Array.isArray(brandData.results)
      ? brandData.results
      : null;

  if (brands) {
    return (
      brands.find((brand) => {
        if (brand?.is_owner === true) {
          return true;
        }

        const ownerId =
          brand?.owner?.id ??
          brand?.owner_id ??
          (typeof brand?.owner === "string" || typeof brand?.owner === "number"
            ? brand.owner
            : null);

        return (
          ownerId !== null &&
          ownerId !== undefined &&
          normalizeUserId(ownerId) === normalizeUserId(userId)
        );
      }) ?? null
    );
  }

  // /my-brand/ should return the current seller's brand
  // as a single object when one exists.
  if (brandData?.id && brandData?.slug) {
    return brandData;
  }

  return null;
};

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, authInitialized } = useSelector(
    (state) => state.auth,
  );

  const { myBrandDetails, myBrand } = useSelector(
    (state) => state.eventPlanner,
  );

  const userId = user?.id ?? user?.pk ?? null;

  const isSeller = user?.role === "seller";

  const canReceiveNotifications = user?.role === "customer" || isSeller;

  // ───────────────────────────────────────────
  // ACCOUNT-SCOPED BRAND CACHE
  // ───────────────────────────────────────────

  const brandBelongsToCurrentUser =
    userId !== null &&
    normalizeUserId(myBrand.userId) === normalizeUserId(userId);

  const brandFetchedForCurrentUser =
    brandBelongsToCurrentUser && myBrand.hasFetched;

  const sellerBrand =
    isSeller && brandFetchedForCurrentUser
      ? getOwnedBrand(myBrandDetails, userId)
      : null;

  // ───────────────────────────────────────────
  // FETCH SELLER BRAND
  // ───────────────────────────────────────────

  useEffect(() => {
    if (!authInitialized || !isAuthenticated || !isSeller || !userId) {
      return;
    }

    dispatch(fetchMyBrand());
  }, [
    dispatch,
    authInitialized,
    isAuthenticated,
    isSeller,
    userId,
    myBrand.userId,
    myBrand.loading,
    myBrand.hasFetched,
  ]);

  // ───────────────────────────────────────────
  // BRAND LOADING
  // ───────────────────────────────────────────

  const sellerBrandLoading =
    authInitialized &&
    isAuthenticated &&
    isSeller &&
    Boolean(userId) &&
    (!brandBelongsToCurrentUser || myBrand.loading || !myBrand.hasFetched);

  // ───────────────────────────────────────────
  // NOTIFICATION COUNT
  // ───────────────────────────────────────────

  useEffect(() => {
    if (!authInitialized || !isAuthenticated || !canReceiveNotifications) {
      return;
    }

    dispatch(fetchNotificationCount());
  }, [
    dispatch,
    authInitialized,
    isAuthenticated,
    userId,
    canReceiveNotifications,
  ]);

  // ───────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────

  const handleLogout = async () => {
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

  // ───────────────────────────────────────────
  // NOTIFICATIONS
  // ───────────────────────────────────────────

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

  // ───────────────────────────────────────────
  // NAVIGATION PROPS
  // ───────────────────────────────────────────

  const navProps = {
    user,
    navItems: NAV_ITEMS,

    sellerBrand,
    sellerBrandLoading,

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
