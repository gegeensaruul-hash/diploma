import { apiSlice } from "../apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: "/users/profile", method: "PUT", body: data }),
      invalidatesTags: ["User"],
    }),
    updateProfileImages: builder.mutation({
      query: (data) => ({ url: "/users/profile/images", method: "PUT", body: data }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({ url: "/users/change-password", method: "PUT", body: data }),
    }),
    toggleUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}/toggle`, method: "PUT" }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateProfileMutation,
  useUpdateProfileImagesMutation,
  useChangePasswordMutation,
  useToggleUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
