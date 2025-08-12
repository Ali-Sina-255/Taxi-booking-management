// src/Pages/City.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

// This is a public page, so we don't need an authenticated API client
const publicApi = axios.create({ baseURL: BASE_URL });

export default function City() {
  // State for the component
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [locationsRes, routesRes] = await Promise.all([
        publicApi.get("/api/v1/vehicle/locations/"),
        publicApi.get("/api/v1/vehicle/vehicle/routes/"),
      ]);
      setLocations(locationsRes.data.results || locationsRes.data || []);
      setRoutes(routesRes.data.results || routesRes.data || []);
    } catch (error) {
      console.error("Error fetching public data:", error);
      Swal.fire("Error", "Could not load city and route data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromCity || !toCity || !phoneNumber) {
      Swal.fire("Incomplete Information", "Please fill out all fields.", "warning");
      return;
    }
    if (fromCity === toCity) {
      Swal.fire("Invalid Selection", "The start and destination cities cannot be the same.", "warning");
      return;
    }

    const selectedRoute = routes.find(
      (route) => route.pickup.pk.toString() === fromCity && route.drop.pk.toString() === toCity
    );

    if (!selectedRoute) {
      Swal.fire("Route Not Available", "Sorry, we do not currently operate on the selected route.", "info");
      return;
    }

    setSubmitting(true);
    const payload = {
      route_pk: selectedRoute.pk,
      phone_number: phoneNumber,
    };

    try {
      await publicApi.post('/api/v1/vehicle/guest-trip/', payload);
      setRequested(true);
    } catch (error) {
      console.error("Error submitting guest request:", error);
      Swal.fire("Submission Failed", "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        شهرهای تحت پوشش و درخواست سفر
      </h1>
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold mb-6">شهرهای فعال ما</h2>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" size={48} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div key={location.id} className="border rounded-lg p-6 shadow-md bg-white">
                <h3 className="text-xl font-bold mb-3">{location.name}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          درخواست سفر بین شهری
        </h2>
        {requested ? (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded text-center">
            درخواست شما با موفقیت ثبت شد! منتظر تماس ما باشید.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label htmlFor="fromCity" className="block mb-2 font-medium text-gray-700">شهر مبدا</label>
              <select id="fromCity" value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="w-full input-field" required>
                <option value="">انتخاب کنید</option>
                {locations.map((loc) => (<option key={loc.pk} value={loc.pk}>{loc.name}</option>))}
              </select>
            </div>

            <div>
              <label htmlFor="toCity" className="block mb-2 font-medium text-gray-700">شهر مقصد</label>
              <select id="toCity" value={toCity} onChange={(e) => setToCity(e.target.value)} className="w-full input-field" required>
                <option value="">انتخاب کنید</option>
                {locations.map((loc) => (<option key={loc.pk} value={loc.pk}>{loc.name}</option>))}
              </select>
            </div>
            
            <div>
                <label htmlFor="phoneNumber" className="block mb-2 font-medium text-gray-700">شماره تماس</label>
                <input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full input-field" required placeholder="07..." />
            </div>

            <button type="submit" className="primary-btn w-full flex items-center justify-center" disabled={submitting || loading}>
              {submitting ? <Loader2 className="animate-spin" /> : "ارسال درخواست"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}