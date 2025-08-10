import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CategoryManagement = () => {
  const token = useSelector((state) => state.user.accessToken);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("category-table")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/category/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.results || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Could not fetch categories.", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const resetForm = () => {
    setCategoryName("");
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingCategory
      ? `${BASE_URL}/api/v1/category/${editingCategory.id}/`
      : `${BASE_URL}/api/v1/category/`;

    const method = editingCategory ? "put" : "post";
    const data = { name: categoryName };

    try {
      const response = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: `Category ${
            editingCategory ? "updated" : "added"
          } successfully.`,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
        resetForm();
        fetchCategories();
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      const errorMessage =
        error.response?.data?.name?.[0] ||
        "An error occurred. Please try again.";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "This operation cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/category/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          title: "Deleted!",
          text: "The category has been deleted successfully.",
          icon: "success",
          timer: 3000,
          timerProgressBar: true,
        });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire("Error", "Failed to delete the category.", "error");
      }
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingCategory(category);
    window.scrollTo(0, 0);
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      {/* Form Section */}
      <div className="w-full py-4 px-5 shadow-lg bg-white pb-14 rounded-md">
        <h2 className="text-xl text-center font-bold mb-4">
          {editingCategory ? "Edit Category" : "Add New Category"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className=" flex flex-col md:flex-row max-w-4xl mx-auto  gap-x-5 justify-center items-center "
        >
          <div className="">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="lg:w-[450px] px-3 py-2 border rounded  bg-gray-200 text-black focus:outline-none"
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="flex justify-center gap-4 py-2">
            <button type="submit" className="secondry-btn">
              {editingCategory ? "Update" : "Add"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="tertiary-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {/* Table Section */}
        <div
          id="category-table"
          className="w-full max-w-5xl mx-auto bg-white mt-5 border border-gray-200 overflow-x-auto"
        >
          <table className="w-full">
            <thead className="bg-green text-gray-100 text-center">
              <tr className="bg-gray-100">
                <th className=" text-black px-6 py-2.5 font-semibold">
                  Category Name
                </th>
                <th className=" px-6 text-black py-2.5 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length > 0 ? (
                currentCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`text-center border-b cursor-pointer hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <td className="px-6 py-2">{category.name}</td>
                    <td className="flex items-center justify-center gap-x-5 px-6 py-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-green-600 hover:scale-105"
                      >
                        <FaRegEdit size={24} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:scale-105"
                      >
                        <IoTrashSharp size={24} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {/* Pagination */}
          {Math.ceil(categories.length / itemsPerPage) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(categories.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
