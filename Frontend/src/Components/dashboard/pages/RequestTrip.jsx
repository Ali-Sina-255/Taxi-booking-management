// src/Components/dashboard/pages/RequestTrip.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaTaxi } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import Select from "react-select";
import axios from "axios";

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
};

export default function RequestTrip() {
  const token = useSelector((state) => state.user.accessToken);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- THIS IS THE SIMPLIFIED, CORRECTED FETCH LOGIC ---
  const fetchRoutes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      // We only need to make one API call to get all the route information.
      const response = await api.get("/api/v1/vehicle/vehicle/routes/");
      const routesData = response.data.results || response.data || [];

      // The backend now provides the full pickup and drop objects, so we can build the label directly.
      const options = routesData
        .map((route) => ({
          value: route.pk, // Use the integer PK that the TripRequestSerializer expects for `route_id`.
          label: `${route.pickup.name} ➜ ${route.drop.name}`,
          price: route.price_af,
          driverCount: route.drivers.length,
        }))
        // Only show routes that have at least one driver assigned.
        .filter((route) => route.driverCount > 0);

      setRouteOptions(options);
    } catch (error) {
      console.error("Error fetching routes:", error);
      Swal.fire(
        "Error",
        "Could not load available routes. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoute || !selectedRoute.value) {
      Swal.fire(
        "No Route Selected",
        "Please choose a route to request a trip.",
        "warning"
      );
      return;
    }

    setSubmitting(true);

    const payload = {
      // `route_id` on the serializer is a PrimaryKeyRelatedField, so it expects the integer PK.
      route_id: selectedRoute.value,
    };

    const api = createApiClient();

    try {
      await api.post("/api/v1/vehicle/trips/", payload);
      Swal.fire({
        icon: "success",
        title: "Trip Requested!",
        text: 'An admin will assign a driver shortly. You can check the status in the "My Trips" section.',
        confirmButtonText: "Great!",
      });
      setSelectedRoute(null);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        "Something went wrong. Please try again.";
      Swal.fire("Request Failed", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3 md:p-6 w-full">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <FaTaxi /> Request a New Trip
          </h1>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Choose your route
                </label>
                <Select
                  options={routeOptions}
                  value={selectedRoute}
                  onChange={setSelectedRoute}
                  styles={selectStyles}
                  placeholder="Select a pickup and drop-off location..."
                  noOptionsMessage={() => "No routes with available drivers."}
                  isClearable
                />
              </div>

              {selectedRoute && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center transition-all duration-300">
                  <p className="text-gray-600">Estimated Trip Fare</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {selectedRoute.price} AF
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="primary-btn w-full flex items-center justify-center disabled:bg-gray-400"
                  disabled={!selectedRoute || submitting || loading}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Request Trip Now"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
