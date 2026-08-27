import { useState } from "react";
import { Check, MessageCircle, Pencil, Phone } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { normalizeBangladeshPhoneInput } from "../utils/profileUtils";

const PhoneInput = ({
  field,
  fieldName,
  icon: Icon,
  placeholder,
  autoComplete,
  isEditing,
  onEdit,
  onDone,
}) => {
  const handleChange = (event) => {
    const normalizedValue = normalizeBangladeshPhoneInput(event.target.value);

    field.onChange(normalizedValue);
  };

  return (
    <div className="relative">
      {/* Left icon + country prefix */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
        <Icon className="ml-3 h-4 w-4 text-gray-500" />

        <span className="ml-2 text-sm font-semibold text-gray-700">+88</span>
      </div>

      <Input
        {...field}
        id={`profile-${fieldName}`}
        type="tel"
        inputMode="numeric"
        readOnly={!isEditing}
        maxLength={11}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={handleChange}
        className="h-12 rounded-md border-gray-200 bg-gray-50 pl-16 pr-12 text-sm shadow-none placeholder:text-gray-400 focus-visible:border-[#b60018] focus-visible:ring-1 focus-visible:ring-[#b60018] read-only:cursor-default read-only:bg-gray-100"
      />

      {isEditing ? (
        <button
          type="button"
          onClick={onDone}
          className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-emerald-700 rounded-[5px] text-emerald-500 transition hover:text-emerald-700"
          aria-label="Finish editing"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-3 top-1/2 -translate-y-1/2 border p-1 border-blue-600 text-blue-500 rounded-[5px] transition hover:text-blue-700"
          aria-label="Edit number"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default function ContactDetailsFields({ control }) {
  const [editingField, setEditingField] = useState(null);

  const startEditing = (fieldName) => {
    setEditingField(fieldName);

    requestAnimationFrame(() => {
      document.getElementById(`profile-${fieldName}`)?.focus();
    });
  };

  const stopEditing = () => {
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      {/* Contact Number */}
      <FormField
        control={control}
        name="contact_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-950">
              Contact Number*
            </FormLabel>

            <FormControl>
              <PhoneInput
                field={field}
                fieldName="contact_number"
                icon={Phone}
                placeholder="Enter you contact number"
                autoComplete="tel"
                isEditing={editingField === "contact_number"}
                onEdit={() => startEditing("contact_number")}
                onDone={stopEditing}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      {/* WhatsApp Number */}
      <FormField
        control={control}
        name="whatsapp_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-950">
              WhatsApp Number
            </FormLabel>

            <FormControl>
              <PhoneInput
                field={field}
                fieldName="whatsapp_number"
                icon={MessageCircle}
                placeholder="Enter your whatsapp number"
                autoComplete="tel"
                isEditing={editingField === "whatsapp_number"}
                onEdit={() => startEditing("whatsapp_number")}
                onDone={stopEditing}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
