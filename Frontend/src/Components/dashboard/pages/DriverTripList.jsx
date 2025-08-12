// src/Components/dashboard/pages/DriverTripList.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaListAlt, FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Loader2, Users, Calendar, MessageSquare } from "lucide-react";
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
    requested: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const style =
    statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

export default function DriverTripList() {
  const token = useSelector((state) => state.user.accessToken);
  const [loading, setLoading] = useState(true);

  // State for tabs and the two separate lists of trips
  const [activeTab, setActiveTab] = useState("available");
  const [availableTrips, setAvailableTrips] = useState([]);
  const [assignedTrips, setAssignedTrips] = useState([]);

  // State for the notes modal
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedTripNotes, setSelectedTripNotes] = useState("");

  // Fetches data for both available and assigned trips in parallel
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const [availableRes, assignedRes] = await Promise.all([
        api.get("/api/v1/vehicle/driver/available-trips/"), // Fetches unassigned trips
        api.get("/api/v1/vehicle/driver/trips/"), // Fetches trips assigned to this driver
      ]);
      setAvailableTrips(availableRes.data.results || availableRes.data || []);
      setAssignedTrips(assignedRes.data.results || assignedRes.data || []);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      Swal.fire("Error", "Could not load trip data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for a driver to accept a trip from the "Available" tab
  const handleAcceptTrip = async (tripId) => {
    const result = await Swal.fire({
      title: "Accept this Trip?",
      text: "This action will assign the trip to you.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Accept It!",
    });

    if (result.isConfirmed) {
      const api = createApiClient();
      try {
        await api.post(`/api/v1/vehicle/trips/${tripId}/accept/`);
        Swal.fire(
          "Accepted!",
          "The trip has been added to your assigned list.",
          "success"
        );
        fetchData(); // Refresh both lists to move the trip from "Available" to "Assigned"
      } catch (error) {
        const errorMsg =
          error.response?.data?.detail || "Could not accept the trip.";
        Swal.fire("Error", errorMsg, "error");
      }
    }
  };

  // Handler for updating the status of an already assigned trip
  const handleUpdateStatus = async (tripId, newStatus) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/vehicle/trips/${tripId}/`, {
        status: newStatus,
      });
      Swal.fire("Success", `Trip status has been updated.`, "success");
      fetchData();
    } catch (error) {
      console.error("Error updating trip status:", error);
      Swal.fire("Error", "Could not update the trip status.", "error");
    }
  };

  const handleViewNotes = (notes) => {
    setSelectedTripNotes(notes);
    setIsNotesModalOpen(true);
  };

  // A single, reusable function to render a table for either trip type
  const renderTable = (trips, type) => (
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
        <tr>
          <th scope="col" className="px-5 py-3">
            Passenger
          </th>
          <th scope="col" className="px-5 py-3">
            Route
          </th>
          <th scope="col" className="px-5 py-3">
            Date
          </th>
          <th scope="col" className="px-5 py-3">
            Details
          </th>
          <th scope="col" className="px-5 py-3">
            Fare
          </th>
          <th scope="col" className="px-5 py-3 text-center">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {trips.length > 0 ? (
          trips.map((trip) => (
            <tr key={trip.id} className="border-b hover:bg-gray-50">
              <td className="px-5 py-4 font-medium">{trip.passenger_name}</td>
              <td className="px-5 py-4">
                {trip.route
                  ? `${trip.route.pickup.name} ➜ ${trip.route.drop.name}`
                  : "N/A"}
              </td>
              <td className="px-5 py-4 text-gray-600">
                {trip.scheduled_for ? (
                  <div className="text-blue-700">
                    <span className="font-semibold block">Scheduled</span>
                    <span className="text-xs">
                      {new Date(trip.scheduled_for).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold block">Requested</span>
                    <span className="text-xs">
                      {new Date(trip.request_time).toLocaleString()}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1.5"
                    title="Passenger Count"
                  >
                    <Users size={16} className="text-gray-500" />
                    {trip.passenger_count}
                  </span>
                  {trip.notes_for_driver && (
                    <span className="text-gray-400">|</span>
                  )}
                  {trip.notes_for_driver && (
                    <button
                      onClick={() => handleViewNotes(trip.notes_for_driver)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Notes"
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                </div>
              </td>
              <td className="px-5 py-4 font-semibold">{trip.fare} AF</td>
              <td className="px-5 py-4 text-center">
                {type === "available" && (
                  <button
                    onClick={() => handleAcceptTrip(trip.pk)}
                    className="action-btn-green flex items-center justify-center gap-1 w-full"
                  >
                    <FaCheck /> Accept
                  </button>
                )}
                {type === "assigned" && (
                  <>
                    {trip.status === "in_progress" ? (
                      <button
                        onClick={() => handleUpdateStatus(trip.id, "completed")}
                        className="action-btn-blue w-full"
                      >
                        Mark as Completed
                      </button>
                    ) : (
                      <StatusBadge status={trip.status} />
                    )}
                  </>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-16 text-gray-500">
              {type === "available"
                ? "No new trip requests on your routes."
                : "You have no assigned trips."}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6 shadow-md rounded-lg max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <FaListAlt /> Driver Dashboard
          </h1>

          <div className="mb-6 flex border-b">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "available"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Available Trip Requests ({availableTrips.length})
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "assigned"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              My Assigned Trips ({assignedTrips.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : activeTab === "available" ? (
              renderTable(availableTrips, "available")
            ) : (
              renderTable(assignedTrips, "assigned")
            )}
          </div>
        </div>
      </div>

      {isNotesModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setIsNotesModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Passenger's Note
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedTripNotes}
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="secondary-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
