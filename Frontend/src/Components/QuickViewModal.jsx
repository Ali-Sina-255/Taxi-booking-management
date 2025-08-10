// src/components/QuickViewModal.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  // If no product is selected, render nothing
  if (!product) {
    return null;
  }

  const handleAddToCartClick = (e) => {
    // Stop the click from closing the modal if the button is inside the backdrop
    e.stopPropagation();
    onAddToCart(product);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose} // Close modal when clicking the backdrop
      >
        <motion.div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden"
          variants={modalVariants}
          exit="exit"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={24} />
          </button>

          {/* Product Image */}
          <div className="w-1/2 hidden md:block">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-lg text-gray-500 mt-1">{product.brand}</p>

            <p className="text-3xl font-semibold text-gray-900 mt-4">
              €{product.price.toFixed(2)}
            </p>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="text-sm text-gray-600 mt-2">
                {product.description}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Size:</span>{" "}
                {product.size}
              </div>
              <div>
                <span className="font-medium text-gray-900">Color:</span>{" "}
                {product.color}
              </div>
              <div>
                <span className="font-medium text-gray-900">Material:</span>{" "}
                {product.material}
              </div>
              <div>
                <span className="font-medium text-gray-900">Condition:</span>{" "}
                {product.condition}
              </div>
            </div>

            <button
              onClick={handleAddToCartClick}
              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Bag
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
