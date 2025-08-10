import React, { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import logo from "../../public/44.png";
const navbarItems = [
  { name: "Accueil", path: "/" }, // Home
  { name: "Catégorie", path: "" }, // Category
  { name: "Contactez-nous", path: "/contact" }, // Contact Us
  { name: "À propos de nous", path: "/about" }, // About Us
];

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const Header = ({
  wishlistCount,
  searchQuery,
  setSearchQuery,
  onCartClick,
  cartRef,
}) => {
  const { cartItems } = useSelector((state) => state.user);
  const cartCount = (cartItems || []).reduce((sum, item) => sum + item.qty, 0);
  const [isShopMenuOpen, setShopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await axios.get(`${BASE_URL}/api/v1/category/`);
        if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error("Invalid category format");
        }
      } catch (err) {
        setCategoryError("Failed to load categories.");
        toast.error("Failed to load categories.");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
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

            <div className="items-center hidden md:flex">
              <Link to="/" className="flex items-center">
                {/* Replaced text with logo */}
                <img
                  src={logo}
                  alt="Website Logo"
                  className="h-12  w-auto" // Adjust height as needed
                />
              </Link>
            </div>

            <div className="hidden lg:flex lg:items-center lg:space-x-8 relative">
              {navbarItems.map((item, index) => {
                const isCategory = item.name === "Catégorie";
                return (
                  <div
                    key={index}
                    onMouseEnter={() => isCategory && setShopMenuOpen(true)}
                    onMouseLeave={() => isCategory && setShopMenuOpen(false)}
                    className="relative"
                  >
                    <Link
                      to={item.path}
                      className={`text-sm font-medium ${
                        isScrolled ? "text-indigo-800" : "text-indigo-900"
                      } hover:text-primary transition-colors duration-200`}
                    >
                      {item.name}
                    </Link>
                    {isCategory && (
                      <AnimatePresence>
                        {isShopMenuOpen && (
                          <div
                            onMouseEnter={() => setShopMenuOpen(true)}
                            onMouseLeave={() => setShopMenuOpen(false)}
                          >
                            <MegaMenu onClose={() => setShopMenuOpen(false)} />
                          </div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
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
              <Link
                to="/wishlist"
                onClick={() => scrollTo(0, 0)}
                className="flex items-center p-2 text-primary transition-colors duration-200"
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                ref={cartRef}
                type="button"
                onClick={onCartClick}
                className="flex items-center p-2 text-primary transition-colors duration-200"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
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
            categories={categories}
            categoryLoading={categoryLoading}
            categoryError={categoryError}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
