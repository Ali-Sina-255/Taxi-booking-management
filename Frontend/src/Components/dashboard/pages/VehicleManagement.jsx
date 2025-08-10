// src/Components/dashboard/pages/VehicleManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaCar } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { store } from "../../../state/store";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

export default function VehicleManagement() {
  const { accessToken: token, profile } = useSelector((state) => state.user);

  const initialFormState = {
    model: "",
    plate_number: "",
    license: null,
    type: "economy",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const PAGE_SIZE = 5;

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createApiClient();
      const response = await api.get("/api/v1/vehicle/vehicles/", {
        params: { page: currentPage, page_size: PAGE_SIZE },
      });

      // --- THE FIX IS HERE ---
      // Check if the response is paginated (has a .results key) or is a direct array.
      const vehiclesData = Array.isArray(response.data.results)
        ? response.data.results
        : response.data;

      const count =
        response.data.count !== undefined
          ? response.data.count
          : vehiclesData.length;

      setVehicles(vehiclesData);
      setTotalVehicles(count);
      setTotalPages(Math.ceil(count / PAGE_SIZE));
      // --- END OF FIX ---
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
      Swal.fire("Error", "Could not fetch your vehicles.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, PAGE_SIZE]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingVehicle(null);
    const fileInput = document.getElementById("license-input");
    if (fileInput) fileInput.value = "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, license: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile || profile.role !== "driver") {
      Swal.fire("Error", "You must be a driver to manage vehicles.", "error");
      return;
    }

    const data = new FormData();
    data.append("model", formData.model);
    data.append("plate_number", formData.plate_number);
    data.append("type", formData.type);
    if (formData.license) {
      data.append("license", formData.license);
    }

    const isEditing = !!editingVehicle;
    const url = isEditing
      ? `/api/v1/vehicle/vehicles/${editingVehicle.id}/`
      : "/api/v1/vehicle/vehicles/";
    const method = isEditing ? "put" : "post";
    const api = createApiClient();

    try {
      await api[method](url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Vehicle ${isEditing ? "updated" : "added"} successfully.`,
      });

      resetForm();

      if (!isEditing) {
        const newTotal = totalVehicles + 1;
        const newLastPage = Math.ceil(newTotal / PAGE_SIZE);
        if (currentPage === newLastPage) {
          fetchVehicles();
        } else {
          setCurrentPage(newLastPage);
        }
      } else {
        fetchVehicles();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.plate_number?.[0] ||
        "An error occurred. Please check your data.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      license: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This vehicle will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const api = createApiClient();
        await api.delete(`/api/v1/vehicle/vehicles/${id}/`);
        Swal.fire("Deleted!", "The vehicle has been deleted.", "success");
        fetchVehicles();
      } catch (error) {
        Swal.fire("Error", "Failed to delete the vehicle.", "error");
      }
    }
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5 shadow-lg bg-white pb-14 rounded-md">
        <h2 className="text-2xl text-center font-bold mb-6 flex items-center justify-center gap-2">
          <FaCar /> {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleFormChange}
                placeholder="e.g., Toyota Corolla"
                className="w-full input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Plate Number</label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleFormChange}
                placeholder="e.g., 4-12345"
                className="w-full input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Vehicle Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full input-field"
                required
              >
                <option value="economy">Economy</option>
                <option value="luxury">Luxury</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">License Image</label>
              <input
                type="file"
                name="license"
                id="license-input"
                onChange={handleFileChange}
                className="w-full file-input"
                accept="image/*"
              />
              {editingVehicle && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep the current license.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" className="primary-btn">
              {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
            </button>
            {editingVehicle && (
              <button
                type="button"
                onClick={resetForm}
                className="secondary-btn"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div
          id="vehicle-table"
          className="w-full max-w-5xl mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  License
                </th>
                <th scope="col" className="px-6 py-3">
                  Model
                </th>
                <th scope="col" className="px-6 py-3">
                  Plate Number
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : Array.isArray(vehicles) && vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a
                        href={vehicle.license}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={vehicle.license}
                          alt="License"
                          className="w-16 h-10 object-cover rounded-md"
                        />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4">{vehicle.plate_number}</td>
                    <td className="px-6 py-4 capitalize">{vehicle.type}</td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Vehicle"
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Vehicle"
                      >
                        <IoTrashSharp size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    You have not added any vehicles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalVehicles > PAGE_SIZE && !loading && (
          <div className="flex items-center justify-between mt-4 max-w-5xl mx-auto">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage <= 1}
                className="pagination-btn"
              >
                <ChevronLeft className="h-5 w-5 mr-1" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= totalPages}
                className="pagination-btn"
              >
                Next <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
