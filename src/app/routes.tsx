import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./pages/Dashboard";
import { Providers } from "./pages/Providers";
import { CompareModels } from "./pages/CompareModels";
import { Alerts } from "./pages/Alerts";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "providers", Component: Providers },
      { path: "compare", Component: CompareModels },
      { path: "alerts", Component: Alerts },
      { path: "*", Component: NotFound },
    ],
  },
]);
