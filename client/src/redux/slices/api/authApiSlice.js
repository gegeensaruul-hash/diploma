import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: "/auth/login", method: "POST", body: data }),
    }),
    register: builder.mutation({
      query: (data) => ({ url: "/auth/register", method: "POST", body: data }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } = authApiSlice;
