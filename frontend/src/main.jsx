import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import AuthProvider from "./context/AuthContext";
import { AppToaster } from "./components/Toast";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <AuthProvider>
    <AppToaster />
    <App />
  </AuthProvider>
);
