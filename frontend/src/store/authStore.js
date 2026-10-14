import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
isAuthenticated: false,
isLoading: true,


  // Register a new patient
signup: async (userData) => {
  set({ isLoading: true });

  try {
    const response = await api.post("/auth/signup", userData);

    const { user } = response.data;

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });

    return {
      success: true,
    };
  } catch (error) {
    set({ isLoading: false });

    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Registration failed. Please try again.",
    };
  }
},
  // Login user
  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user } = response.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
return {
  success: true,
  user,
};

    } catch (error) {
      set({ isLoading: false });

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please try again.",
      };
    }
  },

  // Get current authenticated user
  getMe: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/auth/me");

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Authentication failed.",
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;
