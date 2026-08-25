import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user, isAuthenticated, authInitialized } = useSelector(
    (state) => state.auth,
  );

  const location = useLocation();

  if (!authInitialized) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  // BLOCK ADMIN FROM CLIENT WEBSITE
  if (user.is_staff) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;
