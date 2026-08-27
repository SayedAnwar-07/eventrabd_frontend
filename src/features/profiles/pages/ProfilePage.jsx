import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import { getMyProfile } from "@/store/features/auth/authSlice";
import ProfileCard from "../components/ProfileCard";
import api from "@/store/constant/api";
import UpdateProfile from "../components/UpdateProfile";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();

  const { user, loading } = useSelector((state) => state.auth);

  const [checkingBrand, setCheckingBrand] = useState(false);
  const [brandRedirectUrl, setBrandRedirectUrl] = useState(null);
  const [brandChecked, setBrandChecked] = useState(false);

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!user || slug === user.slug) {
      setBrandChecked(true);
      return;
    }

    let cancelled = false;
    setCheckingBrand(true);

    const checkBrand = async () => {
      try {
        const { data } = await api.get(`/users/${slug}/`);
        if (!cancelled) {
          setBrandRedirectUrl(data?.redirect_url || null);
        }
      } catch {
        if (!cancelled) {
          setBrandRedirectUrl(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingBrand(false);
          setBrandChecked(true);
        }
      }
    };

    checkBrand();

    return () => {
      cancelled = true;
    };
  }, [slug, user]);

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
  if (checkingBrand || (slug !== user.slug && !brandChecked)) {
    return (
      <div className="container mx-auto px-2 py-8">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }
  if (slug !== user.slug && brandRedirectUrl) {
    window.location.replace(brandRedirectUrl);
    return (
      <div className="container mx-auto px-2 py-8">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }
  if (slug !== user.slug) {
    return <Navigate to={`/profile/${user.slug}`} replace />;
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">User Profile</h1>

          <p className="mb-8 text-muted-foreground">
            View and manage your profile information
          </p>
        </div>

        <ProfileCard />
      </div>
      <UpdateProfile />
    </div>
  );
};

export default ProfilePage;
