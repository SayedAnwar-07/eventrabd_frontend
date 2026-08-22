import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { DIVISION_OPTIONS } from "@/store/features/eventPlanner/bangladeshLocations";

import { setDivisionFilter } from "@/store/features/eventService/eventServiceSlice";

import { useDispatch, useSelector } from "react-redux";

import { selectDivisionFilter } from "@/store/features/eventService/eventServiceSelector";

const ServiceFilters = () => {
  const dispatch = useDispatch();

  const division = useSelector(selectDivisionFilter);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Filter By Division</h2>

      <RadioGroup
        value={division || "all"}
        onValueChange={(value) => {
          dispatch(setDivisionFilter(value === "all" ? null : value));
        }}
        className="space-y-2"
      >
        <label className="flex w-full items-center gap-2 pb-2 cursor-pointer">
          <RadioGroupItem value="all" />
          <span>All</span>
        </label>

        {DIVISION_OPTIONS.filter(
          (item) => item.value !== "whole_bangladesh",
        ).map((item) => (
          <label
            key={item.value}
            className=" flex  w-full items-center gap-2 cursor-pointer"
          >
            <RadioGroupItem value={item.value} />

            <span className="truncate">{item.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ServiceFilters;
