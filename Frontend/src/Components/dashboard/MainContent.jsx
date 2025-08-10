// src/Components/dashboard/MainContent.jsx

import React from "react";
import { useSelector } from "react-redux";
import Profile from "../../Pages/dashboard/Profiles.jsx";
import VehicleManagement from "./pages/VehicleManagement.jsx";
import LocationManagement from "./pages/LocationManagement.jsx";
import RouteManagement from "./pages/RouteManagement.jsx";
import RequestTrip from "./pages/RequestTrip.jsx";
import MyTrips from "./pages/MyTrips.jsx"; // <-- 1. IMPORT

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-4 text-gray-600">This page is under construction.</p>
  </div>
);

const MainContent = ({ activeComponent }) => {
  const { profile } = useSelector((state) => state.user);

  const getDefaultComponent = () => {
    switch (profile?.role) {
      case "admin":
        return <Placeholder title="Admin Dashboard" />;
      case "driver":
        return <VehicleManagement />;
      case "passenger":
        return <RequestTrip />;
      default:
        return <Placeholder title="Dashboard" />;
    }
  };

  const renderContent = () => {
    switch (activeComponent) {
      // Admin
      case "dashboard":
        return <Placeholder title="Admin Dashboard" />;
      case "locations":
        return <LocationManagement />;
      case "routes":
        return <RouteManagement />;

      // Driver
      case "vehicles":
        return <VehicleManagement />;
      case "trip-requests":
        return <Placeholder title="Available Trip Requests" />;

      // Passenger
      case "request-trip":
        return <RequestTrip />;
      // --- 2. RENDER THE NEW COMPONENT ---
      case "my-trips":
        return <MyTrips />;

      // Common
      case "profile":
        return <Profile />;

      default:
        return getDefaultComponent();
    }
  };

  return <div className="min-h-full bg-gray-100">{renderContent()}</div>;
};

export default MainContent;
