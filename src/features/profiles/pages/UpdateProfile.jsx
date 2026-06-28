import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";

import {
  getProfile,
  updateProfile,
  clearError,
  clearSuccess,
} from "@/store/features/auth/authSlice";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ForgotPassword from "@/features/auth/forgot-password/pages/ForgotPassword";

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-middle" />
);

const UpdateProfile = () => {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [localMessage, setLocalMessage] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      bio: "",
      profile_image_url: "",
      contact_number: "",
      whatsapp_number: "",
      office_address: "",
      service_area: "",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (!user || user.slug !== routeSlug) {
      dispatch(getProfile(routeSlug));
    }
  }, [routeSlug, user, dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        username: user.username || "",
        bio: user.bio || "",
        profile_image_url: user.profile_image_url || "",
        contact_number: user.contact_number || "",
        whatsapp_number: user.whatsapp_number || "",
        office_address: user.office_address || "",
        service_area: user.service_area || "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const initialValues = useMemo(
    () =>
      user
        ? {
            full_name: user.full_name || "",
            username: user.username || "",
            bio: user.bio || "",
            profile_image_url: user.profile_image_url || "",
            contact_number: user.contact_number || "",
            whatsapp_number: user.whatsapp_number || "",
            office_address: user.office_address || "",
            service_area: user.service_area || "",
          }
        : null,
    [user],
  );

  const onSubmit = async (values) => {
    if (!user || !initialValues) return;

    const updateData = {};
    Object.keys(values).forEach((key) => {
      if ((values[key] || "") !== (initialValues[key] || "")) {
        updateData[key] = values[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      setLocalMessage("No changes detected.");
      return;
    }

    try {
      const resultAction = await dispatch(
        updateProfile({ slug: user.slug, updateData }),
      );

      if (updateProfile.fulfilled.match(resultAction)) {
        const { user: updatedUser, new_slug } = resultAction.payload;
        setLocalMessage("Profile updated successfully.");

        if (new_slug && new_slug !== routeSlug) {
          window.location.assign(`/profile/${new_slug}`);
          return;
        }

        navigate(`/profile/${updatedUser.slug}`, { replace: true });
      } else {
        const payload = resultAction.payload;
        if (payload) {
          const messages = Object.values(payload).flat().join(" ");
          setLocalError(messages || "Failed to update profile.");
        } else {
          setLocalError("Failed to update profile.");
        }
      }
    } catch (err) {
      setLocalError("Unexpected error occurred. Try again.");
    }
  };

  const handleCancel = () => {
    const targetSlug = user?.slug || routeSlug;
    navigate(`/profile/${targetSlug}`);
  };

  if (!user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="pt-6 text-center">
            <p className="text-muted-foreground">Cannot load profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Edit Profile
              </h1>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                Update your personal and professional information
              </p>
            </div>
            <Badge variant="" className="px-3 py-1">
              {user?.role || "User"}
            </Badge>
          </div>
          <Separator className="" />
        </div>

        {/* Messages */}
        {localMessage && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="">
                  <svg
                    className="h-5 w-5 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-emerald-800">
                    {localMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {localError && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-center">
                <div className="">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {localError}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border-gray-200">
              <div>
                <nav className="space-y-3">
                  <button
                    onClick={() => setActiveTab("basic")}
                    className={`w-full  flex items-center px-3 py-2 text-sm rounded-md transition-all ${
                      activeTab === "basic"
                        ? "border border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-[#151515] font-medium"
                        : "border"
                    }`}
                  >
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Basic Information
                  </button>
                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-all ${
                      activeTab === "contact"
                        ? "border bg-gray-50 dark:bg-[#151515] font-medium"
                        : "border"
                    }`}
                  >
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Contact Details
                  </button>
                  <button
                    onClick={() => setActiveTab("professional")}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-all ${
                      activeTab === "professional"
                        ? "border bg-gray-100 dark:bg-[#151515] font-medium"
                        : "border"
                    }`}
                  >
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Professional Info
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-all border">
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>

                    <Link to="/forgot-password">Forgot Password</Link>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="">
              <div className="">
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information Tab */}
                    {(activeTab === "basic" || !activeTab) && (
                      <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                          {/* PROFILE IMAGE URL */}
                          <FormField
                            control={control}
                            name="profile_image_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">
                                  Profile Image URL
                                </FormLabel>
                                {field.value && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-2">
                                      Preview:
                                    </div>
                                    <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden">
                                      <img
                                        src={field.value}
                                        alt="Profile preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M50 35a15 15 0 100 30 15 15 0 000-30zm0 25a10 10 0 110-20 10 10 0 010 20zm30-35H20a5 5 0 00-5 5v50a5 5 0 005 5h60a5 5 0 005-5V30a5 5 0 00-5-5zm-60 5h60v50H20V30z' fill='%239ca3af'/%3E%3C/svg%3E";
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                                <FormDescription className="text-sm text-gray-500">
                                  Enter a direct link to your profile picture
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      placeholder="https://example.com/your-photo.jpg"
                                      className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {/* FULL NAME */}
                          <FormField
                            control={control}
                            name="full_name"
                            rules={{ required: "Full name is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">
                                  Full Name *
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      placeholder="John Doe"
                                      className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* USERNAME */}
                          <FormField
                            control={control}
                            name="username"
                            rules={{ required: "Username is required" }}
                            render={({ field }) => {
                              let remainingDays = 0;

                              if (user?.username_last_changed) {
                                const lastChanged = new Date(
                                  user.username_last_changed,
                                );
                                const now = new Date();
                                const SIXTY_DAYS_IN_MS =
                                  60 * 24 * 60 * 60 * 1000;
                                const diff = now - lastChanged;
                                const msLeft = SIXTY_DAYS_IN_MS - diff;
                                if (msLeft > 0) {
                                  remainingDays = Math.ceil(
                                    msLeft / (1000 * 60 * 60 * 24),
                                  );
                                }
                              }

                              return (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold">
                                    Username *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        placeholder="username"
                                        disabled={remainingDays > 0}
                                        className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                      />
                                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg
                                          className="h-5 w-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </FormControl>
                                  {remainingDays > 0 && (
                                    <div className="flex items-center mt-2 text-sm">
                                      <svg
                                        className="h-4 w-4 text-blue-500 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="text-blue-600 font-medium">
                                        Username can be changed in{" "}
                                        {remainingDays} day
                                        {remainingDays > 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>

                        {/* BIO */}
                        <FormField
                          control={control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">
                                Bio
                              </FormLabel>
                              <FormDescription className="text-sm text-gray-500">
                                A brief description about yourself
                              </FormDescription>
                              <FormControl>
                                <div className="relative">
                                  <Textarea
                                    {...field}
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    className="pl-10 pt-3 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
                                  />
                                  <div className="absolute left-3 top-3 text-gray-400">
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <div className="text-xs text-gray-500 mt-1 flex justify-end">
                                {field.value?.length || 0}/500 characters
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Contact Details Tab */}
                    {activeTab === "contact" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* CONTACT NUMBER */}
                          <FormField
                            control={control}
                            name="contact_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">
                                  Contact Number
                                </FormLabel>
                                <FormDescription className="text-sm text-gray-500">
                                  Your primary contact number
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      placeholder="01XXXXXXXXX"
                                      className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* WHATSAPP NUMBER */}
                          <FormField
                            control={control}
                            name="whatsapp_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold">
                                  WhatsApp Number
                                </FormLabel>
                                <FormDescription className="text-sm text-gray-500">
                                  For WhatsApp business communication
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      placeholder="01XXXXXXXXX"
                                      className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                                      </svg>
                                    </div>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Professional Info Tab */}
                    {activeTab === "professional" && (
                      <div className="space-y-6">
                        {/* OFFICE ADDRESS */}
                        <FormField
                          control={control}
                          name="office_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">
                                Office Address
                              </FormLabel>
                              <FormDescription className="text-sm text-gray-500">
                                Your business or office location
                              </FormDescription>
                              <FormControl>
                                <div className="relative">
                                  <Textarea
                                    {...field}
                                    rows={4}
                                    placeholder="Enter your complete office address..."
                                    className="pl-10 pt-3 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
                                  />
                                  <div className="absolute left-3 top-3 text-gray-400">
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* SERVICE AREA */}
                        <FormField
                          control={control}
                          name="service_area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">
                                Service Area
                              </FormLabel>
                              <FormDescription className="text-sm text-gray-500">
                                Cities or regions where you provide services
                              </FormDescription>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    placeholder="e.g., Dhaka, Chittagong, Sylhet"
                                    className="pl-10 transition-all focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                                  />
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-8 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                          {isDirty ? (
                            <span className="flex items-center text-amber-600">
                              <svg
                                className="h-4 w-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Unsaved changes
                            </span>
                          ) : (
                            <span className="flex items-center text-emerald-600">
                              <svg
                                className="h-4 w-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              All changes saved
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-6 border-gray-300 hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading || !isDirty}
                            className="gradient-button px-8 transition-all hover:scale-105 active:scale-95"
                          >
                            {loading ? (
                              <>
                                <Spinner />
                                <span className="ml-2">Saving...</span>
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
