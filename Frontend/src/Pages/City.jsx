import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  Loader2,
  Send,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  ArrowRight,
  Route,
} from "lucide-react";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

// Custom styles for the react-select dropdown
const selectStyles = {
  control: (provided) => ({
    ...provided,
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
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
    padding: "0.75rem 1rem",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6b7280",
  }),
};

// --- Reusable Component for Displaying a Route Card ---
const RouteCard = ({ route, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer"
    onClick={() =>
      onSelect({
        value: route,
        label: `${route.pickup.name} ➜ ${route.drop.name}`,
      })
    }
  >
    <div className="flex items-center gap-3 text-gray-700 font-semibold">
      <MapPin className="text-red-500" size={18} />
      <span>{route.pickup.name}</span>
      <ArrowRight className="text-gray-400" size={18} />
      <MapPin className="text-blue-500" size={18} />
      <span>{route.drop.name}</span>
    </div>
    <div className="mt-3 text-center text-lg font-bold text-green-600">
      {route.price_af} AF
    </div>
  </motion.div>
);

export default function City() {
  const accessToken = useSelector((state) => state.user.accessToken);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const fetchData = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const routeOptions = useMemo(() => {
    return routes.map((route) => ({
      value: route,
      label: `${route.pickup.name} ➜ ${route.drop.name}`,
    }));
  }, [routes]);

  // A small list of recent/popular routes to display as cards
  const recentRoutes = useMemo(() => {
    return routes.slice(0, 4); // Display the first 4 routes
  }, [routes]);

  const handleReviewTrip = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      Swal.fire(
        "Route Required",
        "Please select a route for your trip.",
        "warning"
      );
      return;
    }
    if (isScheduled && !scheduledDateTime) {
      Swal.fire(
        "Time Required",
        "Please specify the date and time for your trip.",
        "warning"
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmAndSubmit = async () => {
    setIsModalOpen(false);
    setSubmitting(true);
    const payload = {
      route_id: selectedRoute.value.pk,
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
        "An error occurred.";
      Swal.fire("Submission Failed", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequested(false);
    setSelectedRoute(null);
    setPassengerCount(1);
    setNotes("");
    setIsScheduled(false);
    setScheduledDateTime("");
  };

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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 w-full" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {requested ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white p-10 rounded-xl shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                درخواست شما ثبت شد!
              </h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                می‌توانید وضعیت سفر خود را در بخش «سفرهای من» دنبال کنید.
              </p>
              <button
                onClick={resetForm}
                className="primary-btn w-full max-w-xs mx-auto"
              >
                ثبت یک درخواست دیگر
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-3 w-full bg-white p-8 rounded-xl shadow-2xl"
              >
                {loading ? (
                  <div className="text-center p-8">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800">
                        سفر خود را رزرو کنید
                      </h2>
                      <p className="text-gray-500 mt-2">
                        مقصد خود را انتخاب یا جستجو کنید.
                      </p>
                    </div>
                    <form onSubmit={handleReviewTrip} className="space-y-6">
                      <div>
                        <label className="block mb-2 font-bold text-gray-700">
                          کجا می‌روید؟
                        </label>
                        <Select
                          options={routeOptions}
                          value={selectedRoute}
                          onChange={setSelectedRoute}
                          styles={selectStyles}
                          placeholder="جستجوی مبدا و مقصد..."
                          isClearable
                        />
                      </div>
                      <AnimatePresence>
                        {selectedRoute && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-6"
                          >
                            <div>
                              <label
                                htmlFor="passengerCount"
                                className="block mb-2 font-bold text-gray-700"
                              >
                                تعداد مسافر
                              </label>
                              <input
                                type="number"
                                id="passengerCount"
                                value={passengerCount}
                                onChange={(e) =>
                                  setPassengerCount(Number(e.target.value))
                                }
                                min="1"
                                max="10"
                                className="w-full input-field"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="notes"
                                className="block mb-2 font-bold text-gray-700"
                              >
                                یادداشت برای راننده (اختیاری)
                              </label>
                              <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                                placeholder="مثال: من نزدیک دروازه آبی هستم..."
                                className="w-full input-field"
                              />
                            </div>
                            <div className="border-t pt-6">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isScheduled}
                                  onChange={(e) =>
                                    setIsScheduled(e.target.checked)
                                  }
                                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-semibold">
                                  سفر برای بعدا رزرو شود؟
                                </span>
                              </label>
                              {isScheduled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-4"
                                >
                                  <label
                                    htmlFor="scheduledDateTime"
                                    className="block mb-2 font-bold text-gray-700"
                                  >
                                    تاریخ و زمان حرکت
                                  </label>
                                  <input
                                    type="datetime-local"
                                    id="scheduledDateTime"
                                    value={scheduledDateTime}
                                    onChange={(e) =>
                                      setScheduledDateTime(e.target.value)
                                    }
                                    className="w-full input-field"
                                    required
                                  />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="submit"
                        className="primary-btn w-full flex items-center justify-center gap-2 py-3.5 text-lg"
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
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="lg:col-span-2 w-full"
              >
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <Route /> مسیرهای پرطرفدار
                  </h3>
                  {loading ? (
                    <div className="text-center p-4 text-gray-500">
                      در حال بارگذاری مسیرها...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRoutes.map((route) => (
                        <RouteCard
                          key={route.id}
                          route={route}
                          onSelect={setSelectedRoute}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

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
                  {selectedRoute.value.pickup.name} ➜{" "}
                  {selectedRoute.value.drop.name}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-600">
                  کرایه تخمینی:
                </span>
                <span className="font-bold text-lg text-green-600">
                  {selectedRoute.value.price_af} افغانی
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
