// src/Components/AccordionFilterSection.jsx
import React, { useState } from "react";

const AccordionFilterSection = ({
  filterKey, // THE FIX: Receive the data key
  title,
  options,
  onFilterChange,
  searchable = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <span className="text-gray-500">
          {isOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {searchable && (
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  // THE FIX: Pass the filterKey ("brands") instead of the title ("Brands")
                  onChange={() => onFilterChange(filterKey, option)}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionFilterSection;
