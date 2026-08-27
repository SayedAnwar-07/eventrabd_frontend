import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  clearError,
  clearSuccess,
  getMyProfile,
  updateProfile,
} from "@/store/features/auth/authSlice";

import { Form } from "@/components/ui/form";

import ProfileImageUploader from "./ProfileImageUploader";
import BasicInformationFields from "./BasicInformationFields";
import ContactDetailsFields from "./ContactDetailsFields";
import ProfileFormActions from "./ProfileFormActions";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#b60018]" />

          <p className="mt-3 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Cannot load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="">
        {localMessage && (
          <div
            role="status"
            className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {localMessage}
          </div>
        )}

        {localError && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {localError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <div className="grid grid-cols-1 gap-8 sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
                <aside>
                  <ProfileImageUploader
                    currentImageUrl={user?.profile_image_url}
                    onImageChange={handleProfileImageChange}
                  />
                </aside>

                <main className="min-w-0">
                  <div className="space-y-6">
                    <BasicInformationFields control={control} user={user} />

                    <ContactDetailsFields control={control} />
                  </div>
                </main>
              </div>

              <ProfileFormActions
                loading={loading}
                hasChanges={hasChanges}
                onCancel={handleCancel}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
