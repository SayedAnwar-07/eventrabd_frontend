import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";

import {
  clearError,
  clearSuccess,
  getMyProfile,
  updateProfile,
} from "@/store/features/auth/authSlice";

import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import ProfileEditSidebar from "../components/ProfileEditSidebar";
import BasicInformationFields from "../components/BasicInformationFields";
import ContactDetailsFields from "../components/ContactDetailsFields";
import ProfessionalInfoFields from "../components/ProfessionalInfoFields";
import ProfileFormActions from "../components/ProfileFormActions";

import {
  getChangedProfileValues,
  getInitialProfileValues,
  getProfileErrorMessage,
} from "../utils/profileUtils";

const UpdateProfile = () => {
  const { slug: routeSlug } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("basic");

  const [profileImageFile, setProfileImageFile] = useState(null);

  const [localMessage, setLocalMessage] = useState("");

  const [localError, setLocalError] = useState("");

  const form = useForm({
    defaultValues: getInitialProfileValues(null),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const initialValues = useMemo(() => getInitialProfileValues(user), [user]);

  const hasChanges = isDirty || Boolean(profileImageFile);

  useEffect(() => {
    if (!user || user.slug !== routeSlug) {
      dispatch(getMyProfile(routeSlug));
    }
  }, [dispatch, routeSlug, user]);

  useEffect(() => {
    if (!user) return;

    reset(getInitialProfileValues(user));
  }, [user, reset]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleProfileImageChange = (file) => {
    setProfileImageFile(file);

    setLocalError("");
    setLocalMessage("");
  };

  const onSubmit = async (values) => {
    if (!user) return;

    setLocalError("");
    setLocalMessage("");

    const changedValues = getChangedProfileValues(values, initialValues);

    if (Object.keys(changedValues).length === 0 && !profileImageFile) {
      setLocalMessage("No changes detected.");
      return;
    }

    const formData = new FormData();

    Object.entries(changedValues).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (profileImageFile) {
      formData.append("profile_image", profileImageFile);
    }

    try {
      const resultAction = await dispatch(
        updateProfile({
          slug: user.slug,
          updateData: formData,
        }),
      );

      if (updateProfile.fulfilled.match(resultAction)) {
        const updatedUser = resultAction.payload?.user;

        const newSlug =
          resultAction.payload?.new_slug || updatedUser?.slug || user.slug;

        setProfileImageFile(null);

        setLocalMessage("Profile updated successfully.");

        navigate(`/profile/${newSlug}`, {
          replace: true,
        });

        return;
      }

      setLocalError(getProfileErrorMessage(resultAction.payload));
    } catch {
      setLocalError("Unexpected error occurred. Try again.");
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${user?.slug || routeSlug}`);
  };

  if (!user && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />

          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cannot load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Profile
              </h1>

              <p className="mt-1 text-muted-foreground">
                Update your personal and professional information.
              </p>
            </div>

            <Badge className="capitalize">{user.role || "user"}</Badge>
          </div>

          <Separator />
        </header>

        {localMessage && (
          <div
            role="status"
            className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {localMessage}
          </div>
        )}

        {localError && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {localError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <ProfileEditSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </aside>

          <main className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {activeTab === "basic" && (
                  <BasicInformationFields
                    control={control}
                    user={user}
                    onImageChange={handleProfileImageChange}
                  />
                )}

                {activeTab === "contact" && (
                  <ContactDetailsFields control={control} />
                )}

                {activeTab === "professional" && (
                  <ProfessionalInfoFields control={control} />
                )}

                <ProfileFormActions
                  loading={loading}
                  hasChanges={hasChanges}
                  onCancel={handleCancel}
                />
              </form>
            </Form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
