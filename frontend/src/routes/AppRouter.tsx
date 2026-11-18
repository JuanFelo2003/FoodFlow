import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import ProtectedRoute from "./ProtectedRoute";

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p>Verificando sesión...</p>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginRoute />} />

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin", "waiter", "cashier", "kitchen"]}
            />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
