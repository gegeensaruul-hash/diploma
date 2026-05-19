import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

// 401 гарахад автоматаар localStorage цэвэрлэж login руу шилждэг
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Session дууссан — localStorage цэвэрлэж login руу шилжинэ
    api.dispatch(clearCredentials());
    // Logout endpoint дуудаж cookie устгана
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    // Login хуудас руу буцаана (/login)
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Todo", "Category", "User", "ChatRoom", "ChatMessage"],
  endpoints: () => ({}),
});
