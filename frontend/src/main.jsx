import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
  Link,
  Navigate,
} from "react-router-dom";
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
          {error?.message ||
            "An unexpected error occurred while rendering the page."}
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

function guard(element, options = {}) {
  return <ProtectedRoute {...options}>{element}</ProtectedRoute>;
}

const routes = [
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
].map((route) => ({
  ...route,
  errorElement: <RouteErrorBoundary />,
}));

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
