import React from "react";
import AccordionFilterSection from "./AccordionFilterSection";
import PriceSlider from "./PriceSlider";

const Filters = ({
  onFilterChange,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  resetFilters,
  activeFilters,
  filterOptions,
}) => {
  const hasActiveFilters =
    Object.keys(activeFilters).length > 0 ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice;

  const filterSections = [
    // ========================================================================
    // THE FIX: The "brands" section is removed entirely because your backend
    // Product model does not have a 'brand' field, so there is no data for it.
    // ========================================================================
    {
      key: "sizes",
      title: "Tailles",
      searchable: false,
      // We add a safety check: `filterOptions.sizes && ...`
      // This ensures the code doesn't crash if the data hasn't loaded yet.
      condition: filterOptions.sizes && filterOptions.sizes.length > 0,
      defaultOpen: false,
    },
    {
      key: "conditions",
      title: "État",
      searchable: false,
      condition:
        filterOptions.conditions && filterOptions.conditions.length > 0,
      defaultOpen: false,
    },
    {
      key: "colors",
      title: "Couleurs",
      searchable: true,
      condition: filterOptions.colors && filterOptions.colors.length > 0,
      defaultOpen: false,
    },
  ];

  return (
    <aside className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 self-start shadow-sm lg:sticky top-4">
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Filtres</h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150 flex items-center justify-center"
          >
            Réinitialiser tous les filtres
          </button>
        )}

        <PriceSlider
          min={minPrice}
          max={maxPrice}
          values={priceRange}
          onChange={setPriceRange}
        />

        <div className="space-y-4">
          {filterSections.map(
            ({ key, title, searchable, condition, defaultOpen }) =>
              // This `condition` check will now safely evaluate to false if data is missing
              condition && (
                <AccordionFilterSection
                  key={key}
                  filterKey={key} // Pass the key for the handler
                  title={title}
                  options={filterOptions[key]}
                  onFilterChange={onFilterChange}
                  searchable={searchable}
                  defaultOpen={defaultOpen}
                />
              )
          )}
        </div>
      </div>
    </aside>
  );
};

export default Filters;
