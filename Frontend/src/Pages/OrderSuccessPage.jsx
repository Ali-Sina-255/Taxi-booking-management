import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-4 py-20 text-center">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Thank you for your order!
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Your order number is{" "}
        <span className="font-medium text-indigo-600">{orderNumber}</span>.
      </p>
      <p className="mt-2 text-gray-600">
        We have sent a confirmation to your email address.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          className="rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
