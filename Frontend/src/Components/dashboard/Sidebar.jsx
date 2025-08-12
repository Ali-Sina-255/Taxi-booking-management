// src/Components/dashboard/Sidebar.jsx

import React, { useState } from "react";
import {
  FaSignOutAlt,
  FaUser,
  FaCar,
  FaRoute,
  FaMapMarkedAlt,
  FaTaxi,
  FaListAlt,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaUserCheck,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { MdDashboardCustomize } from "react-icons/md";

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const { profile } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(true);

  const handleSignOut = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(signOutSuccess());
        navigate("/sign-in");
      }
    });
  };

  // --- NEW MENU ITEMS FOR TAXI APP ---
  const allMenuItems = [
    // Admin-only links
    {
      name: "داشبورد",
      value: "dashboard",
      icon: <MdDashboardCustomize />,
      roles: ["admin"],
    },
    {
      name: "موقیعت ها",
      value: "locations",
      icon: <FaMapMarkedAlt />,
      roles: ["admin"],
    },
    {
      name: "مدیریت سفرها",
      value: "trips",
      icon: <FaTaxi />,
      roles: ["admin"],
    },
    { name: "مسیرها ", value: "routes", icon: <FaRoute />, roles: ["admin"] },

    // Driver-only links
    {
      name: "My Vehicles",
      value: "vehicles",
      icon: <FaCar />,
      roles: ["driver"],
    },
    {
      name: "Trip Requests",
      value: "trip-requests",
      icon: <FaListAlt />,
      roles: ["driver"],
    },

    // Passenger-only links
    {
      name: "Request Trip",
      value: "request-trip",
      icon: <FaTaxi />,
      roles: ["passenger"],
    },
    {
      name: "My Trips",
      value: "my-trips",
      icon: <FaListAlt />,
      roles: ["passenger"],
    },

    // Links for all users
    {
      name: "پروفایل",
      value: "profile",
      icon: <FaUser />,
      roles: ["admin", "driver", "passenger"],
    },
    {
      name: "خروج",
      value: "signout",
      icon: <FaSignOutAlt />,
      roles: ["admin", "driver", "passenger"],
    },
  ];

  const accessibleComponents = allMenuItems.filter((item) =>
    item.roles.includes(profile?.role)
  );

  return (
    <>
      <div
        className={` h-full transition-all duration-300 ease-in-out bg-secondary shadow-md ${
          isOpen ? "w-[70px] md:w-[80px] lg:w-64" : "w-0"
        } overflow-hidden`}
      >
        <header className="flex items-center justify-center lg:justify-start gap-5 p-5 font-bold text-xl">
          <Link
            to="/"
            className="flex items-center justify-center p-2 bg-gray-300 h-8 w-8 md:h-10 md:w-10 rounded-full"
          >
            <FaTaxi className="text-black" />
          </Link>
          <Link
            to="/"
            className="text-xl font-Ray_black  text-black whitespace-nowrap hidden lg:inline"
          >
            YouRIDe
          </Link>
        </header>

        <div className="block lg:hidden text-center mb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-blue-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <ul className="mx-2 space-y-1">
          {accessibleComponents.map((component, index) => (
            <li key={index} className="relative group cursor-pointer">
              <a
                onClick={() => {
                  // --- FINAL TWEAK ---
                  if (component.value === "become-a-driver") {
                    navigate("/become-a-driver");
                  } else if (component.value === "signout") {
                    handleSignOut();
                  } else {
                    setActiveComponent(component.value);
                  }
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`relative flex items-center justify-center lg:justify-start gap-x-3 w-full px-4 rounded-md py-3 transition-all duration-300 ${
                  activeComponent === component.value
                    ? "bg-gray-200 text-primary"
                    : "hover:bg-gray-200 text-black"
                }`}
              >
                <span className="text-xl">{component.icon}</span>
                <span className="text-base font-semibold whitespace-nowrap hidden lg:inline">
                  {component.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 left-5 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg block lg:hidden"
        >
          <FaBars size={20} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
