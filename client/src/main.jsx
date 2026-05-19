import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import App from "./App";
import { store } from "./redux/store";
import { SettingsProvider } from "./context/SettingsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <SettingsProvider>
        <BrowserRouter>
          <App />
          <Toaster richColors position="top-center" />
        </BrowserRouter>
      </SettingsProvider>
    </Provider>
  </React.StrictMode>
);
