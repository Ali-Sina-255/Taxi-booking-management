// src/Pages/ProductCollectionPage.jsx (Example Path)

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductGrid from "../Components/products/ProductCard"; // Adjust path
import ProductFilters from "../Components/products/ProductFilters"; // Adjust path
import { useProductFilters } from "../hooks/useProductFilters"; // Adjust path

const API_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const ProductCollectionPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  // Use the custom hook to get filters data
  const {
    filters,
    isLoading: isLoadingFilters,
    error: filtersError,
  } = useProductFilters();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // You can later modify this to send activeFilters to the backend
        const response = await axios.get(`${API_URL}/api/products/`);
        setProducts(response.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("امکان بارگیری محصولات وجود ندارد. لطفاً دوباره تلاش کنید.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilters]); // Refetch products when filters change

  const handleFilterChange = (filterId, valueId) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: valueId,
    }));
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-8">محصولات ما</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar for Filters */}
        <aside className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            isLoading={isLoadingFilters}
            error={filtersError}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Main Content for Product Grid */}
        <section className="lg:col-span-3">
          {error && (
            <div className="text-center py-10 text-red-500">{error}</div>
          )}
          <ProductGrid products={products} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
};

export default ProductCollectionPage;
