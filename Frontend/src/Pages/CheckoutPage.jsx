import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2, CheckCircle, Truck } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchOrderForCheckout,
  processPaypalPayment,
  clearOrderState,
  applyDeliveryOption,
} from "../state/checkoutSlice/checkoutSlice";

const LoadingIndicator = () => (
  <div className="text-center py-20">
    <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
    <p className="mt-4 text-lg text-gray-600">Loading Your Order...</p>
  </div>
);

const PaidOrderMessage = () => (
  <div className="text-center py-20 flex flex-col items-center">
    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
    <h1 className="text-2xl font-bold">This order has already been paid.</h1>
  </div>
);

const OrderSummarySection = ({ order }) => {
  const subtotal = (order.orderitem || []).reduce(
    (sum, item) => sum + Number(item.total),
    0
  );
  const grandTotal = Number(order.total);
  const deliveryCost = grandTotal - subtotal;

  return (
    <div className="space-y-4 border-b pb-4 mb-6">
      <div className="flex justify-between">
        <span className="text-gray-600">Order ID:</span>
        <span className="font-mono text-sm">{order.oid}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Name:</span>
        <strong>{order.full_name}</strong>
      </div>
      <div className="flex justify-between border-t pt-4 mt-4">
        <span className="text-gray-600">Subtotal:</span>
        <span className="font-medium">€{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Delivery:</span>
        <span className="font-medium text-green-600">
          {deliveryCost > 0 ? `€${deliveryCost.toFixed(2)}` : "Not Selected"}
        </span>
      </div>
      <div className="flex justify-between text-xl font-bold border-t pt-4">
        <span>Order Total:</span>
        <span>€{grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { order, loading, deliveryLoading } = useSelector(
    (state) => state.checkout
  );

  const [deliveryType, setDeliveryType] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderForCheckout(orderId));
    }
    return () => {
      dispatch(clearOrderState());
    };
  }, [orderId, dispatch]);

  // 3. UPDATE THE HANDLER TO DISPATCH THE THUNK
  const handleApplyDelivery = () => {
    if (!deliveryType || !location) {
      toast.error("Please select a delivery type and enter a location.");
      return;
    }
    // The component's job is just to dispatch the action with the required data.
    // The slice will handle the API call, toast notifications, and state updates.
    dispatch(applyDeliveryOption({ orderId, deliveryType, location }));
  };

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "EUR",
    intent: "capture",
  };

  if (loading || !order) {
    return <LoadingIndicator />;
  }

  if (order.payment_status === "paid") {
    return <PaidOrderMessage />;
  }

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <main className="max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Confirm Your Order
        </h1>

        <OrderSummarySection order={order} />

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-gray-600" />
            Delivery Options
          </h2>
          <div className="space-y-3">
            <label
              className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                deliveryType === "location"
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="location"
                checked={deliveryType === "location"}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-3 block text-sm font-medium text-gray-700">
                Home Location
              </span>
            </label>
            <label
              className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                deliveryType === "station"
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="station"
                checked={deliveryType === "station"}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-3 block text-sm font-medium text-gray-700">
                Close Station
              </span>
            </label>
          </div>

          {deliveryType && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  deliveryType === "location"
                    ? "Enter your full address"
                    : "Enter the station name/address"
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {/* 4. USE THE `deliveryLoading` STATE FOR THE BUTTON */}
              <button
                onClick={handleApplyDelivery}
                disabled={deliveryLoading}
                className="w-full flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-wait"
              >
                {deliveryLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Apply Delivery"
                )}
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-center mb-4">
            Complete Payment
          </h2>
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              disabled={Number(order.total) <= 0 || deliveryLoading}
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    { amount: { value: Number(order.total).toFixed(2) } },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  dispatch(
                    processPaypalPayment({
                      order_oid: order.oid,
                      payapl_order_id: details.id,
                    })
                  )
                    .unwrap()
                    .then(() => {
                      navigate(`/order-success/${order.oid}`);
                    });
                });
              }}
            />
          </PayPalScriptProvider>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
