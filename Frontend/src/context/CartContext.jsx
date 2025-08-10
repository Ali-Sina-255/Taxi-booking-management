// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getOrCreateCart,
  getCartItems,
  addItemToCart,
  removeItemFromCart,
} from "../services/api";
import { mapProductFromApi } from "../utils/product-mapper";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      syncCart();
    }
  }, []);

  const syncCart = async () => {
    setIsLoading(true);
    try {
      const mainCart = await getOrCreateCart();
      setCart(mainCart);
      if (mainCart && mainCart.cart_id) {
        const items = await getCartItems(mainCart.cart_id);
        setCartItems(items);
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
      toast.error("Could not load your bag.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product, imageRef) => {
    if (!cart) {
      toast.error("Please log in to add items to your bag.");
      return;
    }
    if (
      cartItems.some(
        (item) => item.product.id === (product._original?.id || product.id)
      )
    ) {
      toast.error(`${product.name} is already in your bag.`);
      return;
    }
    try {
      const productId = product._original?.id || product.id;
      await addItemToCart({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity: 1,
      });
      toast.success(`${product.name} added to bag!`);
      await syncCart();
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Could not add item to bag.");
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await removeItemFromCart(cartItemId);
      toast.success("Item removed from bag.");
      await syncCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Could not remove item.");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        isLoading,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
