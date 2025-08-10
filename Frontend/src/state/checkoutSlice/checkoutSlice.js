import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
// THE FIX: Import fetchUserCart instead of clearCart
import { fetchUserCart } from "../userSlice/userSlice"; // Corrected Path
import axios from "axios";

// Helper to create an API client that attaches the auth token from Redux state.
const createApiClient = (getState) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000",
  });

  api.interceptors.request.use((config) => {
    const token = getState().user.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return api;
};

// --- ASYNC THUNKS FOR THE NEW ORDER FLOW ---

// Action to create the order *before* payment, by submitting shipping details.
export const createOrder = createAsyncThunk(
  "checkout/createOrder",
  async ({ shippingDetails, cartId }, { getState, rejectWithValue }) => {
    const api = createApiClient(getState);
    try {
      const payload = { ...shippingDetails, cart_id: cartId };
      const response = await api.post("/api/v1/cart/orders/create/", payload);
      toast.success("Order created! Proceeding to payment.");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to create order.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ========================================================================
// NEW THUNK: Action to apply a delivery option to an existing order.
// This is added without removing any other logic.
// ========================================================================
export const applyDeliveryOption = createAsyncThunk(
  "checkout/applyDeliveryOption",
  async (
    { orderId, deliveryType, location },
    { dispatch, getState, rejectWithValue }
  ) => {
    const api = createApiClient(getState);
    try {
      const payload = { delivery_type: deliveryType, location };
      await api.post(`/api/v1/product/delivery/create/${orderId}/`, payload);

      // On success, automatically re-fetch the order to get the updated total.
      dispatch(fetchOrderForCheckout(orderId));

      toast.success("Delivery option applied! Your total has been updated.");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.detail || "Could not apply delivery option.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Action to fetch details of a specific order for the payment page.
export const fetchOrderForCheckout = createAsyncThunk(
  "checkout/fetchOrderForCheckout",
  async (orderId, { getState, rejectWithValue }) => {
    const api = createApiClient(getState);
    try {
      const response = await api.get(`/api/v1/cart/checkout/${orderId}/`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail || "Could not load order details.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Action to process the payment after PayPal is approved.
export const processPaypalPayment = createAsyncThunk(
  "checkout/processPaypalPayment",
  async (
    { order_oid, payapl_order_id },
    { dispatch, getState, rejectWithValue }
  ) => {
    const api = createApiClient(getState);
    try {
      const payload = { order_oid, payapl_order_id };
      const response = await api.post("/api/v1/cart/payment-success/", payload);

      // THE FIX: Instead of clearing the cart locally, we re-fetch it from the backend.
      // Since the backend deleted the cart items, this will return an empty cart.
      dispatch(fetchUserCart());

      toast.success("Payment successful!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Payment verification failed.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  order: null,
  loading: false,
  deliveryLoading: false, // Added state for delivery submission
  error: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.order = null;
      state.error = null;
      state.loading = false;
      state.deliveryLoading = false; // Also reset this state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- ADDED: Reducer logic for the new applyDeliveryOption thunk ---
      .addCase(applyDeliveryOption.pending, (state) => {
        state.deliveryLoading = true;
        state.error = null;
      })
      .addCase(applyDeliveryOption.fulfilled, (state) => {
        state.deliveryLoading = false;
      })
      .addCase(applyDeliveryOption.rejected, (state, action) => {
        state.deliveryLoading = false;
        state.error = action.payload;
      })
      // --- End of new logic ---

      .addCase(fetchOrderForCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(fetchOrderForCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderForCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(processPaypalPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(processPaypalPayment.fulfilled, (state) => {
        state.loading = false;
        if (state.order) {
          state.order.payment_status = "paid";
        }
      })
      .addCase(processPaypalPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderState } = checkoutSlice.actions;
export default checkoutSlice.reducer;
