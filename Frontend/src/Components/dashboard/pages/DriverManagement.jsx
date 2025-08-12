import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaCar, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";

// This file re-uses many components and logic from UserManagement, but is specialized for Drivers.
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

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/profiles/admin/users/");
      const allUsers = response.data.results || response.data || [];
      const driverUsers = allUsers.filter((user) => user.role === "driver");
      setDrivers(driverUsers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      Swal.fire("Error", "Could not load the list of drivers.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return drivers;
    return drivers.filter(
      (driver) =>
        driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drivers, searchTerm]);

  return (
    <div className="p-3 md:p-6 w-full">
      <div className="bg-white p-6 shadow-md rounded-lg max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
          <FaCar /> Driver Management
        </h1>
        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-full"
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Date Joined</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.pkid} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {driver.full_name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{driver.email}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(driver.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          driver.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
