
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/signup/Signup.jsx";

import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ReceiptPage from './pages/receipts/ReceiptPage.jsx';
import DeliveryPage from './pages/delivery/DeliveryPage.jsx';
import MovementPage from './pages/movements/MovementPage.jsx';
import AdjustmentPage from './pages/adjustments/AdjustmentPage.jsx';
import StockPage from './pages/stock/StockPage.jsx';
import WarehousesPage from './pages/settings/WarehousesPage.jsx';
import LocationsPage from './pages/settings/LocationsPage.jsx';
import Product from './pages/product/index.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
  {
    path: "/receipts",
    element: <ReceiptPage />
  },
  {
    path: "/receipt",
    element: <ReceiptPage />
  },
  {
    path: "/deliveries",
    element: <DeliveryPage />
  },
  {
    path: "/delivery",
    element: <DeliveryPage />
  },
  {
    path: "/adjustments",
    element: <AdjustmentPage />
  },
  {
    path: "/adjustment",
    element: <AdjustmentPage />
  },
  {
    path: "/stock",
    element: <StockPage />
  },
  {
    path: "/stocks",
    element: <StockPage />
  },
  {
    path: "/movements",
    element: <MovementPage />
  },
  {
    path: "/movement",
    element: <MovementPage />
  },
  {
    path: "/history",
    element: <MovementPage />
  },
  {
    path: "/settings/warehouses",
    element: <WarehousesPage />
  },
  {
    path: "/settings/locations",
    element: <LocationsPage />
  },
  {
    path: "/product",
    element: <Product />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
