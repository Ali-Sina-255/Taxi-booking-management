import React from "react";
import { Disclosure } from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";

const FilterGroup = ({ attribute, activeValues, onFilterChange }) => {
  return (
    <Disclosure as="div" className="border-b border-gray-200 py-6" defaultOpen>
      {({ open }) => (
        <>
          <h3 className="-my-3 flow-root">
            <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
              <span className="font-medium text-gray-900">
                {attribute.name}
              </span>
              <span className="ml-6 flex items-center">
                {open ? (
                  <MinusIcon className="h-5 w-5" />
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
              </span>
            </Disclosure.Button>
          </h3>
          <Disclosure.Panel className="pt-6">
            <div className="space-y-4">
              {attribute.values.map((value) => (
                <div key={value.id} className="flex items-center">
                  <input
                    id={`filter-${attribute.name}-${value.id}`}
                    name={`${attribute.name}[]`}
                    value={value.attribute_value}
                    type="checkbox"
                    checked={activeValues.includes(value.attribute_value)}
                    onChange={(e) =>
                      onFilterChange(
                        attribute.name,
                        e.target.value,
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`filter-${attribute.name}-${value.id}`}
                    className="ml-3 text-sm text-gray-600"
                  >
                    {value.attribute_value}
                  </label>
                </div>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default FilterGroup;
