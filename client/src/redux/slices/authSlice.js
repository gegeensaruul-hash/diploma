import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    updateUserImages: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, updateUserImages, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
