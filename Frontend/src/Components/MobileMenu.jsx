import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const mobileMenuVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
};

const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const MobileMenu = ({
  isMobileMenuOpen,
  setMobileMenuOpen,
  navbarItems,
  isMobileCategoryOpen,
  setIsMobileCategoryOpen,
  categories = [], // fallback empty array
  categoryLoading,
  categoryError,
}) => {
  const navigate = useNavigate();

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Side Menu */}
      <motion.div
        variants={mobileMenuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-indigo-50 to-white z-50 p-6 border-r border-indigo-100"
      >
        {/* Top Logo and Controls */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src="44.png" alt="Logo" className="h-10 cursor-pointer" />
          </Link>
          <div className="flex items-center gap-x-2">
            <Link
              to="/account"
              className="p-2 text-primary transition-colors duration-200"
            >
              <User size={24} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-primary"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2">
          {navbarItems.map((item, index) => {
            const isCategory = item.name.toLowerCase() === "catégorie"; // ✅ FIXED

            return (
              <div key={index}>
                {/* Main Menu Item */}
                <div
                  className="flex items-center justify-between text-gray-700 pl-4 py-2.5 bg-gray-200 hover:bg-primary hover:text-white rounded-lg transition-colors duration-150 cursor-pointer"
                  onClick={() => {
                    if (isCategory) {
                      console.log("Toggling category submenu...");
                      setIsMobileCategoryOpen((prev) => !prev);
                    } else {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }
                    scrollTo(0, 0);
                  }}
                >
                  <span>{item.name}</span>
                  {isCategory && (
                    <span className="pr-2">
                      {isMobileCategoryOpen ? (
                        <Minus size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </span>
                  )}
                </div>

                {/* Submenu for Categories */}
                <AnimatePresence initial={false}>
                  {isCategory && isMobileCategoryOpen && (
                    <motion.div
                      key="submenu"
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="ml-6 mt-1 space-y-1 bg-gray-100 p-2 rounded"
                    >
                      {categoryLoading ? (
                        <p className="text-sm text-gray-400">
                          Loading categories...
                        </p>
                      ) : categoryError ? (
                        <p className="text-sm text-red-500">{categoryError}</p>
                      ) : categories.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          No categories found.
                        </p>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat.id || cat.name}
                            to={`/?category=${cat.name.toLowerCase()}`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setIsMobileCategoryOpen(false);
                            }}
                            className="block text-base py-2 text-gray-600 hover:text-primary transition-colors duration-150"
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
};

export default MobileMenu;
