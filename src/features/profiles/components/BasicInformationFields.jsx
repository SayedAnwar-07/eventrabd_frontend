import { AtSign, FileText, UserRound } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import ProfileImageUploader from "./ProfileImageUploader";
import { getUsernameRemainingDays } from "../utils/profileUtils";

export default function BasicInformationFields({
  control,
  user,
  onImageChange,
}) {
  const remainingDays = getUsernameRemainingDays(user?.username_last_changed);

  return (
    <div className="space-y-7">
      <ProfileImageUploader
        currentImageUrl={user?.profile_image_url}
        onImageChange={onImageChange}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="full_name"
          rules={{
            required: "Full name is required",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>

              <FormControl>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input {...field} placeholder="John Doe" className="pl-10" />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="username"
          rules={{
            required: "Username is required",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>

              <FormControl>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    {...field}
                    placeholder="username"
                    disabled={remainingDays > 0}
                    className="pl-10"
                  />
                </div>
              </FormControl>

              {remainingDays > 0 && (
                <FormDescription>
                  Username can be changed in {remainingDays} day
                  {remainingDays !== 1 ? "s" : ""}.
                </FormDescription>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>

            <FormDescription>
              A brief description about yourself.
            </FormDescription>

            <FormControl>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Textarea
                  {...field}
                  maxLength={500}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="resize-none pl-10"
                />
              </div>
            </FormControl>

            <div className="text-right text-xs text-muted-foreground">
              {field.value?.length || 0}/500
            </div>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
