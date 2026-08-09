import { MessageCircle, Phone } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

export default function ContactDetailsFields({ control }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FormField
        control={control}
        name="contact_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Number</FormLabel>

            <FormDescription>Your primary contact number.</FormDescription>

            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input {...field} placeholder="01XXXXXXXXX" className="pl-10" />
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="whatsapp_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Number</FormLabel>

            <FormDescription>
              For WhatsApp business communication.
            </FormDescription>

            <FormControl>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input {...field} placeholder="01XXXXXXXXX" className="pl-10" />
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
