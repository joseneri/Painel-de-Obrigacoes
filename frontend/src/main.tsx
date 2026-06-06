import React from "react";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "antd/dist/reset.css";
import "./app/styles.css";
import { App } from "./app/App";
import { AppProviders } from "./app/AppProviders";

dayjs.locale("pt-br");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
