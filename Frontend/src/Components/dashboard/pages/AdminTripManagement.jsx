// src/Components/dashboard/pages/AdminTripManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaTaxi, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

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

const StatusBadge = ({ status }) => {
  const statusStyles = {
    requested: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const style =
    statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const statusText = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 ${style}`}
    >
      {statusText}
    </span>
  );
};

// --- NEW COMPONENT: The Assignment Modal ---
const AssignmentModal = ({ trip, drivers, onClose, onAssign }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!trip) return null;

  const handleConfirm = async () => {
    if (!selectedDriver) {
      Swal.fire("No Driver", "Please select a driver to assign.", "warning");
      return;
    }
    setIsSubmitting(true);
    await onAssign(trip.id, selectedDriver.value);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Assign Driver to Trip
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="font-semibold">Passenger:</p>
            <p className="text-gray-700">{trip.passenger}</p>
          </div>
          <div>
            <p className="font-semibold">Route:</p>
            <p className="text-gray-700">
              {trip.route.pickup.name} ➜ {trip.route.drop.name}
            </p>
          </div>
          <div>
            <label className="block mb-2 font-medium">Select Driver:</label>
            <Select
              options={drivers}
              value={selectedDriver}
              onChange={setSelectedDriver}
              placeholder="Search for a driver..."
              isClearable
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="primary-btn flex items-center justify-center"
            disabled={!selectedDriver || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm Assignment"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AdminTripManagement() {
  const token = useSelector((state) => state.user.accessToken);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverOptions, setDriverOptions] = useState([]);

  // --- NEW STATE: To manage which trip is being assigned in the modal ---
  const [assigningTrip, setAssigningTrip] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const [tripsRes, profilesRes] = await Promise.all([
        api.get("/api/v1/vehicle/admin/trips/"),
        api.get("/api/v1/profiles/all/"),
      ]);

      setTrips(tripsRes.data.results || tripsRes.data || []);

      const allProfiles = profilesRes.data?.profiles?.results || [];
      const drivers = allProfiles.filter((p) => p.role === "driver");
      setDriverOptions(
        drivers.map((d) => ({ value: d.user_pkid, label: d.full_name }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire(
        "Error",
        "Could not load data. Please refresh the page.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignDriver = async (tripId, driverId) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/vehicle/trips/${tripId}/`, {
        driver: driverId,
        status: "in_progress",
      });
      Swal.fire("Success!", "Trip has been assigned to the driver.", "success");
      setAssigningTrip(null); // Close the modal on success
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error assigning driver:", error.response?.data || error);
      Swal.fire("Error", "Failed to assign trip.", "error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {assigningTrip && (
          <AssignmentModal
            trip={assigningTrip}
            drivers={driverOptions}
            onClose={() => setAssigningTrip(null)}
            onAssign={handleAssignDriver}
          />
        )}
      </AnimatePresence>

      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6 shadow-md rounded-lg max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <FaTaxi /> Trip Management
          </h1>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Passenger</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Fare</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length > 0 ? (
                    trips.map((trip) => (
                      <tr key={trip.id} className="border-b">
                        <td className="px-6 py-4 font-medium">
                          {trip.passenger}
                        </td>
                        <td className="px-6 py-4">
                          {trip.route.pickup.name} ➜ {trip.route.drop.name}
                        </td>
                        <td className="px-6 py-4">{trip.fare} AF</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          {trip.status === "requested" ? (
                            <button
                              onClick={() => setAssigningTrip(trip)}
                              className="secondary-btn"
                            >
                              Assign Driver
                            </button>
                          ) : (
                            trip.driver_name || "N/A"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-500"
                      >
                        No pending trip requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
