import React, { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchProductSalesSummary, fetchProductById } from "../../services/api";

const TopSaleProducts = ({ isLoading: isDashboardLoading }) => {
  // 1. Fetch the sales summary to get the top product IDs and their sales data
  const { data: salesSummary = [] } = useQuery({
    queryKey: ["productSalesSummary"],
    queryFn: fetchProductSalesSummary,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Determine the top 9 products based on sales
  const topProductsSummary = useMemo(() => {
    return [...salesSummary]
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 9);
  }, [salesSummary]);

  // 3. Use `useQueries` to fetch the full details for each of the top 9 products
  const topProductsDetailsQueries = useQueries({
    queries: topProductsSummary.map((product) => {
      return {
        queryKey: ["product", product.product_id], // Unique key for each product
        queryFn: () => fetchProductById(product.product_id),
        staleTime: Infinity, // Product details rarely change, so cache them forever
        enabled: !!product.product_id, // Only run the query if we have a product_id
      };
    }),
  });

  
  const combinedTopProducts = useMemo(() => {
    return topProductsSummary.map((summary, index) => {
      const detailsQuery = topProductsDetailsQueries[index];
      return {
        ...summary, // a.product_id, product_name, total_sales
        ...detailsQuery.data, // b. id, image_url, description, etc.
        isLoading: detailsQuery.isLoading,
      };
    });
  }, [topProductsSummary, topProductsDetailsQueries]);

  // Overall loading state for this component
  const isLoading =
    isDashboardLoading || topProductsDetailsQueries.some((q) => q.isLoading);

  return (
    <div className="text-gray-700 bg-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Selling Products</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? // Skeleton loader for initial state
            [...Array(9)].map((_, i) => <ProductSkeleton key={i} />)
          : // Render the combined data once everything is loaded
            combinedTopProducts.map((product) => (
              <ProductItem key={product.product_id} product={product} />
            ))}
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const ProductItem = ({ product }) => (
  <div className="rounded-lg flex h-20 gap-x-2 items-center p-2 hover:bg-gray-50 transition-colors cursor-pointer">
    <img
      // ✅ FIX: Now using the correct image_url from the fetched details
      src={product.image_url || "https://placehold.co/100x100"}
      alt={product.product_name}
      className="w-16 h-16 border object-cover rounded"
    />
    <div>
      <h3 className="text-sm font-medium">{product.product_name}</h3>
      <p className="text-sm text-gray-500 font-semibold">
        Sales: ${product.total_sales.toLocaleString()}
      </p>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="flex h-20 gap-x-2 items-center">
    <Skeleton circle width={64} height={64} />
    <div className="w-full">
      <Skeleton width={100} height={16} />
      <Skeleton width={60} height={14} />
    </div>
  </div>
);

export default TopSaleProducts;
