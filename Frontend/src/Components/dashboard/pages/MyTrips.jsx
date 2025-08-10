// src/Components/dashboard/pages/MyTrips.jsx

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FaListAlt } from "react-icons/fa";
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
    requested: "bg-blue-100 text-blue-700 ring-blue-600/20",
    in_progress: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
    completed: "bg-green-100 text-green-700 ring-green-600/20",
    cancelled: "bg-gray-100 text-gray-700 ring-gray-600/20",
    default: "bg-gray-100 text-gray-700 ring-gray-600/20",
  };
  const style = statusStyles[status?.toLowerCase()] || statusStyles.default;
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

export default function MyTrips() {
  const token = useSelector((state) => state.user.accessToken);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeDetails, setRouteDetails] = useState({});

  const fetchTripData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const api = createApiClient();
    try {
      const tripsResponse = await api.get("/api/v1/vehicle/trips/");
      const tripsData = Array.isArray(tripsResponse.data.results)
        ? tripsResponse.data.results
        : tripsResponse.data;
      setTrips(tripsData);

      // --- THIS IS THE GUARANTEED FIX ---
      // 1. Get all route IDs from the trips.
      const routeIds = tripsData.map((trip) => trip.route);
      // 2. Filter out any potential `null` or `undefined` values to prevent the error.
      const validRouteIds = routeIds.filter((id) => id != null);
      // 3. Create a Set of unique, valid IDs.
      const uniqueRouteIds = [...new Set(validRouteIds)];
      // --- END OF FIX ---

      // If there are no valid routes to fetch, we can stop here.
      if (uniqueRouteIds.length === 0) {
        setRouteDetails({});
        return;
      }

      const routePromises = uniqueRouteIds.map((id) =>
        api.get(`/api/v1/vehicle/routes/${id}/`)
      );

      const routeResponses = await Promise.all(routePromises);
      const routeMap = {};
      routeResponses.forEach((res) => {
        routeMap[res.data.id] = res.data;
      });
      setRouteDetails(routeMap);
    } catch (error) {
      console.error("Error fetching trip data:", error);
      Swal.fire("Error", "Could not load your trip history.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  return (
    <div className="p-3 md:p-6 w-full">
      <div className="bg-white p-6 shadow-md rounded-lg max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <FaListAlt /> My Trip History
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
                  <th scope="col" className="px-6 py-3">
                    Route
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date Requested
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fare
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(trips) && trips.length > 0 ? (
                  trips.map((trip) => {
                    const routeInfo = routeDetails[trip.route];
                    return (
                      <tr key={trip.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {routeInfo
                            ? `${routeInfo.pickup.name} ➜ ${routeInfo.drop.name}`
                            : `Route ID: ${trip.route}`}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(trip.request_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{trip.fare} AF</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={trip.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-gray-500">
                      You have not requested any trips yet.
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
