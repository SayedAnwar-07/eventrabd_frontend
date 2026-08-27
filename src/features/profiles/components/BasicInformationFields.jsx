import { useState } from "react";
import { AtSign, Check, FileText, Pencil, UserRound } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { getUsernameRemainingDays } from "../utils/profileUtils";

export default function BasicInformationFields({ control, user }) {
  const [editingField, setEditingField] = useState(null);

  const remainingDays = getUsernameRemainingDays(user?.username_last_changed);

  const startEditing = (fieldName) => {
    setEditingField(fieldName);

    requestAnimationFrame(() => {
      document.getElementById(`profile-${fieldName}`)?.focus();
    });
  };

  const stopEditing = () => {
    setEditingField(null);
  };

  const inputClassName =
    "h-12 rounded-md border-gray-200 bg-gray-50 pl-10 pr-12 text-sm shadow-none placeholder:text-gray-400 focus-visible:border-[#b60018] focus-visible:ring-1 focus-visible:ring-[#b60018] read-only:cursor-default read-only:bg-gray-100";

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <FormField
        control={control}
        name="full_name"
        rules={{
          required: "Full name is required",
        }}
        render={({ field }) => {
          const isEditing = editingField === "full_name";

          return (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-950">
                Full Name*
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <Input
                    {...field}
                    id="profile-full_name"
                    readOnly={!isEditing}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={inputClassName}
                  />

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={stopEditing}
                      className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-emerald-700 rounded-[5px] text-emerald-500 transition hover:text-emerald-700"
                      aria-label="Finish editing full name"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing("full_name")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-blue-600 text-blue-500 rounded-[5px] transition hover:text-blue-700"
                      aria-label="Edit full name"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Username */}
      <FormField
        control={control}
        name="username"
        rules={{
          required: "Username is required",
        }}
        render={({ field }) => {
          const usernameLocked = remainingDays > 0;

          const isEditing = editingField === "username" && !usernameLocked;

          return (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-950">
                Username*
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <Input
                    {...field}
                    id="profile-username"
                    readOnly={!isEditing}
                    placeholder="username"
                    autoComplete="username"
                    className={inputClassName}
                  />

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={stopEditing}
                      className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-gray-400 rounded-md text-emerald-600 transition hover:text-emerald-700"
                      aria-label="Finish editing username"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={usernameLocked}
                      onClick={() => startEditing("username")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-gray-400 rounded-md text-gray-500 transition hover:text-[#b60018] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Edit username"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </FormControl>

              {remainingDays > 0 && (
                <FormDescription className="text-xs italic text-gray-500">
                  Username can be changed in{" "}
                  <span className="font-semibold text-gray-700">
                    {remainingDays} day
                    {remainingDays !== 1 ? "s" : ""}
                  </span>
                  .
                </FormDescription>
              )}

              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
