// src/components/RelatedProducts.jsx
import React, { useEffect, useState } from "react";
import { fetchAllProducts } from "../services/api"; // You'll need this API
import ProductCard from "./ProductCard"; // Your existing product card component

const RelatedProducts = ({ category, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data } = await fetchAllProducts();
        const filtered = data.filter(
          (item) =>
            item.category.toLowerCase() === category.toLowerCase() &&
            item.id !== currentProductId
        );
        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      }
    };

    if (category) fetchRelated();
  }, [category, currentProductId]);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-12 border-t mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Similar Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
