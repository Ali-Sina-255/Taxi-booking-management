import React, { useState, useEffect } from "react";
import { FaChevronDown, FaSearch, FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ATTRIBUTE_TYPE_CHOICES = ["dropdown", "input", "date", "checkbox"];

const Attribute = () => {
  const token = useSelector((state) => state.user.accessToken);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [attributeName, setAttributeName] = useState("");
  const [attributeType, setAttributeType] = useState("input");
  const [editingAttributeId, setEditingAttributeId] = useState(null);

  const [attributesForCategory, setAttributesForCategory] = useState([]);
  const [allAttributeValues, setAllAttributeValues] = useState([]);
  const [managingValuesFor, setManagingValuesFor] = useState(null); // Which attribute we are adding values to
  const [newValue, setNewValue] = useState("");

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/category/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.results);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllAttributeValues = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/category/attribute/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllAttributeValues(response.data.results);
    } catch (error) {
      console.error("Error fetching all attribute values:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchAllAttributeValues();
    }
  }, [token]);

  const fetchAttributesForCategory = async () => {
    if (!selectedCategory) {
      setAttributesForCategory([]);
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/category/attribute/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { category: selectedCategory.id }, // More efficient if backend supports filtering
        }
      );
      const filtered = response.data.results.filter(
        (attr) => attr.category === selectedCategory.id
      );
      setAttributesForCategory(filtered);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  useEffect(() => {
    fetchAttributesForCategory();
  }, [selectedCategory, token]);

  const resetForm = () => {
    setAttributeName("");
    setAttributeType("input");
    setEditingAttributeId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      Swal.fire("Validation Error", "Please select a category first.", "error");
      return;
    }

    const data = {
      name: attributeName,
      attribute_type: attributeType,
      category: selectedCategory.id,
    };

    const url = editingAttributeId
      ? `${BASE_URL}/api/v1/category/attribute/${editingAttributeId}/`
      : `${BASE_URL}/api/v1/category/attribute/`;
    const method = editingAttributeId ? "put" : "post";

    try {
      await axios[method](url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire(
        "Success!",
        `Attribute successfully ${editingAttributeId ? "updated" : "created"}.`,
        "success"
      );
      resetForm();
      fetchAttributesForCategory();
    } catch (error) {
      console.error("Error submitting attribute:", error);
      Swal.fire(
        "Error",
        "There was a problem submitting the attribute.",
        "error"
      );
    }
  };

  const handleEdit = (attr) => {
    setEditingAttributeId(attr.id);
    setAttributeName(attr.name);
    setAttributeType(attr.attribute_type);
    setSelectedCategory(categories.find((c) => c.id === attr.category));
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the attribute and all its values!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/api/v1/category/attribute/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "The attribute has been deleted.", "success");
          fetchAttributesForCategory();
        } catch (error) {
          Swal.fire("Error", "Could not delete the attribute.", "error");
        }
      }
    });
  };

  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const data = {
      attribute: managingValuesFor.id,
      attribute_value: newValue,
    };
    try {
      await axios.post(`${BASE_URL}/api/v1/category/attribute-value/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewValue("");
      fetchAllAttributeValues(); // Re-fetch all values to update list
    } catch (error) {
      console.error("Error adding value:", error);
      Swal.fire(
        "Error",
        "Could not add the value. It might already exist.",
        "error"
      );
    }
  };

  const handleDeleteValue = async (valueId) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/v1/category/attribute-value/${valueId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllAttributeValues(); // Re-fetch to update list
    } catch (error) {
      console.error("Error deleting value:", error);
      Swal.fire("Error", "Could not delete the value.", "error");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 md:p-6 w-full space-y-8">
      {/* --- FORM SECTION --- */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {editingAttributeId ? "Edit Attribute" : "Create New Attribute"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          {/* Category Select */}
          <div className="relative w-full">
            <label className="block font-medium mb-2">Category</label>
            <div
              className="bg-gray-200 w-full px-3 py-2 flex justify-between items-center border rounded-md cursor-pointer"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              {selectedCategory ? selectedCategory.name : "Select a category"}
              <FaChevronDown
                className={`transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isCategoryDropdownOpen && (
              <div className="absolute w-full bg-white border rounded-md shadow-lg mt-1 z-20">
                <div className="relative p-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border-b pl-8"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <li
                      key={cat.id}
                      className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Attribute Name Input */}
          <div>
            <label className="block font-medium mb-2">Attribute Name</label>
            <input
              type="text"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              placeholder="e.g., Color, Size"
              className="w-full px-3 py-2 border rounded  bg-gray-200 text-black focus:outline-none"
              required
            />
          </div>
          {/* Attribute Type Select */}
          <div>
            <label className="block font-medium mb-2">Attribute Type</label>
            <select
              value={attributeType}
              onChange={(e) => setAttributeType(e.target.value)}
              className="w-full px-3 py-2 border rounded  bg-gray-200 text-black focus:outline-none"
            >
              {ATTRIBUTE_TYPE_CHOICES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex justify-center">
            <button type="submit" className="secondry-btn">
              {editingAttributeId ? "Update Attribute" : "Create Attribute"}
            </button>
          </div>
        </form>
      </div>

      {/* --- TABLE & VALUE MANAGEMENT SECTION --- */}
      <div className="bg-white p-6 rounded-md shadow-md ">
        <h2 className="text-xl font-bold mb-4">
          Manage Attributes for:{" "}
          <span className="text-green-600">
            {selectedCategory?.name || "No Category Selected"}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {/* Attribute List */}
          <div className="border rounded-md p-4 overflow-auto">
            <h3 className="font-semibold text-lg mb-2">Attribute List</h3>
            <table className="min-w-[500px] overflow-x-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributesForCategory.length > 0 ? (
                  attributesForCategory.map((attr) => (
                    <tr key={attr.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{attr.name}</td>
                      <td className="px-4 py-2">
                        <span className="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                          {attr.attribute_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 flex gap-x-3">
                        <button
                          onClick={() => handleEdit(attr)}
                          className="text-blue-600"
                        >
                          <FaRegEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(attr.id)}
                          className="text-red-600"
                        >
                          <IoTrashSharp size={18} />
                        </button>
                        {attr.attribute_type === "dropdown" && (
                          <button
                            onClick={() => setManagingValuesFor(attr)}
                            className="text-sm text-green-600 font-semibold"
                          >
                            Values
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No attributes for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Value Management */}
          <div className="border rounded-md p-4">
            <h3 className="font-semibold text-lg mb-2">
              Manage Values for:{" "}
              <span className="text-blue-600">
                {managingValuesFor?.name || "None"}
              </span>
            </h3>
            {managingValuesFor ? (
              <div>
                <form onSubmit={handleAddValue} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Add new value"
                    className="flex-grow p-2 border rounded-md"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add
                  </button>
                </form>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {allAttributeValues
                    .filter((v) => v.attribute === managingValuesFor.id)
                    .map((val) => (
                      <li
                        key={val.id}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                      >
                        <span>{val.attribute_value}</span>
                        <button
                          onClick={() => handleDeleteValue(val.id)}
                          className="text-red-500"
                        >
                          <IoTrashSharp />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">
                Select an attribute of type 'dropdown' to manage its values.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attribute;
