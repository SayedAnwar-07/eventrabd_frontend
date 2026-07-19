import { createRoot } from "react-dom/client";
import "./index.css";
import MainRoutes from "./routes";
import { Provider } from "react-redux";
import { store } from "./store/store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <MainRoutes />
  </Provider>,
);
