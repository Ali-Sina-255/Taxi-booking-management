// src/components/ProductCardSkeleton.jsx
import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="aspect-square w-full bg-gray-200 rounded-md lg:h-80"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
    </div>
  );
};

export default ProductCardSkeleton;
