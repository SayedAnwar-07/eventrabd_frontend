import { MapPin, MapPinned } from "lucide-react";

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

export default function ProfessionalInfoFields({ control }) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="office_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Office Address</FormLabel>

            <FormDescription>Your business or office location.</FormDescription>

            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Enter your complete office address..."
                  className="resize-none pl-10"
                />
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="service_area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Area</FormLabel>

            <FormDescription>
              Cities or regions where you provide services.
            </FormDescription>

            <FormControl>
              <div className="relative">
                <MapPinned className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  {...field}
                  placeholder="e.g. Dhaka, Chattogram, Sylhet"
                  className="pl-10"
                />
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
