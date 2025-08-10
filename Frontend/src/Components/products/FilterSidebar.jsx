import React from "react";
import FilterGroup from "./FilterGroup";

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
);

const FilterSidebar = ({
  filters,
  activeFilters,
  onFilterChange,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center pt-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form className="divide-y divide-gray-200">
      {filters.map((attribute) => (
        <FilterGroup
          key={attribute.id || attribute.name}
          attribute={attribute}
          activeValues={activeFilters[attribute.name] || []}
          onFilterChange={onFilterChange}
        />
      ))}
    </form>
  );
};

export default FilterSidebar;
