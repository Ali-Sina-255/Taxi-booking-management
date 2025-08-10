import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  Loader2,
  PackageSearch,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Truck,
  CreditCard,
} from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to create an API client that automatically includes the auth token.
const createApiClient = () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000",
  });
  api.interceptors.request.use((config) => {
    if (store) {
      const token = store.getState().user.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  return api;
};

// --- Sub-components (No changes here) ---

const StatusBadge = ({ status }) => {
  const statusStyles = {
    paid: "bg-green-100 text-green-700 ring-green-600/20",
    processing: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
    failed: "bg-red-100 text-red-700 ring-red-600/20",
    cancelled: "bg-gray-100 text-gray-700 ring-gray-600/20",
    initiated: "bg-blue-100 text-blue-700 ring-blue-600/20",
    pending: "bg-orange-100 text-orange-800 ring-orange-600/20",
    default: "bg-gray-100 text-gray-700 ring-gray-600/20",
  };
  const style = statusStyles[status?.toLowerCase()] || statusStyles.default;
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

const InfoCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
      <Icon className="h-5 w-5 text-gray-400" />
      <h5 className="font-semibold text-gray-700 text-base">{title}</h5>
    </div>
    <div className="space-y-1 text-sm text-gray-600">{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-1">
    <span className="text-gray-500">{label}:</span>
    <strong className="text-gray-800 text-right font-medium">
      {value || "N/A"}
    </strong>
  </div>
);

const StatusUpdater = ({ order, statusType, onUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order[statusType]);
  const [isUpdating, setIsUpdating] = useState(false);

  const options = useMemo(() => {
    if (statusType === "payment_status") {
      return [
        "paid",
        "pending",
        "processing",
        "cancelled",
        "initiated",
        "failed",
        "refunded",
      ];
    }
    if (statusType === "order_status") {
      return ["Pending", "Fulfilled", "Partially Fulfilled", "Cancelled"];
    }
    return [];
  }, [statusType]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdating(true);
    try {
      const api = createApiClient();
      const payload = { [statusType]: newStatus };
      const response = await api.patch(
        `/api/v1/cart/orders/update/${order.id}/`,
        payload
      );
      setCurrentStatus(response.data[statusType]);
      onUpdate(order.oid, response.data);
      toast.success(`${statusType.replace("_", " ")} updated successfully!`);
    } catch (error) {
      toast.error(`Failed to update ${statusType.replace("_", " ")}.`);
      setCurrentStatus(order[statusType]); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {isUpdating && (
        <Loader2 className="absolute -left-5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      )}
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

// --- Main Component ---

const OrderManagement = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = createApiClient();
        const endpoint = "/api/v1/cart/orders/";
        const response = await api.get(endpoint);
        const ordersData = response.data.results
          ? response.data.results
          : response.data;
        if (Array.isArray(ordersData)) {
          setAllOrders(ordersData);
        } else {
          setAllOrders([]);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || "Failed to fetch orders.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAdmin]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(allOrders)) return [];
    return allOrders
      .filter((order) => {
        if (
          statusFilter !== "all" &&
          order.payment_status.toLowerCase() !== statusFilter
        ) {
          return false;
        }
        return true;
      })
      .filter((order) => {
        if (searchTerm.trim() === "") return true;
        const lowercasedSearch = searchTerm.toLowerCase();
        return (
          order.oid.toLowerCase().includes(lowercasedSearch) ||
          order.full_name.toLowerCase().includes(lowercasedSearch)
        );
      });
  }, [allOrders, searchTerm, statusFilter]);

  const paymentStatuses = useMemo(() => {
    if (!Array.isArray(allOrders)) return ["all"];
    return [
      "all",
      ...new Set(allOrders.map((o) => o.payment_status.toLowerCase())),
    ];
  }, [allOrders]);

  const handleToggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleOrderUpdate = (orderOid, updatedOrderData) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.oid === orderOid ? { ...order, ...updatedOrderData } : order
      )
    );
  };

  if (loading)
    return (
      <div className="p-10">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="p-3 md:p-6">
      <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Order Management" : "My Orders"}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {isAdmin
                ? "A list of all orders from customers."
                : "A history of all the orders you have placed."}
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {filteredOrders.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-12"></th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Order ID
                        </th>
                        {isAdmin && (
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Customer
                          </th>
                        )}
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Payment Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Order Status
                        </th>
                      </tr>
                    </thead>
                    {filteredOrders.map((order) => (
                      <tbody
                        key={order.oid}
                        className="divide-y divide-gray-200 bg-white"
                      >
                        <tr
                          onClick={() => handleToggleExpand(order.oid)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="pl-4">
                            {expandedOrderId === order.oid ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-indigo-600 sm:pl-6">
                            {order.oid}
                          </td>
                          {isAdmin && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {order.full_name}
                            </td>
                          )}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            €{Number(order.total).toFixed(2)}
                          </td>

                          {/* ======================================================================== */}
                          {/* THE FIX IS HERE: The logic for the "Payment Status" column is updated. */}
                          {/* ======================================================================== */}
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {/* For both admin and regular users, we now ONLY show the status badge. */}
                            <StatusBadge status={order.payment_status} />
                          </td>
                          {/* ======================================================================== */}
                          {/* END OF FIX */}
                          {/* ======================================================================== */}

                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {/* The "Order Status" column remains updatable for admins. */}
                            {isAdmin ? (
                              <StatusUpdater
                                order={order}
                                statusType="order_status"
                                onUpdate={handleOrderUpdate}
                              />
                            ) : (
                              <span>{order.order_status}</span>
                            )}
                          </td>
                        </tr>
                        <AnimatePresence>
                          {expandedOrderId === order.oid && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td
                                colSpan={isAdmin ? 7 : 6}
                                className="p-0 bg-slate-50"
                              >
                                <div className="p-4 sm:p-6">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 space-y-6">
                                      <InfoCard
                                        title="Customer Details"
                                        icon={User}
                                      >
                                        <DetailRow
                                          label="Name"
                                          value={order.full_name}
                                        />
                                        <DetailRow
                                          label="Email"
                                          value={order.email}
                                        />
                                        <DetailRow
                                          label="Phone"
                                          value={order.mobile}
                                        />
                                      </InfoCard>
                                      <InfoCard
                                        title="Delivery Information"
                                        icon={Truck}
                                      >
                                        <p className="text-gray-800 font-medium">
                                          {order.address}
                                        </p>
                                        <p className="text-gray-600">
                                          {order.city}, {order.state}
                                        </p>
                                        <p className="text-gray-600">
                                          {order.country}
                                        </p>
                                      </InfoCard>
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                        <h5 className="font-semibold text-gray-700 text-base p-4 border-b border-gray-100">
                                          Order Items
                                        </h5>
                                        <table className="min-w-full">
                                          <tbody className="divide-y divide-gray-100">
                                            {order.orderitem.map((item) => (
                                              <tr key={item.id}>
                                                <td className="p-3">
                                                  <div className="flex items-center">
                                                    <img
                                                      className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                                                      src={
                                                        item.product
                                                          .image_url ||
                                                        "/placeholder.png"
                                                      }
                                                      alt={
                                                        item.product
                                                          .product_name
                                                      }
                                                    />
                                                    <div className="ml-4 text-sm font-medium text-gray-800">
                                                      {
                                                        item.product
                                                          .product_name
                                                      }
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="p-3 text-sm text-gray-500 text-center">
                                                  {item.qty} x €
                                                  {Number(item.price).toFixed(
                                                    2
                                                  )}
                                                </td>
                                                <td className="p-3 text-sm font-medium text-gray-900 text-right">
                                                  €
                                                  {Number(item.total).toFixed(
                                                    2
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                      <InfoCard
                                        title="Financial Summary"
                                        icon={CreditCard}
                                      >
                                        <DetailRow
                                          label="Subtotal"
                                          value={`€${(
                                            Number(order.total) -
                                            (Number(order.delivery_cost) || 0)
                                          ).toFixed(2)}`}
                                        />
                                        <DetailRow
                                          label="Delivery Cost"
                                          value={`€${Number(
                                            order.delivery_cost || 0
                                          ).toFixed(2)}`}
                                        />
                                        <hr className="my-2 border-dashed" />
                                        <div className="flex justify-between items-center font-bold text-base pt-1">
                                          <span>Grand Total:</span>
                                          <span className="text-indigo-600">
                                            €
                                            {Number(
                                              order.grand_total || order.total
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      </InfoCard>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    ))}
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                  <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No Orders Found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isAdmin
                      ? "No orders match the current criteria."
                      : "You haven't placed any orders yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
