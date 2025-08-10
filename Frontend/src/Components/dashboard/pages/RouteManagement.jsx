// src/Components/dashboard/pages/RouteManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaRoute } from "react-icons/fa";
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
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "#dbeafe"
      : "white",
    color: state.isSelected ? "white" : "black",
    cursor: "pointer",
  }),
  multiValue: (provided) => ({ ...provided, backgroundColor: "#dbeafe" }),
  multiValueLabel: (provided) => ({ ...provided, color: "#1e40af" }),
};

export default function RouteManagement() {
  const token = useSelector((state) => state.user.accessToken);

  const initialFormState = {
    pickup_id: null,
    drop_id: null,
    price_af: "",
    drivers: [],
    vehicles: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const [locationOptions, setLocationOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [driverLookup, setDriverLookup] = useState({});

  useEffect(() => {
    if (!token) return;
    const api = createApiClient();
    const fetchRelatedData = async () => {
      try {
        const [locationsRes, profilesRes, vehiclesRes] = await Promise.all([
          api.get("/api/v1/vehicle/locations/"),
          api.get("/api/v1/profiles/all/"),
          api.get("/api/v1/vehicle/vehicles/"),
        ]);

        const locations = Array.isArray(locationsRes.data.results)
          ? locationsRes.data.results
          : locationsRes.data;
        setLocationOptions(
          locations.map((loc) => ({ value: loc.id, label: loc.name }))
        );

        const profiles = profilesRes.data?.profiles?.results || [];
        const drivers = profiles.filter((p) => p.role === "driver");
        setDriverOptions(
          drivers.map((d) => ({ value: d.id, label: d.full_name }))
        );

        const vehicles = Array.isArray(vehiclesRes.data.results)
          ? vehiclesRes.data.results
          : vehiclesRes.data;
        setVehicleOptions(
          vehicles.map((v) => ({
            value: v.id,
            label: `${v.model} - ${v.plate_number}`,
          }))
        );

        const lookup = {};
        drivers.forEach((driver) => {
          lookup[driver.id] = driver.full_name;
        });
        setDriverLookup(lookup);
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };
    fetchRelatedData();
  }, [token]);

  const fetchRoutes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const api = createApiClient();
      const response = await api.get("/api/v1/vehicle/routes/");
      setRoutes(
        Array.isArray(response.data.results)
          ? response.data.results
          : response.data
      );
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingRoute(null);
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData((prev) => ({
      ...prev,
      [name]:
        selectedOption ||
        (name === "drivers" || name === "vehicles" ? [] : null),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.pickup_id?.value ||
      !formData.drop_id?.value ||
      !formData.price_af
    ) {
      Swal.fire(
        "Missing Information",
        "Please select pickup, drop-off, and set a price.",
        "error"
      );
      return;
    }

    if (formData.pickup_id.value === formData.drop_id.value) {
      Swal.fire(
        "Invalid Route",
        "Pickup and Drop-off locations cannot be the same.",
        "error"
      );
      return;
    }

    const isDuplicate = routes.some((route) =>
      editingRoute && route.id === editingRoute.id
        ? false
        : route.pickup.id === formData.pickup_id.value &&
          route.drop.id === formData.drop_id.value
    );

    if (isDuplicate) {
      Swal.fire(
        "Duplicate Route",
        "A route with this pickup and drop-off already exists.",
        "error"
      );
      return;
    }

    // --- THIS IS THE FINAL, CORRECTED PAYLOAD LOGIC ---
    const payload = {
      pickup_id: Number(formData.pickup_id.value),
      drop_id: Number(formData.drop_id.value),
      price_af: formData.price_af,
      drivers: Array.isArray(formData.drivers)
        ? formData.drivers.map((d) => Number(d.value))
        : [],
      vehicles: Array.isArray(formData.vehicles)
        ? formData.vehicles.map((v) => Number(v.value))
        : [],
    };
    // --- END OF FIX ---

    const api = createApiClient();
    const url = editingRoute
      ? `/api/v1/vehicle/routes/${editingRoute.id}/`
      : "/api/v1/vehicle/routes/";
    const method = editingRoute ? "put" : "post";

    try {
      await api[method](url, payload);
      Swal.fire(
        "Success!",
        `Route ${editingRoute ? "updated" : "created"} successfully.`,
        "success"
      );
      resetForm();
      fetchRoutes();
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      Swal.fire(
        "Submission Error",
        "The server rejected the request. Please check that all fields are correct.",
        "error"
      );
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      pickup_id: locationOptions.find((opt) => opt.value === route.pickup.id),
      drop_id: locationOptions.find((opt) => opt.value === route.drop.id),
      price_af: route.price_af,
      drivers: route.drivers
        .map((id) => driverOptions.find((d) => d.value === id))
        .filter(Boolean),
      vehicles: route.vehicles
        .map((id) => vehicleOptions.find((v) => v.value === id))
        .filter(Boolean),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const api = createApiClient();
        await api.delete(`/api/v1/vehicle/routes/${id}/`);
        Swal.fire("Deleted!", "The route has been deleted.", "success");
        fetchRoutes();
      } catch (error) {
        Swal.fire("Error", "Failed to delete the route.", "error");
      }
    }
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5 shadow-lg bg-white pb-14 rounded-md">
        <h2 className="text-2xl text-center font-bold mb-6 flex items-center justify-center gap-2">
          <FaRoute /> {editingRoute ? "Edit Route" : "Create New Route"}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Pickup Location</label>
              <Select
                name="pickup_id"
                options={locationOptions}
                value={formData.pickup_id}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Search..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Drop-off Location
              </label>
              <Select
                name="drop_id"
                options={locationOptions}
                value={formData.drop_id}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Search..."
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Price (AF)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_af}
              onChange={(e) =>
                setFormData({ ...formData, price_af: e.target.value })
              }
              className="w-full input-field"
              placeholder="e.g. 250.00"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">
                Available Drivers
              </label>
              <Select
                isMulti
                name="drivers"
                options={driverOptions}
                value={formData.drivers}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Select..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Available Vehicles
              </label>
              <Select
                isMulti
                name="vehicles"
                options={vehicleOptions}
                value={formData.vehicles}
                onChange={handleSelectChange}
                styles={selectStyles}
                placeholder="Select..."
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button type="submit" className="primary-btn">
              {editingRoute ? "Update Route" : "Create Route"}
            </button>
            {editingRoute && (
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
          id="route-table"
          className="w-full mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto"
        >
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Route
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Assigned Drivers
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : Array.isArray(routes) && routes.length > 0 ? (
                routes.map((route) => (
                  <tr key={route.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {route.pickup.name} ➜ {route.drop.name}
                    </td>
                    <td className="px-6 py-4">{route.price_af} AF</td>
                    <td className="px-6 py-4 text-xs">
                      {route.drivers
                        .map((driverId) => driverLookup[driverId] || "Unknown")
                        .join(", ") || "None"}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(route)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Route"
                      >
                        <FaRegEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Route"
                      >
                        <IoTrashSharp size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No routes have been created yet.
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
