import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import { getMyProfile } from "@/store/features/auth/authSlice";
import ProfileCard from "../components/ProfileCard";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();

  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  if (loading && !user) {
    return (
      <div className="container mx-auto px-2 py-8">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Someone entered another user's slug.
  // Force the URL back to the logged-in user's real profile URL.
  if (slug !== user.slug) {
    return <Navigate to={`/profile/${user.slug}`} replace />;
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold">User Profile</h1>

        <p className="mb-8 text-muted-foreground">
          View and manage your profile information
        </p>

        <ProfileCard />
      </div>
    </div>
  );
};

export default ProfilePage;
