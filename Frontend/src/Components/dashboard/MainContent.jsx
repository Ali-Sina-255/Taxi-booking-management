// src/Components/dashboard/MainContent.jsx

import React from "react";
import { useSelector } from "react-redux";
import Profile from "../../Pages/dashboard/Profiles.jsx";

// --- IMPORT THE NEW MANAGEMENT PAGES ---
import VehicleManagement from "./pages/VehicleManagement.jsx";
import LocationManagement from "./pages/LocationManagement.jsx";
import RouteManagement from "./pages/RouteManagement.jsx";
import RequestTrip from "./pages/RequestTrip.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import DriverTripList from "./pages/DriverTripList.jsx";
import AdminTripManagement from "./pages/AdminTripManagement.jsx";
import DriverApplications from "./pages/DriverApplications";
// A simple placeholder for components we haven't built yet
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);

const MainContent = ({ activeComponent }) => {
  const { profile } = useSelector((state) => state.user);

  // --- THIS IS THE FIX ---
  // We must define the 'isAdmin' constant so we can use it below.
  const isAdmin = profile?.role === "admin";
  // --- END OF FIX ---

  // Set a default view based on the user's role
  const getDefaultComponent = () => {
    switch (profile?.role) {
      case "admin":
        // Admins should see the trip management page by default
        return <AdminTripManagement />;
      case "driver":
        return <DriverTripList />; // Default for drivers is to see trip requests
      case "passenger":
        return <RequestTrip />; // Default for passengers
      case "applications":
        return isAdmin ? <DriverApplications /> : null;
      default:
        return <Placeholder title="Dashboard" />;
    }
  };

  const renderContent = () => {
    switch (activeComponent) {
      // Admin Pages
      case "dashboard":
        return <AdminTripManagement />; // Changed default to be more useful
      case "locations":
        return isAdmin ? <LocationManagement /> : null;
      case "routes":
        return isAdmin ? <RouteManagement /> : null;
      case "applications":
        return isAdmin ? <DriverApplications /> : null;
      case "trips":
        return isAdmin ? <AdminTripManagement /> : null;

      // This is a shared page, but the component itself is role-aware
      case "vehicles":
        return <VehicleManagement />;

      // Driver Pages
      case "trip-requests":
        return profile?.role === "driver" ? <DriverTripList /> : null;

      // Passenger Pages
      case "request-trip":
        return profile?.role === "passenger" ? <RequestTrip /> : null;
      case "my-trips":
        return profile?.role === "passenger" ? <MyTrips /> : null;

      // Common Page for All Users
      case "profile":
        return <Profile />;

      default:
        return getDefaultComponent();
    }
  };

  return <div className="min-h-full bg-gray-200">{renderContent()}</div>;
};

export default MainContent;
