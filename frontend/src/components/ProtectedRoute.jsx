import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ACCESS = {
  OWNER: [
    "dashboard",
    "receipts",
    "deliveries",
    "adjustments",
    "stock",
    "movements",
    "warehouses",
    "locations",
    "company",
  ],
  INVENTORY_MANAGER: [
    "dashboard",
    "receipts",
    "deliveries",
    "adjustments",
    "stock",
    "movements",
    "warehouses",
    "locations",
  ],
  WAREHOUSE_STAFF: ["dashboard", "adjustments", "stock", "movements"],
};

export function canAccess(role, area) {
  return ROLE_ACCESS[role]?.includes(area) ?? false;
}

export function ProtectedRoute({ children, requireCompany = true, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCompany && !user?.companyId) {
    return <Navigate to="/create-company" replace />;
  }

  if (!requireCompany && user?.companyId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (!user?.companyId) {
      return <Navigate to="/create-company" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
