import React, { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import logo from "../../public/44.png";
import { FaTaxi } from "react-icons/fa";
const navbarItems = [
  { name: "صفحه اصلی", path: "/" }, // Home
  { name: "شهر ها", path: "/city" }, // Category
  { name: "نماس با ما", path: "/contact" }, // Contact Us
  { name: "درباره ما", path: "/about" }, // About Us
];

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const Header = ({ searchQuery, setSearchQuery }) => {
  const { cartItems } = useSelector((state) => state.user);
  const cartCount = (cartItems || []).reduce((sum, item) => sum + item.qty, 0);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg border-indigo-100 shadow-sm"
            : "bg-gradient-to-r from-indigo-50 via-white to-blue-50 backdrop-blur-sm border-indigo-100"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-primary"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex items-center gap-x-10">
              <div className="items-center hidden md:flex">
                <Link to="/" className="flex items-center gap-x-3">
                  {/* Replaced text with logo */}
                  <FaTaxi className="text-2xl " />
                  <p className="text-2xl font-bold">کابل سنپ</p>
                </Link>
              </div>

              <div className="hidden lg:flex lg:items-center gap-x-6 ">
                {navbarItems.map((item, index) => {
                  return (
                    <div key={index} className="">
                      <Link
                        to={item.path}
                        className={`text-lg font-medium ${
                          isScrolled ? "text-indigo-800" : "text-indigo-900"
                        } hover:text-primary transition-colors duration-200`}
                      >
                        {item.name}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-x-4">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <Link
                to="/account"
                className="p-2 text-primary hidden lg:block transition-colors duration-200"
              >
                <User size={24} />
              </Link>
              <button className="border py-2 px-4 rounded-md font-semibold">درخواست تاکسی</button>
            </div>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isMobileMenuOpen={isMobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            navbarItems={navbarItems}
            isMobileCategoryOpen={isMobileCategoryOpen}
            setIsMobileCategoryOpen={setIsMobileCategoryOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
