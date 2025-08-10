import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ProductListPage from "./ProductListPage";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = (props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timeoutRef = useRef(null);

  const productListRef = useRef(null);

  useEffect(() => {
    if (props.searchQuery && productListRef.current) {
      const headerOffset = 80; // Adjust this value to match your sticky header's height
      const elementPosition =
        productListRef.current.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [props.searchQuery]); // This effect will only run when the `searchQuery` prop changes.

  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
      overlay: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
    },
  ];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      resetTimeout();
    };
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <div className="relative h-screen max-h-[600px] w-full overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `${slides[currentSlide].overlay}, url(${slides[currentSlide].image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          <div className="max-w-4xl text-center">
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Seconde main,{" "}
              <span className="text-amber-400">première classe</span> style
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10"
            >
              Découvrez une sélection de pièces vintage et d'occasion choisies
              avec soin pour créer une garde-robe qui vous ressemble et respecte
              la planète.
            </motion.p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
            >
              <a
                href="#product-grid"
                className="inline-flex items-center px-8 py-4 bg-[#3caca8] text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-all duration-300 group"
              >
                Acheter les nouveautés
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="flex justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                  index === currentSlide ? "bg-white w-12" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        THE FIX: Step 3 - Attach the ref to the container of the ProductListPage.
        ========================================================================
      */}
      <div id="product-grid" ref={productListRef}>
        <ProductListPage {...props} />
      </div>
    </div>
  );
};

export default HomePage;
