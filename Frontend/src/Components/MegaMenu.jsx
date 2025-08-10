import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const CategorySkeleton = () => (
  <div className="block h-5 bg-gray-200 rounded-md animate-pulse"></div>
);

const MegaMenu = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/v1/category/`);

        if (response.data && Array.isArray(response.data.results)) {
          setCategories(response.data.results);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error("Invalid data format for categories");
        }
      } catch (err) {
        setError("Could not load categories.");
        toast.error("Failed to load categories for the menu.");
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, index) => (
        <CategorySkeleton key={index} />
      ));
    }
    if (error) {
      return (
        <div className="col-span-full text-center text-red-500">{error}</div>
      );
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return (
        <div className="col-span-full text-center text-gray-500">
          No categories found.
        </div>
      );
    }

    return categories.map((category) => (
      // ========================================================================
      // THE FIX: Use category.name.toLowerCase() instead of category.slug
      // ========================================================================
      <Link
        key={category.id || category.name} // Use a guaranteed unique key
        to={`/?category=${category.name.toLowerCase()}`}
        className="block text-gray-700 text-sm font-medium hover:text-indigo-600 hover:underline transition-colors"
        onClick={onClose}
      >
        {category.name}
      </Link>
      // ========================================================================
      // END OF FIX
      // ========================================================================
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-[55px] w-full min-h-[200px] z-40 bg-gradient-to-r from-indigo-50 via-white to-blue-50 backdrop-blur-sm  border-indigo-100 shadow-lg"
      onMouseLeave={onClose}
    >
      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default MegaMenu;
