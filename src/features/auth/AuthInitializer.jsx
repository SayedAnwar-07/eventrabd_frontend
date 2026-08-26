import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  restoreSession,
  getMyProfile,
  clearLocalSession,
} from "@/store/features/auth/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      // If there is no locally remembered user,
      // there is no reason to delay public-page startup.
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        dispatch(clearLocalSession());
        return;
      }

      const refreshResult = await dispatch(restoreSession());

      if (cancelled || !restoreSession.fulfilled.match(refreshResult)) {
        return;
      }

      const profileResult = await dispatch(getMyProfile());

      if (cancelled || !getMyProfile.fulfilled.match(profileResult)) {
        return;
      }

      const user = profileResult.payload;

      // Admin should not use client application.
      if (user?.is_staff === true) {
        dispatch(clearLocalSession());
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // IMPORTANT:
  // Do not block public routes while restoring auth.
  return children;
};

export default AuthInitializer;
