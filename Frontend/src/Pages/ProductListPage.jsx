import React, { useState, useEffect, useMemo, useRef, forwardRef } from "react";
// THE FIX: We need to import useLocation to read the URL
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts } from "../services/api";
import { mapProductFromApi } from "../utils/product-mapper";
import ProductCard from "../Components/ProductCard";
import ProductCardSkeleton from "../Components/ProductCardSkeleton";
import Filters from "../Components/Filters";
import Pagination from "../Components/Pagination";

const ITEMS_PER_PAGE = 12;
const SORT_OPTIONS = {
  newest: " Les plus récents",
  "price-asc": "Prix : du moins cher au plus cher",
  "price-desc": "Prix : du plus élevé au plus bas",
};

const ProductListPage = forwardRef(
  ({ searchQuery, onQuickView, wishlist, onToggleWishlist }, ref) => {
 
    const location = useLocation();

    const [productsToShow, setProductsToShow] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});
    const [sortOption, setSortOption] = useState("newest");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const sortRef = useRef(null);

    const [filterOptions, setFilterOptions] = useState({
      brands: [],
      colors: [],
      sizes: [],
      conditions: ["New", "Used", "Other"],
    });

    const { minPrice, maxPrice } = useMemo(
      () => ({ minPrice: 0, maxPrice: 2000 }),
      []
    );
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const categoryFromUrl = params.get("category");
      setActiveCategory(categoryFromUrl);
      setCurrentPage(1); // Reset to page 1 when category changes
    }, [location.search]);

    useEffect(() => {
      const extractUniqueValues = (products, key) => {
        const valueSet = new Set();
        products.forEach((product) => {
          let value = null;
          if (product[key]) {
            const directProp = product[key];
            if (
              typeof directProp === "object" &&
              directProp !== null &&
              directProp.name
            ) {
              value = directProp.name;
            } else if (typeof directProp === "string") {
              value = directProp;
            }
          } else if (product.attributes && product.attributes[key]) {
            value = product.attributes[key];
          }
          if (value) {
            valueSet.add(value);
          }
        });
        return Array.from(valueSet).sort();
      };

      const getFilterData = async () => {
        try {
          const { data } = await fetchProducts({ page_size: 100 });
          const allProducts = data.results;

          setFilterOptions((prev) => ({
            ...prev,
            brands: extractUniqueValues(allProducts, "brand"),
            colors: extractUniqueValues(allProducts, "color"),
            sizes: extractUniqueValues(allProducts, "size"),
          }));
        } catch (error) {
          console.error("Failed to fetch filter data:", error);
        }
      };

      getFilterData();
    }, []);

    // Other useEffects (unchanged)
    useEffect(() => {
      setPriceRange([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (sortRef.current && !sortRef.current.contains(event.target)) {
          setIsSortOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFilterChange = (filterType, value) => {
      setCurrentPage(1); // Reset to first page on any filter change
      setActiveFilters((prev) => {
        const filterKey = filterType.toLowerCase();
        const newFilters = { ...prev };
        if (!newFilters[filterKey]) newFilters[filterKey] = new Set();
        if (newFilters[filterKey].has(value)) {
          newFilters[filterKey].delete(value);
          if (newFilters[filterKey].size === 0) delete newFilters[filterKey];
        } else {
          newFilters[filterKey].add(value);
        }
        return newFilters;
      });
    };

    // Handler to clear all active filters
    const resetFilters = () => {
      setCurrentPage(1);
      setActiveFilters({});
      setPriceRange([minPrice, maxPrice]);
      document
        .querySelectorAll('aside input[type="checkbox"]')
        .forEach((c) => (c.checked = false));
    };

    // The main effect for fetching products, now includes `activeCategory`
    useEffect(() => {
      const fetchFilteredProducts = async () => {
        setIsLoading(true);
        const params = {
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
          price_min: priceRange[0] > minPrice ? priceRange[0] : undefined,
          price_max: priceRange[1] < maxPrice ? priceRange[1] : undefined,
          search: searchQuery || undefined,
          condition:
            activeFilters.conditions?.size > 0
              ? Array.from(activeFilters.conditions)[0]
              : undefined,
          category: activeCategory || undefined,
        };

        if (activeFilters.brands && activeFilters.brands.size > 0) {
          params.brand = Array.from(activeFilters.brands).join(",");
        }

        const attributeQueries = [];
        Object.keys(activeFilters).forEach((key) => {
          if (["colors", "sizes"].includes(key)) {
            const filterKey = key.slice(0, -1);
            Array.from(activeFilters[key]).forEach((value) =>
              attributeQueries.push(`${filterKey}:${value}`)
            );
          }
        });

        if (attributeQueries.length > 0) {
          params.attributes = attributeQueries.join(",");
        }

        try {
          const { data } = await fetchProducts(params);
          const mappedProducts = data.results.map(mapProductFromApi);
          if (sortOption === "price-asc") {
            mappedProducts.sort((a, b) => a.price - b.price);
          } else if (sortOption === "price-desc") {
            mappedProducts.sort((a, b) => b.price - a.price);
          }
          setProductsToShow(mappedProducts);
          setTotalProducts(data.count);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFilteredProducts();
    }, [
      activeFilters,
      sortOption,
      searchQuery,
      priceRange,
      currentPage,
      minPrice,
      maxPrice,
      activeCategory,
    ]);

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    return (
      <div className="bg-gradient-to-b from-indigo-50/20 to-white">
        <main className="mx-auto max-w-[95%] px-8 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-indigo-100 pb-6 pt-12">
            <h1 className=" text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-indigo-900 capitalize">
              {activeCategory
                ? activeCategory.replace("-", " ")
                : "Mode d'occasion haut de gamme"}
            </h1>
            <div className="flex items-center" ref={sortRef}>
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="group inline-flex justify-center text-sm font-medium text-indigo-700 hover:text-indigo-900"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  {SORT_OPTIONS[sortOption]}
                  <ChevronDown
                    className={`-mr-1 ml-1 h-5 w-5 transition-transform ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 z-20 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="py-1">
                        {Object.keys(SORT_OPTIONS).map((option) => (
                          <button
                            key={option}
                            className={`block px-4 py-2.5 text-sm w-full text-left ${
                              sortOption === option
                                ? "bg-indigo-50 text-indigo-900"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setSortOption(option);
                              setIsSortOpen(false);
                            }}
                          >
                            {SORT_OPTIONS[option]}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <section ref={ref} className="pb-24 pt-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              <Filters
                onFilterChange={handleFilterChange}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                resetFilters={resetFilters}
                activeFilters={activeFilters}
                filterOptions={filterOptions}
              />
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-4">
                    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                      <ProductCardSkeleton key={`skeleton-${i}`} />
                    ))}
                  </div>
                ) : (
                  <motion.div layout>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-5">
                      <AnimatePresence>
                        {productsToShow.length > 0 ? (
                          productsToShow.map((product) => (
                            <motion.div
                              key={product.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ProductCard
                                product={product}
                                onQuickView={onQuickView}
                                wishlist={wishlist}
                                onToggleWishlist={onToggleWishlist}
                              />
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="lg:col-span-3 text-center py-20"
                          >
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-xl">
                              <h3 className="text-xl font-medium text-gray-900">
                                No Products Found
                              </h3>
                              <p className="text-indigo-600 mt-2">
                                Try adjusting your search or filter criteria.
                              </p>
                              <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                              >
                                Reset All Filters
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {productsToShow.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }
);

export default ProductListPage;
