import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { EmployeeRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: EmployeeRole[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { employee, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p>Verificando sesión...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
