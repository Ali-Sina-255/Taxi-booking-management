// src/Components/dashboard/pages/VehicleManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCar, FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import Select from "react-select";

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

const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "42px",
    boxShadow: "none",
    "&:hover": { borderColor: "#9ca3af" },
  }),
};

export default function VehicleManagement() {
  const { profile, currentUser } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.accessToken);

  const initialFormState = {
    model: "",
    plate_number: "",
    type: "economy",
    license: null,
    driver: null, // This will hold the selected driver object for admins
  };

  const [formData, setFormData] = useState(initialFormState);
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverOptions, setDriverOptions] = useState([]);

  // --- NEW: Fetch the list of drivers, but only if the user is an admin ---
  useEffect(() => {
    if (profile?.role !== "admin" || !token) return;

    const fetchDrivers = async () => {
      try {
        const api = createApiClient();
        const response = await api.get("/api/v1/profiles/all/");
        const allProfiles = response.data?.profiles?.results || [];
        const drivers = allProfiles.filter((p) => p.role === "driver");

        // Use the integer 'user_pkid' for the value, which the backend expects
        setDriverOptions(
          drivers.map((d) => ({ value: d.user_pkid, label: d.full_name }))
        );
      } catch (error) {
        console.error("Error fetching drivers:", error);
        Swal.fire("Error", "Could not load the list of drivers.", "error");
      }
    };
    fetchDrivers();
  }, [profile, token]);

  // Fetch all vehicles to display in the table
  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createApiClient();
      // An admin sees all vehicles, a driver will see all for now (can be filtered later)
      const response = await api.get("/api/v1/vehicle/vehicles/");
      setVehicles(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingVehicle(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, license: e.target.files[0] }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, driver: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for admin
    if (profile?.role === "admin" && !formData.driver) {
      Swal.fire(
        "Missing Driver",
        "As an admin, you must select a driver for the vehicle.",
        "error"
      );
      return;
    }

    const payload = new FormData();
    payload.append("model", formData.model);
    payload.append("plate_number", formData.plate_number);
    payload.append("type", formData.type);

    // --- NEW: Conditionally add the driver ID to the payload ---
    // If user is admin, append the selected driver's integer PK.
    // If user is driver, do nothing (backend will assign them automatically).
    if (profile?.role === "admin" && formData.driver) {
      payload.append("driver", formData.driver.value);
    }

    if (formData.license && formData.license instanceof File) {
      payload.append("license", formData.license);
    }

    const api = createApiClient();
    const url = editingVehicle
      ? `/api/v1/vehicle/vehicles/${editingVehicle.id}/`
      : "/api/v1/vehicle/vehicles/";
    const method = editingVehicle ? "patch" : "post"; // PATCH is better for updates with optional files

    try {
      await api[method](url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire(
        "Success!",
        `Vehicle ${editingVehicle ? "updated" : "created"} successfully.`,
        "success"
      );
      resetForm();
      fetchVehicles();
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg =
        Object.values(errorData).flat().join(" ") || "An error occurred.";
      Swal.fire("Submission Error", errorMsg, "error");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      license: null,
      // If admin, pre-fill the driver dropdown
      driver: driverOptions.find((opt) => opt.value === vehicle.driver) || null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
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
          <FaCar /> {editingVehicle ? "Edit Vehicle" : "Manage Vehicles"}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* --- NEW: This entire div is now conditional and only shows for Admins --- */}
          {profile?.role === "admin" && (
            <div>
              <label className="block mb-2 font-medium">Assign to Driver</label>
              <Select
                name="driver"
                options={driverOptions}
                value={formData.driver}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Select a driver..."
                isLoading={!driverOptions.length}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Vehicle Model</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full input-field"
                placeholder="e.g., Toyota Corolla"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Plate Number</label>
              <input
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                className="w-full input-field"
                placeholder="e.g., 4-12345"
                required
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Vehicle Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full input-field"
            >
              <option value="economy">Economy</option>
              <option value="luxury">Luxury</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="electric">Electric</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">
              {editingVehicle
                ? "Upload New License (Optional)"
                : "Driver's License"}
            </label>
            <input
              type="file"
              name="license"
              onChange={handleFileChange}
              className="w-full file-input"
              required={!editingVehicle}
            />
            {editingVehicle && (
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep the current license.
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" className="primary-btn">
              {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
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
          className="w-full mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto"
        >
          <h3 className="text-xl font-bold p-4 bg-gray-50 border-b">
            Existing Vehicles
          </h3>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Model
                </th>
                <th scope="col" className="px-6 py-3">
                  Plate No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-center">
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
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{vehicle.model}</td>
                    <td className="px-6 py-4">{vehicle.plate_number}</td>
                    <td className="px-6 py-4 capitalize">{vehicle.type}</td>
                    <td className="px-6 py-4">{vehicle.driver_name}</td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
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
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
