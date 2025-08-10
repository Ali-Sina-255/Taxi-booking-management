import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Tag,
  Hash,
  Box,
  ClipboardList,
  Type,
  CheckSquare,
  Info,
} from "lucide-react";

// This is a helper component for displaying simple key-value pairs.
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-8 pt-1 text-gray-500">{icon}</div>
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      {/* The 'value' can be a simple string or more complex JSX */}
      <div className="text-gray-600">{value}</div>
    </div>
  </div>
);

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) {
    return null;
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" },
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/60"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {product.product_name}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700">Images</h3>
              <img
                src={product.image_url || "https://via.placeholder.com/300"}
                alt="Main"
                className="w-full h-auto object-cover rounded-lg border"
              />
              <div className="grid grid-cols-3 gap-2">
                {product.hover_image_url && (
                  <img
                    src={product.hover_image_url}
                    alt="Hover"
                    className="w-full h-24 object-cover rounded-md border"
                  />
                )}
                {product.multi_images &&
                  product.multi_images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image}
                      alt={`Sub-image ${img.id}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ))}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              <DetailItem
                icon={<ClipboardList size={20} />}
                label="Description"
                value={product.description}
              />
              <DetailItem
                icon={<Tag size={20} />}
                label="Tags"
                value={
                  Array.isArray(product.tags) ? product.tags.join(", ") : "N/A"
                }
              />

              {/* ======================================================================== */}
              {/* THIS IS THE CORRECTED ATTRIBUTES SECTION */}
              {/* ======================================================================== */}
              <div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 pt-1 text-gray-500">
                    <Box size={20} />
                  </div>
                  <p className="font-semibold text-gray-800">Attributes</p>
                </div>
                <div className="pl-8 pt-2">
                  {product.attributes &&
                  Object.keys(product.attributes).length > 0 ? (
                    <div className="bg-gray-50 p-3 rounded-md border space-y-2">
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600 capitalize">
                              {key}:
                            </span>
                            <span className="font-medium text-gray-900">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No attributes specified.
                    </p>
                  )}
                </div>
              </div>
              {/* ======================================================================== */}
              {/* END OF CORRECTION */}
              {/* ======================================================================== */}

              <DetailItem
                icon={<Hash size={20} />}
                label="Seller Notes"
                value={product.seller_notes}
              />

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <DetailItem
                  icon={<Type size={16} />}
                  label="Type"
                  value={product.type === "ma" ? "Man" : "Woman"}
                />
                <DetailItem
                  icon={<CheckSquare size={16} />}
                  label="Condition"
                  value={product.condition}
                />
                <DetailItem
                  icon={<Info size={16} />}
                  label="Material"
                  value={product.material}
                />
                <DetailItem
                  icon={<CheckSquare size={16} />}
                  label="Available"
                  value={product.is_available ? "Yes" : "No"}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
