import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AttributeInput({ categoryId, onAttributeChange }) {
  const token = useSelector((state) => state.user.accessToken);

  const [allAttributeTypes, setAllAttributeTypes] = useState([]);
  const [allAttributeValues, setAllAttributeValues] = useState([]);
  const [relevantAttributes, setRelevantAttributes] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
console.log(allAttributeValues);

  useEffect(() => {
    if (!token) return;

    const fetchAttributeData = async () => {
      setIsLoading(true);
      try {
        const [typesRes, valuesRes] = await Promise.all([
          // *** FIX 1: Request a large page size to get ALL attributes, bypassing pagination. ***
          axios.get(`${BASE_URL}/api/v1/category/attribute/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page_size: 1000 }, // Request up to 1000 attributes
          }),
          axios.get(`${BASE_URL}/api/v1/category/attribute`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page_size: 1000 }, // Also get all possible values
          }),
        ]);
        setAllAttributeTypes(typesRes.data.results || []);
        setAllAttributeValues(valuesRes.data.results || []);
      } catch (err) {
        console.error("Error fetching attribute data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttributeData();
  }, [token]);

  useEffect(() => {
    if (categoryId && allAttributeTypes.length > 0) {
      // *** FIX 2: Use strict comparison (===) after ensuring types match. ***
      // This is safer than loose comparison (==).
      const filtered = allAttributeTypes.filter(
        (attr) => String(attr.category) === String(categoryId)
      );
      setRelevantAttributes(filtered);

      const initialValues = {};
      filtered.forEach((attr) => {
        initialValues[attr.name] =
          attr.attribute_type === "checkbox" ? false : "";
      });
      setFormValues(initialValues);
      onAttributeChange(initialValues);
    } else {
      setRelevantAttributes([]);
      setFormValues({});
      onAttributeChange({});
    }
  }, [categoryId, allAttributeTypes]); // This dependency array is correct

  const handleChange = (name, value, type) => {
    const newValues = {
      ...formValues,
      [name]: type === "checkbox" ? !formValues[name] : value,
    };
    setFormValues(newValues);
    onAttributeChange(newValues);
  };

  const renderInput = (attr) => {
    switch (attr.attribute_type) {
      case "dropdown":
        const options = allAttributeValues.filter(
          (val) => val.attribute === attr.id
        );
        return (
          <select
            className="input-field w-full"
            value={formValues[attr.name] || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          >
            <option value="">-- Select {attr.name} --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.attribute_value}>
                {opt.attribute_value}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            className="input-field w-full"
            value={formValues[attr.name] || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            className="h-5 w-5 rounded"
            checked={!!formValues[attr.name]}
            onChange={(e) =>
              handleChange(attr.name, e.target.checked, "checkbox")
            }
          />
        );

      case "input":
      default:
        return (
          <input
            type="text"
            className="input-field w-full"
            placeholder={`Enter ${attr.name}`}
            value={formValues[attr.name] || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="col-span-2 p-4 text-center bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">Loading attributes...</p>
      </div>
    );
  }

  // This message now correctly shows only when no category is selected or if there are truly no attributes.
  if (!categoryId || relevantAttributes.length === 0) {
    return (
      <div className="col-span-2 p-4 text-center bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">
          {categoryId
            ? "No attributes defined for this category."
            : "Select a category to see its attributes."}
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-4 p-4 border rounded-md">
      <h3 className="font-medium text-lg">Category Attributes</h3>
      {relevantAttributes.map((attr) => (
        <div key={attr.id}>
          <label className="block mb-1 font-medium">{attr.name}</label>
          {renderInput(attr)}
        </div>
      ))}
    </div>
  );
}
