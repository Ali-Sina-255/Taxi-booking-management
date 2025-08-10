// src/components/products/ProductGrid.jsx (Example Path)

import React from "react";
import ProductCard from "./ProductCard"; // Assuming you have a ProductCard component
import { Loader } from "lucide-react"; // Example loading icon

const ProductGrid = ({ products, isLoading }) => {
  // --- FIX 1: Add a check for the loading state ---
  // This shows a message while the products are being fetched.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-12 h-12 animate-spin text-blue-500" />
        <p className="ml-4 text-lg">در حال بارگیری محصولات...</p>
      </div>
    );
  }

  // --- FIX 2: Add a check to ensure 'products' is a valid array ---
  // This prevents the ".map of undefined" error and shows a message if there are no products.
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-600">هیچ محصولی برای نمایش یافت نشد.</p>
      </div>
    );
  }

  // This block will now only run if 'isLoading' is false and 'products' is a non-empty array.
  // This was the line (around line 69 in your original file) that caused the error.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
