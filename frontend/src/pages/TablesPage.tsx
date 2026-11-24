import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersApi, tablesApi } from "../services/foodflowService";
import type { Order, RestaurantTable, TableStatus } from "../types/foodflow";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";

const filters: { value: "all" | TableStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "disponible", label: "Disponibles" },
  { value: "ocupada", label: "Ocupadas" },
  { value: "en_atencion", label: "En atención" },
];

export default function TablesPage() {
  const { employee } = useAuth();
  const canManage = employee?.role === "admin";
  const canServe = employee?.role === "admin" || employee?.role === "waiter";
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filter, setFilter] = useState<"all" | TableStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [selected, setSelected] = useState<RestaurantTable | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (nextFilter: "all" | TableStatus) => {
    setLoading(true);
    try {
      setTables(nextFilter === "all" ? await tablesApi.list() : await tablesApi.byStatus(nextFilter));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar las mesas."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load("all"); }, [load]);

  async function createTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await tablesApi.create(Number(number));
      setCreateOpen(false);
      setNumber("");
      setNotice("Mesa creada correctamente.");
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear la mesa."); }
    finally { setBusy(false); }
  }

  async function changeStatus(table: RestaurantTable, status: TableStatus) {
    try {
      await tablesApi.setStatus(table.id, status);
      setNotice(`Mesa ${table.number}: estado actualizado.`);
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar la mesa."); }
  }

  async function openTable(table: RestaurantTable) {
    setSelected(table);
    try {
      setRelatedOrders(await ordersApi.byTable(table.id));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los pedidos de la mesa."); }
  }

  async function createOrder() {
    if (!selected) return;
    setBusy(true);
    try {
      if (selected.status === "disponible") await tablesApi.setStatus(selected.id, "ocupada");
      await ordersApi.create(selected.id);
      setNotice(`Pedido creado para la mesa ${selected.number}.`);
      setSelected(null);
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear el pedido."); }
    finally { setBusy(false); }
  }

  async function removeTable(table: RestaurantTable) {
    if (!window.confirm(`¿Eliminar la mesa ${table.number}?`)) return;
    try {
      const relatedOrders = await ordersApi.byTable(table.id);
      if (relatedOrders.length > 0) {
        setError("No se puede eliminar una mesa que tiene historial de pedidos.");
        return;
      }
      await tablesApi.remove(table.id);
      setNotice("Mesa eliminada.");
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar la mesa."); }
  }

  return (
    <div className="stack-lg">
      <div className="page-intro"><div><span className="eyebrow">SALÓN</span><h2>Mesas</h2><p>Consulta la ocupación y administra el ciclo de atención de cada mesa.</p></div>{canManage && <button className="button button--primary" onClick={() => setCreateOpen(true)}>＋ Nueva mesa</button>}</div>
      <Feedback message={error} /><Feedback message={notice} tone="success" />
      <div className="filter-bar">{filters.map((item) => <button key={item.value} className={`filter-chip${filter === item.value ? " is-active" : ""}`} onClick={() => { setFilter(item.value); void load(item.value); }}>{item.label}</button>)}</div>
      {loading ? <Loading /> : tables.length === 0 ? <EmptyState title="No hay mesas en este estado" description="Prueba otro filtro o crea una mesa nueva." /> : (
        <div className="table-card-grid">{tables.map((table) => <article className={`table-card table-card--${table.status}`} key={table.id}>
          <div className="table-card__top"><span className="table-card__icon">⌂</span><StatusBadge status={table.status} /></div>
          <strong className="table-card__number">{String(table.number).padStart(2, "0")}</strong><span className="muted">Mesa</span>
          <div className="table-card__actions"><button className="button button--small button--outline" onClick={() => void openTable(table)}>Ver pedidos</button>{canServe && table.status !== "en_atencion" && <button className="button button--small button--primary" onClick={() => void changeStatus(table, table.status === "disponible" ? "ocupada" : "disponible")}>{table.status === "disponible" ? "Marcar ocupada" : "Liberar"}</button>}{canManage && <button className="button button--small button--danger-ghost" onClick={() => void removeTable(table)}>Eliminar</button>}</div>
        </article>)}</div>
      )}
      {createOpen && <Modal title="Crear mesa" onClose={() => setCreateOpen(false)}><form className="form-stack" onSubmit={createTable}><label className="field"><span>Número de mesa</span><input type="number" min="1" step="1" value={number} onChange={(event) => setNumber(event.target.value)} required /></label><div className="modal__actions"><button type="button" className="button button--ghost" onClick={() => setCreateOpen(false)}>Cancelar</button><button className="button button--primary" disabled={busy}>{busy ? "Creando..." : "Crear mesa"}</button></div></form></Modal>}
      {selected && <Modal title={`Mesa ${selected.number}`} onClose={() => setSelected(null)}><div className="stack-md"><div className="inline-between"><span>Estado actual</span><StatusBadge status={selected.status} /></div><h3>Historial de pedidos</h3>{relatedOrders.length ? relatedOrders.map((order) => <div className="list-row" key={order.id}><span>Pedido #{order.id}</span><StatusBadge status={order.status} /></div>) : <p className="muted">Esta mesa todavía no tiene pedidos.</p>}{canServe && selected.status !== "en_atencion" && <button className="button button--primary button--full" onClick={() => void createOrder()} disabled={busy}>{busy ? "Creando pedido..." : "＋ Crear pedido para esta mesa"}</button>}</div></Modal>}
    </div>
  );
}
