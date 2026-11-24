import { useCallback, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  employeesApi,
  menuApi,
  ordersApi,
  tablesApi,
} from "../services/foodflowService";
import type {
  EmployeeRecord,
  MenuItem,
  Order,
  RestaurantTable,
} from "../types/foodflow";
import { EmptyState, Loading } from "../components/Feedback";
import { StatusBadge } from "../components/StatusBadge";

export default function DashboardPage() {
  const { employee } = useAuth();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (employee?.role === "kitchen") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [tableData, orderData] = await Promise.all([
        tablesApi.list(),
        ordersApi.list(),
      ]);
      const [employeeData, menuData] =
        employee?.role === "admin"
          ? await Promise.all([employeesApi.list(), menuApi.list()])
          : [[], await menuApi.available()];
      setTables(tableData);
      setOrders(orderData);
      setEmployees(employeeData);
      setMenu(menuData);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo cargar el resumen.",
      );
    } finally {
      setLoading(false);
    }
  }, [employee?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  if (employee?.role === "kitchen") return <Navigate to="/kitchen" replace />;

  const activeOrders = orders.filter((order) => order.status === "en_proceso");
  const servedOrders = orders.filter((order) => order.status === "servida");
  const occupiedTables = tables.filter(
    (table) => table.status !== "disponible",
  );

  if (loading) return <Loading label="Preparando el resumen operativo..." />;

  return (
    <div className="stack-xl">
      {error && <div className="feedback feedback--error">{error}</div>}
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">VISTA GENERAL</span>
          <h2>Hola, {employee?.name.split(" ")[0]}.</h2>
          <p>Este es el estado actual de la operación del restaurante.</p>
        </div>
        <div className="welcome-panel__date">
          {new Intl.DateTimeFormat("es-CO", { dateStyle: "full" }).format(
            new Date(),
          )}
        </div>
      </section>
      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-card__label">Mesas en operación</span>
          <strong>
            {occupiedTables.length}
            <small> / {tables.length}</small>
          </strong>
          <span className="metric-card__hint">
            Mesas ocupadas o en atención
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Pedidos en preparación</span>
          <strong>{activeOrders.length}</strong>
          <span className="metric-card__hint">Pendientes de cocina</span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Pedidos servidos</span>
          <strong>{servedOrders.length}</strong>
          <span className="metric-card__hint">
            Pendientes de facturación o pago
          </span>
        </article>
        {employee?.role === "admin" && (
          <article className="metric-card">
            <span className="metric-card__label">Empleados activos</span>
            <strong>{employees.filter((item) => item.active).length}</strong>
            <span className="metric-card__hint">
              De {employees.length} registrados
            </span>
          </article>
        )}
        {employee?.role !== "admin" && (
          <article className="metric-card">
            <span className="metric-card__label">Productos disponibles</span>
            <strong>{menu.length}</strong>
            <span className="metric-card__hint">
              En el menú del restaurante
            </span>
          </article>
        )}
      </section>
      <section className="content-grid">
        <div className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">SEGUIMIENTO</span>
              <h2>Pedidos recientes</h2>
            </div>
            <Link className="text-link" to="/orders">
              Ver todos ↗
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState
              title="Todavía no hay pedidos"
              description="Los pedidos creados aparecerán aquí."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Mesa</th>
                    <th>Creado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders]
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 6)
                    .map((order) => (
                      <tr key={order.id}>
                        <td className="cell-strong">#{order.id}</td>
                        <td>
                          Mesa{" "}
                          {tables.find((table) => table.id === order.table_id)
                            ?.number ?? order.table_id}
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleTimeString(
                            "es-CO",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="panel panel--accent">
          <span className="eyebrow">ACCESOS RÁPIDOS</span>
          <h2>Operación</h2>
          <div className="quick-links">
            {(employee?.role === "admin" || employee?.role === "waiter") && (
              <Link to="/tables">
                Administrar mesas <span>→</span>
              </Link>
            )}
            <Link to="/orders">
              Consultar pedidos <span>→</span>
            </Link>
            {(employee?.role === "admin" ||
              employee?.role === "waiter" ||
              employee?.role === "cashier") && (
              <Link to="/billing">
                Cuentas y pagos <span>→</span>
              </Link>
            )}
            {employee?.role === "admin" && (
              <Link to="/employees">
                Gestionar empleados <span>→</span>
              </Link>
            )}
            <Link to="/menu">
              Consultar menú <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
