import { apiSlice } from "../apiSlice";

export const todoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query({
      query: (params = {}) => ({
        url: "/todos",
        params,
      }),
      providesTags: ["Todo"],
    }),
    getStats: builder.query({
      query: () => "/todos/stats",
      providesTags: ["Todo"],
    }),
    getTrashed: builder.query({
      query: () => "/todos/trash",
      providesTags: ["Todo"],
    }),
    getTodo: builder.query({
      query: (id) => `/todos/${id}`,
      providesTags: ["Todo"],
    }),
    createTodo: builder.mutation({
      query: (data) => ({ url: "/todos", method: "POST", body: data }),
      invalidatesTags: ["Todo"],
    }),
    updateTodo: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/todos/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Todo"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/todos/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Todo"],
    }),
    trashTodo: builder.mutation({
      query: (id) => ({ url: `/todos/${id}/trash`, method: "PATCH" }),
      invalidatesTags: ["Todo"],
    }),
    restoreTodo: builder.mutation({
      query: (id) => ({ url: `/todos/${id}/restore`, method: "PATCH" }),
      invalidatesTags: ["Todo"],
    }),
    deleteTodo: builder.mutation({
      query: (id) => ({ url: `/todos/${id}`, method: "DELETE" }),
      invalidatesTags: ["Todo"],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useGetStatsQuery,
  useGetTrashedQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useUpdateStatusMutation,
  useTrashTodoMutation,
  useRestoreTodoMutation,
  useDeleteTodoMutation,
} = todoApiSlice;
