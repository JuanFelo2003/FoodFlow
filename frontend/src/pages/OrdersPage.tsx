import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { menuApi, orderItemsApi, ordersApi, tablesApi } from "../services/foodflowService";
import type { MenuItem, Order, OrderItem, RestaurantTable, OrderStatus } from "../types/foodflow";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";

const statusFilters: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "en_proceso", label: "En preparación" },
  { value: "servida", label: "Servidos" },
  { value: "pagada", label: "Pagados" },
];

export default function OrdersPage() {
  const { employee } = useAuth();
  const canEdit = employee?.role === "admin" || employee?.role === "waiter";
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tableId, setTableId] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (nextFilter: "all" | OrderStatus) => {
    setLoading(true);
    try {
      const [orderData, tableData] = await Promise.all([
        nextFilter === "all" ? ordersApi.list() : ordersApi.byStatus(nextFilter),
        tablesApi.list(),
      ]);
      setOrders(orderData.sort((a,b) => b.id-a.id));
      setTables(tableData);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los pedidos."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load("all"); }, [load]);

  async function openOrder(order: Order) {
    setSelected(order);
    setDetailLoading(true);
    try {
      const [freshOrder, orderItems, availableMenu] = await Promise.all([
        ordersApi.get(order.id),
        orderItemsApi.list(order.id),
        menuApi.list(),
      ]);
      setSelected(freshOrder);
      setItems(orderItems);
      setMenu(availableMenu);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el detalle."); }
    finally { setDetailLoading(false); }
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !menuItemId) return;
    setSaving(true);
    try {
      await orderItemsApi.create({ order_id: selected.id, menu_item_id: Number(menuItemId), quantity: Number(quantity) });
      setMenuItemId("");
      setQuantity("1");
      setItems(await orderItemsApi.list(selected.id));
      setNotice("Producto agregado al pedido.");
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo agregar el producto."); }
    finally { setSaving(false); }
  }

  async function changeItem(item: OrderItem) {
    try {
      const freshItem = await orderItemsApi.get(item.id);
      const nextQuantity = window.prompt("Nueva cantidad", String(freshItem.quantity));
      if (nextQuantity === null) return;
      const parsed = Number(nextQuantity);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        setError("La cantidad debe ser un entero positivo.");
        return;
      }
      await orderItemsApi.update(item.id, parsed);
      setItems(await orderItemsApi.list(item.order_id));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar el producto."); }
  }

  async function removeItem(item: OrderItem) {
    if (!window.confirm("¿Quitar este producto del pedido?")) return;
    try { await orderItemsApi.remove(item.id); setItems(await orderItemsApi.list(item.order_id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo quitar el producto."); }
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tableId) return;
    setSaving(true);
    try {
      const table = tables.find((item) => item.id === Number(tableId));
      if (!table) throw new Error("Selecciona una mesa válida.");
      if (table.status === "disponible") await tablesApi.setStatus(table.id, "ocupada");
      if (table.status === "en_atencion") throw new Error("La mesa ya tiene un pedido en atención.");
      await ordersApi.create(table.id);
      setTableId("");
      setNotice("Pedido creado. Ahora agrega sus productos.");
      await load(filter);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear el pedido."); }
    finally { setSaving(false); }
  }

  async function markServed(order: Order) {
    if (!window.confirm(`¿Marcar el pedido #${order.id} como servido?`)) return;
    try { await ordersApi.setStatus(order.id, "servida"); setNotice(`Pedido #${order.id} marcado como servido.`); await load(filter); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar el pedido."); }
  }

  async function cancelOrder(order: Order) {
    if (!window.confirm(`¿Eliminar el pedido #${order.id}? Esta acción no se puede deshacer.`)) return;
    try { await ordersApi.remove(order.id); setNotice("Pedido eliminado."); await load(filter); if (selected?.id === order.id) setSelected(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar el pedido."); }
  }

  const tableNumber = (id: number) => tables.find((table) => table.id === id)?.number ?? id;
  const menuName = (id: number) => menu.find((item) => item.id === id)?.name ?? `Producto ${id}`;

  return (
    <div className="stack-lg">
      <div className="page-intro"><div><span className="eyebrow">SERVICIO</span><h2>Gestión de pedidos</h2><p>Consulta pedidos, administra sus productos y sigue su estado.</p></div></div>
      <Feedback message={error} /><Feedback message={notice} tone="success" />
      {canEdit && <form className="create-order-bar" onSubmit={createOrder}><div><strong>Crear pedido</strong><span>Selecciona una mesa disponible u ocupada.</span></div><select value={tableId} onChange={(event) => setTableId(event.target.value)} required><option value="">Seleccionar mesa</option>{tables.filter((table) => table.status !== "en_atencion").map((table) => <option key={table.id} value={table.id}>Mesa {table.number} · {table.status === "disponible" ? "Disponible" : "Ocupada"}</option>)}</select><button className="button button--primary" disabled={saving || !tableId}>{saving ? "Creando..." : "Crear pedido"}</button></form>}
      <div className="filter-bar">{statusFilters.map((item) => <button key={item.value} className={`filter-chip${filter === item.value ? " is-active" : ""}`} onClick={() => { setFilter(item.value); void load(item.value); }}>{item.label}</button>)}</div>
      {loading ? <Loading /> : orders.length === 0 ? <EmptyState title="No hay pedidos" description="Los pedidos aparecerán aquí cuando se registren." /> : <div className="panel"><div className="table-wrap"><table><thead><tr><th>Pedido</th><th>Mesa</th><th>Fecha</th><th>Estado</th><th className="align-right">Acciones</th></tr></thead><tbody>
        {orders.map((order) => <tr key={order.id}><td className="cell-strong">#{order.id}</td><td>Mesa {tableNumber(order.table_id)}</td><td>{formatDate(order.created_at)}</td><td><StatusBadge status={order.status} /></td><td><div className="table-actions"><button className="button button--small button--ghost" onClick={() => void openOrder(order)}>Detalle</button>{canEdit && order.status === "en_proceso" && <button className="button button--small button--outline" onClick={() => void markServed(order)}>Marcar servido</button>}{canEdit && order.status === "en_proceso" && <button className="button button--small button--danger-ghost" onClick={() => void cancelOrder(order)}>Eliminar</button>}</div></td></tr>)}
      </tbody></table></div></div>}
      {selected && <Modal title={`Pedido #${selected.id} · Mesa ${tableNumber(selected.table_id)}`} onClose={() => setSelected(null)}>
        {detailLoading ? <Loading /> : <div className="stack-md">
          <div className="inline-between"><span>Estado</span><StatusBadge status={selected.status} /></div>
          <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th><th /></tr></thead><tbody>
            {items.map((item) => <tr key={item.id}><td>{menuName(item.menu_item_id)}</td><td>{item.quantity}</td><td>{formatCurrency(item.unit_price)}</td><td>{formatCurrency(Number(item.unit_price)*item.quantity)}</td><td>{canEdit && selected.status === "en_proceso" && <div className="table-actions"><button className="button button--small button--ghost" onClick={() => void changeItem(item)}>Editar</button><button className="button button--small button--danger-ghost" onClick={() => void removeItem(item)}>Quitar</button></div>}</td></tr>)}
          </tbody></table></div>
          {items.length === 0 && <p className="muted">Este pedido aún no tiene productos.</p>}
          {canEdit && selected.status === "en_proceso" && <form className="add-item-form" onSubmit={addItem}><label className="field"><span>Producto</span><select value={menuItemId} onChange={(event) => setMenuItemId(event.target.value)} required><option value="">Seleccionar producto</option>{menu.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatCurrency(item.price)}</option>)}</select></label><label className="field add-item-form__quantity"><span>Cantidad</span><input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label><button className="button button--primary" disabled={saving}>{saving ? "Agregando..." : "Agregar"}</button></form>}
          <div className="modal__actions"><button className="button button--ghost" onClick={() => setSelected(null)}>Cerrar</button></div>
        </div>}
      </Modal>}
    </div>
  );
}
