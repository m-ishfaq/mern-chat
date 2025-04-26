import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { incomingMessage } from "../components/IncomingMessageToast";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    try {
      set({ isUsersLoading: true });
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.log("Error in getUsers: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    try {
      set({ isMessagesLoading: true });
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.log("Error in getMessages: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  scrollToBottom: (chatRef) => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  },

  getUserById: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/get-user/${userId}`);
      return res.data.user;
    } catch (error) {
      console.log("Error in getUserById: " + error);
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, getUserById } = get();

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      if (selectedUser._id === newMessage.senderId)
        set({ messages: [...get().messages, newMessage] });

      if (!selectedUser || selectedUser._id !== newMessage.senderId) {
        const receiver = await getUserById(newMessage.senderId);
        console.log(receiver);

        incomingMessage({
          name: receiver.fullName,
          message: newMessage.text
            ? newMessage.text
            : newMessage.file
            ? "1 Photo"
            : "",
          image: receiver.avatar?.url || "/avatar.png",
        });
      }
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  sendMessage: async (data) => {
    try {
      set({ isSendingMessage: true });
      const { selectedUser, messages } = get();
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        data
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log("Error in sendMessage: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSendingMessage: false });
    }
  },
}));
