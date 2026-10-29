import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// The APK ships the same client screens and local demo state, without an SSR server.
export function mountMobile() {
  createRoot(document.getElementById("root")!).render(<RouterProvider router={getRouter()} />);
}
