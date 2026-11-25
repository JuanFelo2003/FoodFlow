import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { EmployeeRole } from "../types/auth";
import { roleLabel } from "../utils/format";

interface NavigationItem {
  label: string;
  path: string;
  roles: EmployeeRole[];
  icon: string;
}

const allRoles: EmployeeRole[] = ["admin", "waiter", "cashier", "kitchen"];
const navigation: NavigationItem[] = [
  {
    label: "Resumen",
    path: "/dashboard",
    roles: ["admin", "waiter", "cashier"],
    icon: "▦",
  },
  { label: "Cocina", path: "/kitchen", roles: ["admin", "kitchen"], icon: "◫" },
  { label: "Empleados", path: "/employees", roles: ["admin"], icon: "♙" },
  { label: "Menú", path: "/menu", roles: allRoles, icon: "▤" },
  {
    label: "Mesas",
    path: "/tables",
    roles: ["admin", "waiter", "cashier"],
    icon: "▦",
  },
  {
    label: "Pedidos",
    path: "/orders",
    roles: ["admin", "waiter", "cashier"],
    icon: "≡",
  },
  {
    label: "Cuentas y pagos",
    path: "/billing",
    roles: ["admin", "waiter", "cashier"],
    icon: "$",
  },
];

const titles: Record<string, string> = {
  "/dashboard": "Resumen",
  "/kitchen": "Panel de cocina",
  "/employees": "Empleados",
  "/menu": "Menú",
  "/tables": "Mesas",
  "/orders": "Pedidos",
  "/billing": "Cuentas y pagos",
};

export default function AppLayout() {
  const { employee, logout } = useAuth();
  const location = useLocation();
  const items = navigation.filter(
    (item) => employee && item.roles.includes(employee.role),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">F</span>
          <span>foodflow</span>
        </div>
        <div className="sidebar__caption">OPERACIÓN</div>
        <nav className="navigation" aria-label="Navegación principal">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navigation__link${isActive ? " is-active" : ""}`
              }
            >
              <span className="navigation__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="user-avatar">
            {employee?.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="user-summary">
            <strong>{employee?.name}</strong>
            <span>{employee ? roleLabel(employee.role) : ""}</span>
          </div>
          <button
            className="icon-button logout-button"
            type="button"
            onClick={logout}
            title="Cerrar sesión"
          >
            ↗
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">FOODFLOW / OPERACIONES</span>
            <h1>{titles[location.pathname] ?? "FoodFlow"}</h1>
          </div>
          <div className="topbar__right">
            <span className="live-dot" /> Sistema operativo
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
