import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Loader2, Send, Users, Calendar, MessageSquare } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

export default function City() {
  // Get the authentication token from the Redux store
  const accessToken = useSelector((state) => state.user.accessToken);

  // State for data fetched from the API
  const [routes, setRoutes] = useState([]);

  // State for the component's UI and form flow
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // For the confirmation modal

  // State for all form fields, including the new details
  const [selectedPickup, setSelectedPickup] = useState("");
  const [selectedDropoff, setSelectedDropoff] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    // If the user isn't logged in, don't try to fetch data
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const routesRes = await axios.get(
        `${BASE_URL}/api/v1/vehicle/vehicle/routes/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setRoutes(routesRes.data.results || routesRes.data || []);
    } catch (error) {
      console.error("Error fetching route data:", error);
      // Don't show a popup here, the component will render a message
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Dynamic Logic for Dropdowns (Memoized for performance) ---
  const pickupLocations = useMemo(() => {
    const locations = new Map();
    routes.forEach((route) => {
      if (!locations.has(route.pickup.id)) {
        locations.set(route.pickup.id, route.pickup);
      }
    });
    return Array.from(locations.values());
  }, [routes]);

  const dropoffLocations = useMemo(() => {
    if (!selectedPickup) return [];
    return routes
      .filter((route) => route.pickup.id === selectedPickup)
      .map((route) => route.drop);
  }, [selectedPickup, routes]);

  const selectedRoute = useMemo(() => {
    if (!selectedPickup || !selectedDropoff) return null;
    return routes.find(
      (route) =>
        route.pickup.id === selectedPickup && route.drop.id === selectedDropoff
    );
  }, [selectedPickup, selectedDropoff, routes]);

  // --- Event Handlers ---
  const handlePickupChange = (e) => {
    setSelectedPickup(e.target.value);
    setSelectedDropoff("");
  };

  // Step 1 of submission: Validate form and open the confirmation modal
  const handleReviewTrip = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      Swal.fire(
        "مسیر نامعتبر",
        "لطفا یک مبدا و مقصد معتبر انتخاب کنید.",
        "warning"
      );
      return;
    }
    if (isScheduled && !scheduledDateTime) {
      Swal.fire(
        "زمان لازم است",
        "لطفا تاریخ و زمان حرکت را مشخص کنید.",
        "warning"
      );
      return;
    }
    setIsModalOpen(true);
  };

  // Step 2 of submission: Send the data to the backend after user confirms
  const handleConfirmAndSubmit = async () => {
    setIsModalOpen(false);
    setSubmitting(true);

    // Construct payload with all details to match the backend serializer
    const payload = {
      route_id: selectedRoute.pk,
      passenger_count: passengerCount,
      notes_for_driver: notes,
      scheduled_for: isScheduled ? scheduledDateTime : null,
    };

    try {
      await axios.post(`${BASE_URL}/api/v1/vehicle/trips/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRequested(true);
    } catch (error) {
      console.error("Error submitting trip request:", error);
      const errorMsg =
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "مشکلی پیش آمد.";
      Swal.fire("خطا در ارسال", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequested(false);
    setSelectedPickup("");
    setSelectedDropoff("");
    setPassengerCount(1);
    setNotes("");
    setIsScheduled(false);
    setScheduledDateTime("");
  };

  // --- Component Render Logic ---

  // Show a message if the user is not logged in
  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-4">
        <p className="text-xl text-gray-600">
          برای درخواست سفر، لطفا ابتدا{" "}
          <a
            href="/sign-in"
            className="text-blue-600 hover:underline font-semibold"
          >
            وارد شوید
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      {/* --- Main Form Section --- */}
      <section className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
        {loading ? (
          <div className="text-center p-8">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : requested ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              درخواست شما با موفقیت ثبت شد!
            </h2>
            <p className="text-gray-600 mb-6">
              می‌توانید وضعیت سفر خود را در بخش «سفرهای من» دنبال کنید.
            </p>
            <button onClick={resetForm} className="primary-btn w-full">
              ثبت یک درخواست دیگر
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              درخواست سفر جدید
            </h2>
            <form onSubmit={handleReviewTrip} className="flex flex-col gap-6">
              {/* Route Selection */}
              <div>
                <label
                  htmlFor="fromCity"
                  className="block mb-2 font-medium text-gray-700"
                >
                  شهر مبدا
                </label>
                <select
                  id="fromCity"
                  value={selectedPickup}
                  onChange={handlePickupChange}
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                  required
                >
                  <option value="" disabled>
                    انتخاب کنید...
                  </option>
                  {pickupLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="toCity"
                  className="block mb-2 font-medium text-gray-700"
                >
                  شهر مقصد
                </label>
                <select
                  id="toCity"
                  value={selectedDropoff}
                  onChange={(e) => setSelectedDropoff(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                  required
                  disabled={!selectedPickup}
                >
                  <option value="" disabled>
                    ابتدا شهر مبدا را انتخاب کنید...
                  </option>
                  {dropoffLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- NEW DETAILED FORM FIELDS --- */}
              <div>
                <label
                  htmlFor="passengerCount"
                  className="block mb-2 font-medium text-gray-700"
                >
                  تعداد مسافر
                </label>
                <input
                  type="number"
                  id="passengerCount"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="notes"
                  className="block mb-2 font-medium text-gray-700"
                >
                  یادداشت برای راننده (اختیاری)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="مثال: من نزدیک دروازه آبی هستم و یک چمدان بزرگ دارم."
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div className="border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">سفر برای بعدا رزرو شود؟</span>
                </label>
                {isScheduled && (
                  <div className="mt-4 transition-all duration-300">
                    <label
                      htmlFor="scheduledDateTime"
                      className="block mb-2 font-medium text-gray-700"
                    >
                      تاریخ و زمان حرکت
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDateTime"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="primary-btn w-full flex items-center justify-center gap-2 py-3"
                disabled={!selectedRoute || submitting}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                بررسی و درخواست
              </button>
            </form>
          </>
        )}
      </section>

      {/* --- CONFIRMATION MODAL --- */}
      {isModalOpen && selectedRoute && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              تایید اطلاعات سفر
            </h3>
            <div className="space-y-4 text-gray-800">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600">مسیر:</span>
                <span className="font-bold text-lg">
                  {selectedRoute.pickup.name} ➜ {selectedRoute.drop.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600">
                  کرایه تخمینی:
                </span>
                <span className="font-bold text-lg text-green-600">
                  {selectedRoute.price_af} افغانی
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600 flex items-center gap-2">
                  <Users size={18} /> تعداد مسافر:
                </span>
                <span className="font-bold">{passengerCount}</span>
              </div>
              {isScheduled && scheduledDateTime && (
                <div className="flex justify-between items-center border-b pb-3 text-blue-700">
                  <span className="font-semibold flex items-center gap-2">
                    <Calendar size={18} /> زمان حرکت:
                  </span>
                  <span className="font-bold">
                    {new Date(scheduledDateTime).toLocaleString("fa-IR")}
                  </span>
                </div>
              )}
              {notes && (
                <div className="border-b pb-3">
                  <span className="font-semibold text-gray-600 flex items-center gap-2 mb-2">
                    <MessageSquare size={18} /> یادداشت شما:
                  </span>
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-md w-full">
                    {notes}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="secondary-btn w-full"
              >
                ویرایش
              </button>
              <button
                onClick={handleConfirmAndSubmit}
                className="primary-btn w-full flex justify-center items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "تایید و ارسال درخواست"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
