import { create } from "zustand";
import { axiosInstance, backendURL } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoginIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const { connectSocket } = get();
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      connectSocket();
    } catch (error) {
      console.log("Error in checkAuth: " + error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    try {
      const { connectSocket } = get();
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");

      connectSocket();
    } catch (error) {
      console.log("Error in signup: " + error);
      toast.error(error.response.data.message);
      set({ authUser: null });
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged Out Successfully");

      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout: " + error);
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    try {
      const { connectSocket } = get();
      set({ isLoginIn: true });
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged In successfully");

      connectSocket();
    } catch (error) {
      console.log("Error in login: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoginIn: false });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isUpdatingProfile: true });
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.log("Error in updateProfile: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(backendURL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
