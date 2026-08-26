import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useDispatch, useSelector } from "react-redux";

import { setServiceTypeFilter } from "@/store/features/eventService/eventServiceSlice";

import { selectServiceTypeFilter } from "@/store/features/eventService/eventServiceSelector";

const SERVICE_TYPE_OPTIONS = [
  {
    value: "photography",
    label: "Photography",
  },
  {
    value: "videography",
    label: "Videography",
  },
  {
    value: "stage_designer",
    label: "Stage Designer",
  },
  {
    value: "sound_lighting",
    label: "Sound System and Lighting",
  },
  {
    value: "event_hall",
    label: "Event Hall",
  },
];

const ServiceTypeFilters = ({ onFilterChange }) => {
  const dispatch = useDispatch();

  const serviceType = useSelector(selectServiceTypeFilter);

  const handleValueChange = (value) => {
    dispatch(setServiceTypeFilter(value === "all" ? null : value));

    onFilterChange?.();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Filter By Service</h2>

      <RadioGroup
        value={serviceType || "all"}
        onValueChange={handleValueChange}
        className="space-y-2"
      >
        <label className="flex w-full cursor-pointer items-center gap-2 pb-2">
          <RadioGroupItem value="all" />

          <span>All</span>
        </label>

        {SERVICE_TYPE_OPTIONS.map((item) => (
          <label
            key={item.value}
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <RadioGroupItem value={item.value} />

            <span className="text-sm leading-5">{item.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ServiceTypeFilters;
