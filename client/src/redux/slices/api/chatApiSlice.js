import { apiSlice } from "../apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => "/chat/rooms",
      providesTags: ["ChatRoom"],
    }),
    createRoom: builder.mutation({
      query: (data) => ({ url: "/chat/rooms", method: "POST", body: data }),
      invalidatesTags: ["ChatRoom"],
    }),
    joinRoom: builder.mutation({
      query: (id) => ({ url: `/chat/rooms/${id}/join`, method: "POST" }),
      invalidatesTags: ["ChatRoom"],
    }),
    leaveRoom: builder.mutation({
      query: (id) => ({ url: `/chat/rooms/${id}/leave`, method: "POST" }),
      invalidatesTags: ["ChatRoom"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: `/chat/rooms/${id}`, method: "DELETE" }),
      invalidatesTags: ["ChatRoom"],
    }),
    getMessages: builder.query({
      query: (roomId) => `/chat/rooms/${roomId}/messages`,
      providesTags: (r, e, roomId) => [{ type: "ChatMessage", id: roomId }],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
  useDeleteRoomMutation,
  useGetMessagesQuery,
} = chatApiSlice;
