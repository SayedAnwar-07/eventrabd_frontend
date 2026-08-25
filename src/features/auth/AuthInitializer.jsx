import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  restoreSession,
  getMyProfile,
  clearLocalSession,
} from "@/store/features/auth/authSlice";

import LoadingSpinner from "@/components/common/LoadingSpinner";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await dispatch(restoreSession());

        if (restoreSession.fulfilled.match(result)) {
          const profileResult = await dispatch(getMyProfile());

          if (getMyProfile.fulfilled.match(profileResult)) {
            const user = profileResult.payload;

            // Block admin session on client app
            if (user?.is_staff === true) {
              dispatch(clearLocalSession());

              return;
            }
          }
        }
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return children;
};

export default AuthInitializer;
