import { apiSlice } from "../apiSlice";

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    activatePro: builder.mutation({
      query: () => ({ url: "/payments/activate-pro", method: "POST" }),
    }),
  }),
});

export const { useActivateProMutation } = paymentApiSlice;
