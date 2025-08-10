import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

// A helper to get a clear error message from a failed API call
const getErrorMessage = (error) => {
  const errorData = error.response?.data;
  if (!errorData) return error.message || "An unknown error occurred.";
  if (typeof errorData === "string") return errorData;
  if (errorData.detail) return errorData.detail;
  // This will grab all validation errors from DRF and join them.
  return Object.entries(errorData)
    .map(([key, value]) => `${key}: ${value.join(", ")}`)
    .join("; ");
};

// This needs to be outside so it can be used in injectStore
let store;

// Create a reusable axios instance
const api = axios.create({ baseURL: BASE_URL });

// Use an interceptor to automatically add the auth token to every request
api.interceptors.request.use((config) => {
  try {
    const token = store.getState().user.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn(
      "Could not get token for request. Store might not be injected yet."
    );
  }
  return config;
});

// --- ASYNC THUNKS FOR PROFILE MANAGEMENT ---

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/profiles/me/");
      return response.data;
    } catch (error) {
      toast.error("Could not load profile.");
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const profilePayload = new FormData();
      profilePayload.append("username", profileData.username);
      profilePayload.append("email", profileData.email);
      profilePayload.append("first_name", profileData.first_name);
      profilePayload.append("last_name", profileData.last_name);
      profilePayload.append("phone_number", profileData.phone_number || "");
      profilePayload.append("about_me", profileData.about_me || "");
      profilePayload.append("gender", profileData.gender);
      profilePayload.append("country", profileData.country);
      profilePayload.append("city", profileData.city || "");
      if (
        profileData.profile_photo &&
        typeof profileData.profile_photo !== "string"
      ) {
        profilePayload.append("profile_photo", profileData.profile_photo);
      }
      await api.put("/api/v1/profiles/me/update/", profilePayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      const updatedProfile = await dispatch(fetchUserProfile()).unwrap();
      return updatedProfile;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message || "Failed to update profile.");
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const endpoint = `/api/v1/auth/register/`;
      const payload = {
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.role,
        password: userData.password, // This field was likely named 'password1' before
        password2: userData.password2,
      };
      const response = await axios.post(`${BASE_URL}${endpoint}`, payload);
      toast.success("Registration successful! Please sign in.");
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);
export const signIn = createAsyncThunk(
  "user/signIn",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const tokenResponse = await axios.post(
        `${BASE_URL}/api/v1/auth/token/`,
        credentials
      );
      const { access, refresh } = tokenResponse.data;

      const profileResponse = await axios.get(
        `${BASE_URL}/api/v1/profiles/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      const profileData = profileResponse.data;
      dispatch(fetchUserCart());
      toast.success("Login successful!");
      return {
        accessToken: access,
        refreshToken: refresh,
        profile: profileData,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// --- CART THUNKS ---
export const fetchUserCart = createAsyncThunk(
  "user/fetchUserCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/cart/cart/");
      const items = response.data;
      const cartId = items.length > 0 ? items[0].cart_id : null;
      return { items, cartId };
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 404 ||
          (error.response.status === 200 && !error.response.data.length))
      ) {
        return { items: [], cartId: null };
      }
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "user/addItemToCart",
  async (itemData, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/api/v1/cart/cart/", itemData);
      toast.success("Bag updated!");
      dispatch(fetchUserCart());
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "user/removeItemFromCart",
  async (itemId, { getState, rejectWithValue }) => {
    const { cart } = getState().user;
    if (!cart?.cart_id) {
      toast.error("Cart not found.");
      return rejectWithValue("Cart ID not found.");
    }
    try {
      await api.delete(`/api/v1/cart/cart/${cart.cart_id}/delete/${itemId}/`);
      toast.success("Item removed from bag.");
      return itemId;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// --- THE SLICE DEFINITION ---
const initialState = {
  currentUser: null,
  profile: null,
  accessToken: null,
  refreshToken: null,
  cart: null,
  cartItems: [],
  cartLoading: false,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signOutSuccess: (state) => {
      Object.assign(state, initialState);
      toast("You have been signed out.");
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Auth Reducers
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;

        // ===== FIX: Unwrap the nested profile from the sign-in payload =====
        const actualProfile = action.payload.profile.profile;
        state.profile = actualProfile;
        state.currentUser = {
          id: actualProfile.id,
          email: actualProfile.email,
          first_name: actualProfile.first_name,
          last_name: actualProfile.last_name,
          role:actualProfile.role,
        };
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cart Reducers
      .addCase(fetchUserCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.cartItems = action.payload.items;
        state.cart = { cart_id: action.payload.cartId };
        state.cartLoading = false;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.error = action.payload;
        state.cartLoading = false;
      })
      .addCase(addItemToCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.cartLoading = false;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== action.payload
        );
        state.cartLoading = false;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.error = action.payload;
      })

      // PROFILE REDUCERS
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // ===== FIX: Unwrap the nested profile object from the API response =====
        const actualProfile = action.payload.profile;
        state.profile = actualProfile;
        state.currentUser = {
          id: actualProfile.id,
          email: actualProfile.email,
          first_name: actualProfile.first_name,
          last_name: actualProfile.last_name,
        };
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // ===== FIX: Unwrap the nested profile here as well =====
        const actualProfile = action.payload.profile;
        state.profile = actualProfile;
        state.currentUser = {
          ...state.currentUser,
          first_name: actualProfile.first_name,
          last_name: actualProfile.last_name,
        };
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { signOutSuccess, clearUserError } = userSlice.actions;
export default userSlice.reducer;

export const injectStore = (_store) => {
  store = _store;
};


