import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { EmployeeRole } from "../types/auth";

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: EmployeeRole[] }) {
  const { employee, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="screen-loading">Verificando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
    return <Navigate to="/access-denied" replace />;
  }
  return <Outlet />;
}
