import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider, useRouteError, Link } from "react-router-dom";
import Product from "./pages/product/index.jsx";
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

function RouteErrorBoundary() {
  const error = useRouteError();
  console.error("Route Error:", error);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Notice</h2>
        <p className="text-xs text-slate-500">
          {error?.message || "An unexpected error occurred while rendering the page."}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Reload Page
          </button>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

const routes = [
  { path: "/", element: <DashboardPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/receipts", element: <ReceiptPage /> },
  { path: "/receipt", element: <ReceiptPage /> },
  { path: "/deliveries", element: <DeliveryPage /> },
  { path: "/delivery", element: <DeliveryPage /> },
  { path: "/adjustments", element: <AdjustmentPage /> },
  { path: "/adjustment", element: <AdjustmentPage /> },
  { path: "/stock", element: <StockPage /> },
  { path: "/stocks", element: <StockPage /> },
  { path: "/movements", element: <MovementPage /> },
  { path: "/movement", element: <MovementPage /> },
  { path: "/history", element: <MovementPage /> },
  { path: "/settings/warehouses", element: <WarehousesPage /> },
  { path: "/settings/locations", element: <LocationsPage /> },
  { path: "/product", element: <Product /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
].map((route) => ({
  ...route,
  errorElement: <RouteErrorBoundary />
}));

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
