// src/Components/dashboard/pages/DriverTripList.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaListAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
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

const StatusBadge = ({ status }) => {
  const statusStyles = {
    requested: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const style =
    statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10 ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

export default function DriverTripList() {
  const token = useSelector((state) => state.user.accessToken);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/vehicle/driver/trips/");
      setTrips(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      Swal.fire("Error", "Could not load assigned trips.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleUpdateStatus = async (tripId, newStatus) => {
    const api = createApiClient();
    try {
      // Your TripDetailView uses the integer PK for the lookup
      await api.patch(`/api/v1/vehicle/trips/${tripId}/`, {
        status: newStatus,
      });
      Swal.fire(
        "Success",
        `Trip status updated to "${newStatus.replace("_", " ")}".`,
        "success"
      );
      fetchTrips(); // Refresh the list
    } catch (error) {
      console.error(
        "Error updating trip status:",
        error.response?.data || error
      );
      Swal.fire("Error", "Could not update the trip status.", "error");
    }
  };

  return (
    <div className="p-3 md:p-6 w-full">
      <div className="bg-white p-6 shadow-md rounded-lg ">
        <h1 className="text-2xl text-center font-bold font-Ray_black text-gray-800 mb-6 border-b pb-4 flex items-center justify-center gap-3">
          <FaListAlt /> سفرهای تخصیص یافته من
        </h1>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full text-sm text-center text-gray-500">
              <thead className="text-base text-gray-700 uppercase bg-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    مسافر
                  </th>
                  <th scope="col" className="px-6 py-3">
                    مسیر
                  </th>
                  <th scope="col" className="px-6 py-3">
                    کرایه
                  </th>
                  <th scope="col" className="px-6 py-3">
                    تاریخ
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    وضعیت
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(trips) && trips.length > 0 ? (
                  trips.map((trip, index) => (
                    <tr
                      key={trip.id}
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 1 ? "bg-gray-100" : ""
                      } `}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {trip.passenger_name}
                      </td>
                      <td className="px-6 py-4">
                        {trip.pickup} ➜ {trip.drop}
                      </td>
                      <td className="px-6 py-4">{trip.fare} AF</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(trip.request_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {trip.status === "requested" && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(trip.id, "in_progress")
                              }
                              className="action-btn-green flex items-center gap-1"
                            >
                              <FaCheck /> Accept
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(trip.id, "cancelled")
                              }
                              className="action-btn-red flex items-center gap-1"
                            >
                              <FaTimes /> Decline
                            </button>
                          </div>
                        )}
                        {trip.status === "in_progress" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(trip.id, "completed")
                            }
                            className="action-btn-blue flex items-center gap-1"
                          >
                            <FaCheck /> Mark as Completed
                          </button>
                        )}
                        {(trip.status === "completed" ||
                          trip.status === "cancelled") && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-500">
                      در حال حاضر هیچ سفر تخصیص یافته‌ای ندارید.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
