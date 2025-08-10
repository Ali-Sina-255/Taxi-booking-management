import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Loader2 } from "lucide-react";
import { mapProductFromApi } from "../utils/product-mapper";
import { useSelector, useDispatch } from "react-redux";
import { removeItemFromCart } from "../state/userSlice/userSlice";
import { HiOutlineShoppingBag } from "react-icons/hi2";

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const { cart, cartItems, cartLoading } = useSelector((state) => state.user);

  // ========================================================================
  // THE FIX: Calculate subtotal using `item.total` from your new backend model.
  // We also convert it to a Number() to prevent potential errors.
  // ========================================================================
  const subtotal = (cartItems || []).reduce(
    (sum, item) => sum + Number(item.total),
    0
  );
  // ========================================================================
  // END OF FIX
  // ========================================================================

  const handleRemove = (cartItemId) => {
    // Pass the item's database ID to the thunk
    dispatch(removeItemFromCart(cartItemId));
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-x-2">
                <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
                <h2 className="text-lg font-medium text-gray-900">
                  Sac de courses
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartLoading && cartItems.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : cartItems.length > 0 ? (
                <ul className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const product = mapProductFromApi(item.product);
                    return (
                      <li key={item.id} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link
                                  to={`/product/${product.id}`}
                                  onClick={onClose}
                                >
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="ml-4">
                                €{product.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {product.brand}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            {/* ======================================================================== */}
                            {/* THE FIX: Change `item.quantity` to `item.qty` */}
                            {/* ======================================================================== */}
                            <p className="text-gray-500">Qty: {item.qty}</p>
                            {/* ======================================================================== */}
                            {/* END OF FIX */}
                            {/* ======================================================================== */}
                            <button
                              onClick={() => handleRemove(item.id)}
                              type="button"
                              disabled={cartLoading}
                              className="font-medium text-red-600 hover:text-red-500 flex items-center disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center h-full flex flex-col justify-center">
                  <p className="text-gray-500">Votre sac est vide.</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Sous-total</p>
                  <p>€{subtotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Les frais de livraison et les taxes seront calculés lors du
                  paiement.
                </p>

                <div className="mt-6">
                  <Link
                    to="/cart"
                    onClick={() => {
                      onClose(); // Close modal/drawer/etc.
                      scrollTo(0, 0); // Scroll to top
                    }}
                    className="flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-700"
                  >
                    Aller au panier et passer à la caisse
                  </Link>
                </div>
                <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    ou{" "}
                    <button
                      type="button"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                      onClick={onClose}
                    >
                      Continuer vos achats
                      <span aria-hidden="true"> →</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
