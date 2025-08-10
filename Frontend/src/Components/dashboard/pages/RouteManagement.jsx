

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaRegEdit, FaRoute } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
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

export default function RouteManagement() {
  const token = useSelector((state) => state.user.accessToken);

  const initialFormState = {
    pickup_id: "",
    drop_id: "",
    price_af: "",
    drivers: [],
    vehicles: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data for select dropdowns
  const [allLocations, setAllLocations] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
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
        
        setAllLocations(Array.isArray(locationsRes.data.results) ? locationsRes.data.results : locationsRes.data);
        
        // --- THIS IS THE FIX ---
        // Correctly access the nested results array from the profiles endpoint.
        const profilesList = profilesRes.data?.profiles?.results || [];
        // --- END OF FIX ---
        
        const availableDrivers = profilesList.filter(p => p.role === 'driver');
        setAllDrivers(availableDrivers);

        const lookup = {};
        availableDrivers.forEach(driver => {
          lookup[driver.id] = driver.full_name;
        });
        setDriverLookup(lookup);

        setAllVehicles(Array.isArray(vehiclesRes.data.results) ? vehiclesRes.data.results : vehiclesRes.data);

      } catch (error) {
        console.error("Error fetching related data:", error);
        Swal.fire("Error", "Could not load data needed for routes.", "error");
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
      setRoutes(Array.isArray(response.data.results) ? response.data.results : response.data);
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

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const value = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api = createApiClient();
    const url = editingRoute
      ? `/api/v1/vehicle/routes/${editingRoute.id}/`
      : "/api/v1/vehicle/routes/";
    const method = editingRoute ? "put" : "post";

    try {
      await api[method](url, formData);
      Swal.fire("Success!", `Route ${editingRoute ? "updated" : "created"} successfully.`, "success");
      resetForm();
      fetchRoutes();
    } catch (error) {
      const errorMsg = error.response?.data?.unique_together?.[0] || error.response?.data?.non_field_errors?.[0] || "An error occurred. A route with this pickup and drop-off may already exist.";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      pickup_id: route.pickup.id,
      drop_id: route.drop.id,
      price_af: route.price_af,
      drivers: route.drivers || [], 
      vehicles: route.vehicles || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
      // Unchanged from previous version
  };

  return (
    <div className="p-3 md:p-6 w-full px-5">
      <div className="w-full py-4 px-5 shadow-lg bg-white pb-14 rounded-md">
        <h2 className="text-2xl text-center font-bold mb-6 flex items-center justify-center gap-2">
          <FaRoute /> {editingRoute ? "Edit Route" : "Create New Route"}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Pickup Location</label>
                    <select name="pickup_id" value={formData.pickup_id} onChange={(e) => setFormData({...formData, pickup_id: e.target.value})} className="w-full input-field" required>
                        <option value="">Select Pickup</option>
                        {allLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Drop-off Location</label>
                    <select name="drop_id" value={formData.drop_id} onChange={(e) => setFormData({...formData, drop_id: e.target.value})} className="w-full input-field" required>
                        <option value="">Select Drop-off</option>
                        {allLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Price (AF)</label>
                    <input type="number" step="0.01" name="price_af" value={formData.price_af} onChange={(e) => setFormData({...formData, price_af: e.target.value})} className="w-full input-field" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Available Drivers</label>
                    <select name="drivers" value={formData.drivers} onChange={handleMultiSelectChange} className="w-full input-field h-32" multiple>
                        {allDrivers.map(driver => <option key={driver.id} value={driver.id}>{driver.full_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Available Vehicles</label>
                    <select name="vehicles" value={formData.vehicles} onChange={handleMultiSelectChange} className="w-full input-field h-32" multiple>
                        {allVehicles.map(v => <option key={v.id} value={v.id}>{v.model} - {v.plate_number}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
                <button type="submit" className="primary-btn">{editingRoute ? "Update Route" : "Create Route"}</button>
                {editingRoute && <button type="button" onClick={resetForm} className="secondary-btn">Cancel Edit</button>}
            </div>
        </form>

        <div id="route-table" className="w-full mx-auto bg-white mt-10 border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Route</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Assigned Drivers</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : Array.isArray(routes) && routes.length > 0 ? (
                routes.map((route) => (
                  <tr key={route.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{route.pickup.name} ➜ {route.drop.name}</td>
                    <td className="px-6 py-4">{route.price_af} AF</td>
                    <td className="px-6 py-4 text-xs">
                        {route.drivers.map(driverId => driverLookup[driverId] || 'Unknown').join(', ') || 'None'}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-4">
                      <button onClick={() => handleEdit(route)} className="text-blue-600 hover:text-blue-800" title="Edit Route"><FaRegEdit size={20} /></button>
                      <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:text-red-800" title="Delete Route"><IoTrashSharp size={20} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No routes have been created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}