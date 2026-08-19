export const DIVISION_OPTIONS = [
  {
    value: "whole_bangladesh",
    label: "Whole Bangladesh",
  },
  {
    value: "dhaka",
    label: "Dhaka",
  },
  {
    value: "chattogram",
    label: "Chattogram",
  },
  {
    value: "khulna",
    label: "Khulna",
  },
  {
    value: "rajshahi",
    label: "Rajshahi",
  },
  {
    value: "rangpur",
    label: "Rangpur",
  },
  {
    value: "barishal",
    label: "Barishal",
  },
  {
    value: "sylhet",
    label: "Sylhet",
  },
  {
    value: "mymensingh",
    label: "Mymensingh",
  },
];

export const DIVISION_VALUES = DIVISION_OPTIONS.map(
  (division) => division.value,
);

export const DIVISION_LABELS = Object.fromEntries(
  DIVISION_OPTIONS.map(({ value, label }) => [value, label]),
);
