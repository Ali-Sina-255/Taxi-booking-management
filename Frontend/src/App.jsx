import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Pages/HomePage";
import ProductDetailPage from "./Pages/ProductDetailPage";
import CartPage from "./Pages/CartPage";
import WishlistPage from "./Pages/WishlistPage";
import QuickViewModal from "./Components/QuickViewModal";
import CartDrawer from "./Components/CartDrawer";
import FlyingImage from "./Components/FlyingImage";
import PrivateRoute from "./Components/common/PrivateRoute";
import Signin from "./features/authentication/components/Signin";
import SignUp from "./features/authentication/components/Signup";
import DashboardPage from "./Components/dashboard/DashboardPage";
import CheckoutPage from "./Pages/CheckoutPage";
import OrderSuccessPage from "./Pages/OrderSuccessPage";
import PaymentsSuccess from "./Pages/PaymentsSuccess";
import ContactUs from "./Pages/ContactUs";
import About from "./Pages/About";
import ShippingDetailsPage from "./Pages/ShippingDetailsPage";
import CookiePolicyPage from "./Pages/CookiePolicyPage";
import CookieConsentBanner from "./Components/CookieConsentBanner";
import AuthContainer from "./features/authentication/components/AuthContainer";
import ForgotPassword from "./Pages/ForgotPassword";
import CreateNewPassword from "./Pages/CreatePassword";

function App() {
  const [wishlist, setWishlist] = useState([]);
  // THE SEARCH STATE IS MANAGED HERE AT THE TOP LEVEL
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const cartRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Only clear search query when navigating away from the homepage
    if (location.pathname !== "/") {
      setSearchQuery("");
    }
    setQuickViewProduct(null);
    setIsCartOpen(false);
  }, [location.pathname]);

  const handleToggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        toast.error("Removed from wishlist.");
        return prevWishlist.filter((id) => id !== productId);
      } else {
        toast.success("Added to wishlist!");
        return [...prevWishlist, productId];
      }
    });
  };

  const hideLayout = location.pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster
        position="bottom-center"
        toastOptions={{
          success: { style: { background: "#333", color: "#fff" } },
          error: { style: { background: "#D22B2B", color: "#fff" } },
        }}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FlyingImage
        animationData={animationData}
        onAnimationComplete={() => setAnimationData(null)}
      />

      {!hideLayout && (
        <Header
          wishlistCount={wishlist.length}
          // PASS THE SEARCH STATE AND SETTER DOWN TO THE HEADER
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onCartClick={() => setIsCartOpen(true)}
          cartRef={cartRef}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              // PASS THE SEARCH QUERY DOWN TO THE HOMEPAGE/PRODUCT LIST
              <HomePage
                searchQuery={searchQuery}
                onQuickView={setQuickViewProduct}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={setQuickViewProduct}
              />
            }
          />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/*" element={<DashboardPage />} />
            <Route path="/shipping-details" element={<ShippingDetailsPage />} />
            <Route path="/checkout/:orderId" element={<CheckoutPage />} />
            <Route
              path="/order-success/:orderNumber"
              element={<OrderSuccessPage />}
            />
          </Route>

          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<Signin />} />
          <Route path="/logee" element={<AuthContainer />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-new-password" element={<CreateNewPassword />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
      <CookieConsentBanner />
    </div>
  );
}

export default App;
