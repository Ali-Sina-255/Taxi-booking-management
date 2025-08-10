import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Optional icon

const PaymentsSuccess = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! Your payment has been processed
          successfully.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="inline-block border border-green-600 text-green-600 px-6 py-2 rounded-md hover:bg-green-50 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSuccess;