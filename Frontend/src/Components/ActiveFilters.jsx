// src/components/ActiveFilters.jsx
import React from "react";
import { X } from "lucide-react";

const ActiveFilters = ({ activeFilters, onRemoveFilter, onResetFilters }) => {
  const filtersList = Object.entries(activeFilters).flatMap(
    ([type, valuesSet]) =>
      Array.from(valuesSet).map((value) => ({ type, value }))
  );

  if (filtersList.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center flex-wrap gap-2">
      <span className="text-sm font-medium text-indigo-900">Active:</span>
      {filtersList.map(({ type, value }) => (
        <span
          key={`${type}-${value}`}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 py-1 pl-3 pr-2 text-sm font-medium text-indigo-700 border border-indigo-100"
        >
          {value}
          <button
            type="button"
            onClick={() => onRemoveFilter(type, value)}
            className="ml-1.5 flex-shrink-0 rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 transition-colors duration-150"
          >
            <span className="sr-only">Remove filter for {value}</span>
            <X size={14} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onResetFilters}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
      >
        Reset All
      </button>
    </div>
  );
};

export default ActiveFilters;
