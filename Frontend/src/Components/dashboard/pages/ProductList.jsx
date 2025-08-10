import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { useDebounce } from "use-debounce";
import { Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import ProductDetailModal from "../ProductDetailModal"; // Ensure you created this component

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ProductList({ setActiveComponent }) {
  const token = useSelector((state) => state.user.accessToken);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const PAGE_SIZE = 12;

  // State for the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/category/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 1000 },
      });
      const categoryMap = res.data.results.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {});
      setCategories(categoryMap);
    } catch (error) {
      console.error("Error fetching categories for list view:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: debouncedSearchTerm,
        page_size: PAGE_SIZE, // Ensure page size is sent
      };
      const res = await axios.get(`${BASE_URL}/api/v1/product/product/`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setProducts(res.data.results);
      setTotalProducts(res.data.count);
      setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, debouncedSearchTerm, PAGE_SIZE]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/product/product/${productId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "The product has been deleted.", "success");
        fetchProducts(); // Refetch products to update the list
      } catch (error) {
        Swal.fire("Error", "Failed to delete the product.", "error");
      }
    }
  };

  const handleEdit = (product) => {
    // This function is passed from the parent to switch to the edit form
    setActiveComponent("products", product);
  };

  const handleGoToManager = () => {
    // This function is passed from the parent to switch to the add form
    setActiveComponent("products");
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <div className="p-3 md:p-6">
        <div className="bg-white shadow-md rounded-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl text-gray-600 font-bold">
              Product List ({totalProducts})
            </h1>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full md:w-64"
              />
              <button
                onClick={handleGoToManager}
                className="primary-btn whitespace-nowrap"
              >
                + Add New Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Weight (g)
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <img
                          src={
                            product.image_url ||
                            "https://via.placeholder.com/60"
                          }
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-6 py-4">
                        {categories[product.category] || "N/A"}
                      </td>
                      <td className="px-6 py-4">${product.price}</td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        {product.weight ? `${product.weight}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="text-gray-500 hover:text-indigo-600"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Product"
                        >
                          <FaRegEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Product"
                        >
                          <IoTrashSharp size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalProducts > 0 && !loading && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
