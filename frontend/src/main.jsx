import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/signup/Signup.jsx";
import {
  ForgotPasswordPage,
  ForcedResetPasswordPage,
} from "./pages/login/ResetPassword.jsx";
import CreateCompany from "./pages/company/CreateCompany.jsx";
import CompanyManagementPage from "./pages/company/CompanyManagementPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoute.jsx";

import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import ReceiptPage from "./pages/receipts/ReceiptPage.jsx";
import DeliveryPage from "./pages/delivery/DeliveryPage.jsx";
import MovementPage from "./pages/movements/MovementPage.jsx";
import AdjustmentPage from "./pages/adjustments/AdjustmentPage.jsx";
import StockPage from "./pages/stock/StockPage.jsx";
import WarehousesPage from "./pages/settings/WarehousesPage.jsx";
import LocationsPage from "./pages/settings/LocationsPage.jsx";
import Product from "./pages/product/index.jsx";

function guard(element, options = {}) {
  return <ProtectedRoute {...options}>{element}</ProtectedRoute>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: guard(<DashboardPage />),
  },
  {
    path: "/receipts",
    element: guard(<ReceiptPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/receipt",
    element: guard(<ReceiptPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/deliveries",
    element: guard(<DeliveryPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/delivery",
    element: guard(<DeliveryPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/adjustments",
    element: guard(<AdjustmentPage />),
  },
  {
    path: "/adjustment",
    element: guard(<AdjustmentPage />),
  },
  {
    path: "/stock",
    element: guard(<StockPage />),
  },
  {
    path: "/stocks",
    element: guard(<StockPage />),
  },
  {
    path: "/movements",
    element: guard(<MovementPage />),
  },
  {
    path: "/movement",
    element: guard(<MovementPage />),
  },
  {
    path: "/history",
    element: guard(<MovementPage />),
  },
  {
    path: "/settings/warehouses",
    element: guard(<WarehousesPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/settings/locations",
    element: guard(<LocationsPage />, {
      allowedRoles: ["OWNER", "INVENTORY_MANAGER"],
    }),
  },
  {
    path: "/company",
    element: guard(<CompanyManagementPage />, {
      allowedRoles: ["OWNER"],
    }),
  },
  {
    path: "/create-company",
    element: (
      <ProtectedRoute requireCompany={false}>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product",
    element: guard(<Product />),
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnlyRoute>
        <Signup />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <ForcedResetPasswordPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
