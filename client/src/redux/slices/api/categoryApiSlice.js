import { apiSlice } from "../apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (data) => ({ url: "/categories", method: "POST", body: data }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/categories/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category", "Todo"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
