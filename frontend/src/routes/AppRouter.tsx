import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../layouts/AppLayout";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import BillingPage from "../pages/BillingPage";
import DashboardPage from "../pages/DashboardPage";
import EmployeesPage from "../pages/EmployeesPage";
import KitchenPage from "../pages/KitchenPage";
import LoginPage from "../pages/LoginPage";
import MenuPage from "../pages/MenuPage";
import NotFoundPage from "../pages/NotFoundPage";
import OrdersPage from "../pages/OrdersPage";
import TablesPage from "../pages/TablesPage";
import ProtectedRoute from "./ProtectedRoute";

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)
    return <div className="screen-loading">Verificando sesión...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/employees" element={<EmployeesPage />} />
            </Route>
            <Route path="/menu" element={<MenuPage />} />
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin", "waiter", "cashier"]} />
              }
            >
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/billing" element={<BillingPage />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={["admin", "kitchen"]} />}
            >
              <Route path="/kitchen" element={<KitchenPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
