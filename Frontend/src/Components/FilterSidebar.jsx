import React from "react";
import FilterGroup from "./FilterGroup";

const FilterSidebar = ({ filtersData, onFilterChange }) => {
  return (
    <aside className="lg:col-span-1">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      {filtersData.map((attribute) => (
        <FilterGroup
          key={attribute.id}
          attribute={attribute}
          onFilterChange={onFilterChange}
        />
      ))}
    </aside>
  );
};

export default FilterSidebar;
