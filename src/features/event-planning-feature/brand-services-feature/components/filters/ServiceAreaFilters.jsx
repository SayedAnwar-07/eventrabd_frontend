import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useDispatch, useSelector } from "react-redux";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import { setDivisionFilter } from "@/store/features/eventService/eventServiceSlice";

import { selectDivisionFilter } from "@/store/features/eventService/eventServiceSelector";

const ServiceAreaFilters = ({ onFilterChange }) => {
  const dispatch = useDispatch();

  const division = useSelector(selectDivisionFilter);

  const handleValueChange = (value) => {
    dispatch(setDivisionFilter(value === "all" ? null : value));

    onFilterChange?.();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Filter By Division</h2>

      <RadioGroup
        value={division || "all"}
        onValueChange={handleValueChange}
        className="space-y-2"
      >
        <label className="flex w-full cursor-pointer items-center gap-2 pb-2">
          <RadioGroupItem value="all" />

          <span>All</span>
        </label>

        {DIVISION_OPTIONS.filter(
          (item) => item.value !== "whole_bangladesh",
        ).map((item) => (
          <label
            key={item.value}
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <RadioGroupItem value={item.value} />

            <span className="truncate">{item.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ServiceAreaFilters;
