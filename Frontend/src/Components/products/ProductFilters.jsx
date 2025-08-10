// src/components/products/ProductFilters.jsx

import React from "react";
import { Loader } from "lucide-react";

const ProductFilters = ({ filters, isLoading, error, onFilterChange }) => {
  if (isLoading) {
    return (
      <div>
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">در حال بارگیری فیلترها...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!filters || filters.length === 0) {
    return <div className="text-sm text-gray-500">هیچ فیلتری یافت نشد.</div>;
  }

  return (
    <div className="space-y-6">
      {filters.map((filter) => (
        <div key={filter.id}>
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            {filter.name}
          </h3>
          <div className="space-y-2">
            {filter.options &&
              filter.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => onFilterChange(filter.id, option.id)}
                  className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {option.value}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductFilters;
