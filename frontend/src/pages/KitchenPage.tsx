import { useCallback, useEffect, useRef, useState } from "react";
import { menuApi, orderItemsApi, ordersApi, tablesApi } from "../services/foodflowService";
import type { MenuItem, Order, OrderItem, RestaurantTable } from "../types/foodflow";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../utils/format";

interface KitchenOrder {
  order: Order;
  items: OrderItem[];
}

const POLLING_INTERVAL = 5000;

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async (showLoader = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const activeOrders = await ordersApi.byStatus("en_proceso");
      const orderDetails = await Promise.all(activeOrders.map(async (order) => ({
        order,
        items: await orderItemsApi.list(order.id),
      })));
      setOrders(orderDetails.sort((a, b) => new Date(a.order.created_at).getTime() - new Date(b.order.created_at).getTime()));
      setLastUpdated(new Date());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron actualizar los pedidos.");
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const [menuItems, tableList] = await Promise.all([menuApi.list(), tablesApi.list()]);
        if (active) {
          setMenu(menuItems);
          setTables(tableList);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "No se pudo preparar el panel de cocina.");
      }
      if (active) await refresh(true);
    }
    void initialize();
    const intervalId = window.setInterval(() => {
      if (active) void refresh();
    }, POLLING_INTERVAL);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  async function markServed(order: Order, orderItems: OrderItem[]) {
    if (orderItems.length === 0) {
      setError(`El pedido #${order.id} no tiene productos y no se puede marcar como servido.`);
      return;
    }
    if (!window.confirm(`¿Confirmas que el pedido #${order.id} está servido?`)) return;
    try {
      await ordersApi.setStatus(order.id, "servida");
      await refresh(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el pedido.");
    }
  }

  const getName = (id: number) => menu.find((item) => item.id === id)?.name ?? `Producto ${id}`;
  const getTable = (id: number) => tables.find((table) => table.id === id)?.number ?? id;

  return (
    <div className="stack-lg">
      <section className="kitchen-toolbar">
        <div><span className="eyebrow">ESTACIÓN DE PREPARACIÓN</span><h2>Pedidos activos <span className="kitchen-count">{orders.length}</span></h2><p>La lista se actualiza automáticamente cada 5 segundos.</p></div>
        <div className="kitchen-toolbar__meta"><span className="live-indicator"><span /> Actualización automática</span><span className="muted">{lastUpdated ? `Última consulta: ${lastUpdated.toLocaleTimeString("es-CO")}` : "Esperando primera consulta"}</span><button className="button button--outline" onClick={() => void refresh(true)} disabled={refreshing}>{refreshing ? "Actualizando..." : "↻ Actualizar ahora"}</button></div>
      </section>
      <Feedback message={error} />
      {loading ? <Loading label="Consultando pedidos activos..." /> : orders.length === 0 ? <EmptyState title="Cocina al día" description="No hay pedidos pendientes de preparación. Los pedidos nuevos aparecerán automáticamente." /> : (
        <div className="kitchen-grid">{orders.map(({ order, items }) => <article className="kitchen-ticket" key={order.id}>
          <header className="kitchen-ticket__header"><div><span className="eyebrow">PEDIDO</span><strong>#{order.id}</strong></div><div className="kitchen-ticket__table">Mesa {getTable(order.table_id)}</div></header>
          <div className="kitchen-ticket__time">{formatDate(order.created_at)} <StatusBadge status={order.status} /></div>
          <div className="kitchen-ticket__items">{items.map((item) => <div className="kitchen-item" key={item.id}><span className="kitchen-item__quantity">{item.quantity}×</span><div><strong>{getName(item.menu_item_id)}</strong><small>Producto #{item.menu_item_id}</small></div></div>)}</div>
          <footer className="kitchen-ticket__footer"><span>{items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span><button className="button button--primary button--full" onClick={() => void markServed(order, items)}>Marcar como servido ✓</button></footer>
        </article>)}</div>
      )}
    </div>
  );
}
