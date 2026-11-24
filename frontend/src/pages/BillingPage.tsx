import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { accountsApi, ordersApi, paymentsApi, tablesApi } from "../services/foodflowService";
import type { Account, Order, Payment, RestaurantTable, PaymentMethod } from "../types/foodflow";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency } from "../utils/format";

function isNotFound(error: unknown): boolean {
  return error instanceof Error && /no existe|no tiene una cuenta|no tiene un pago|404/i.test(error.message);
}

export default function BillingPage() {
  const { employee } = useAuth();
  const canManageAccount = employee?.role === "admin" || employee?.role === "waiter";
  const canPay = employee?.role === "admin" || employee?.role === "cashier";
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ discount: "0", taxName: "IVA", tax: "0", tip: "0" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [cashReceived, setCashReceived] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [servedOrders, tableList] = await Promise.all([
        ordersApi.byStatus("servida"),
        tablesApi.list(),
      ]);
      setOrders(servedOrders.sort((a,b) => b.id-a.id));
      setTables(tableList);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar las cuentas pendientes."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function openOrder(order: Order) {
    setSelected(order);
    setAccount(null);
    setPayment(null);
    setError("");
    try {
      const found = await accountsApi.byOrder(order.id);
      const fullAccount = await accountsApi.get(found.id);
      setAccount(fullAccount);
      try {
        const foundPayment = await paymentsApi.byAccount(fullAccount.id);
        setPayment(await paymentsApi.get(foundPayment.id));
      } catch (cause) {
        if (!isNotFound(cause)) throw cause;
      }
      setForm({
        discount: String(fullAccount.discount_percentage),
        taxName: fullAccount.tax_name ?? "",
        tax: String(fullAccount.tax_percentage),
        tip: String(fullAccount.tip_percentage),
      });
    } catch (cause) {
      if (!isNotFound(cause)) setError(cause instanceof Error ? cause.message : "No se pudo consultar la cuenta.");
    }
  }

  function accountPayload() {
    const taxPercentage = Number(form.tax);
    return {
      discount_percentage: Number(form.discount),
      tax_name: taxPercentage > 0 ? form.taxName.trim() : "N/A",
      tax_percentage: taxPercentage,
      tip_percentage: Number(form.tip),
    };
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      const payload = accountPayload();
      const result = account
        ? await accountsApi.update(account.id, payload)
        : await accountsApi.create({ order_id: selected.id, ...payload });
      setAccount(await accountsApi.get(result.id));
      setNotice(account ? "Cuenta actualizada." : "Cuenta generada.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la cuenta."); }
    finally { setBusy(false); }
  }

  async function registerPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    setBusy(true);
    try {
      const created = await paymentsApi.create({
        account_id: account.id,
        payment_method: paymentMethod,
        cash_received: paymentMethod === "efectivo" ? Number(cashReceived) : 0,
      });
      setPayment(await paymentsApi.get(created.id));
      setNotice("Pago registrado. La mesa quedó disponible.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo registrar el pago."); }
    finally { setBusy(false); }
  }

  async function voidPayment() {
    if (!payment || !window.confirm("¿Anular este pago? El pedido volverá al estado servido y la mesa quedará en atención.")) return;
    setBusy(true);
    try {
      const result = await paymentsApi.void(payment.id);
      setPayment(await paymentsApi.get(result.id));
      setNotice("Pago anulado correctamente.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo anular el pago."); }
    finally { setBusy(false); }
  }

  const tableNumber = (id: number) => tables.find((table) => table.id === id)?.number ?? id;

  return (
    <div className="stack-lg">
      <div className="page-intro"><div><span className="eyebrow">FACTURACIÓN</span><h2>Cuentas y pagos</h2><p>Genera cuentas para pedidos servidos y registra los pagos del servicio.</p></div></div>
      <Feedback message={error} /><Feedback message={notice} tone="success" />
      {loading ? <Loading /> : orders.length === 0 ? <EmptyState title="No hay pedidos pendientes de facturación" description="Cuando cocina marque un pedido como servido, aparecerá aquí." /> : <div className="panel"><div className="table-wrap"><table><thead><tr><th>Pedido</th><th>Mesa</th><th>Estado</th><th>Creado</th><th className="align-right">Acción</th></tr></thead><tbody>
        {orders.map((order) => <tr key={order.id}><td className="cell-strong">#{order.id}</td><td>Mesa {tableNumber(order.table_id)}</td><td><StatusBadge status={order.status} /></td><td>{new Date(order.created_at).toLocaleString("es-CO")}</td><td className="align-right"><button className="button button--small button--primary" onClick={() => void openOrder(order)}>Abrir cuenta</button></td></tr>)}
      </tbody></table></div></div>}
      {selected && <Modal title={`Facturación · Pedido #${selected.id}`} onClose={() => setSelected(null)}>
        <div className="stack-md">
          <div className="inline-between"><span>Mesa {tableNumber(selected.table_id)}</span><StatusBadge status={selected.status} /></div>
          {account ? <section className="account-summary">
            <div className="inline-between"><span>Subtotal</span><strong>{formatCurrency(account.subtotal)}</strong></div>
            <div className="inline-between"><span>Descuento ({account.discount_percentage}%)</span><strong>− {formatCurrency(account.discount_amount)}</strong></div>
            <div className="inline-between"><span>{account.tax_name || "Impuesto"} ({account.tax_percentage}%)</span><strong>{formatCurrency(account.tax_amount)}</strong></div>
            <div className="inline-between"><span>Propina ({account.tip_percentage}%)</span><strong>{formatCurrency(account.tip_amount)}</strong></div>
            <div className="account-total"><span>Total</span><strong>{formatCurrency(account.total)}</strong></div>
          </section> : <p className="muted">Este pedido todavía no tiene una cuenta generada.</p>}
          {canManageAccount && !payment && <form className="form-stack" onSubmit={saveAccount}>
            <h3>{account ? "Ajustar cuenta" : "Generar cuenta"}</h3>
            <div className="form-grid form-grid--three">
              <label className="field"><span>Descuento (%)</span><input type="number" min="0" max="100" step="0.01" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} required /></label>
              <label className="field"><span>Impuesto (%)</span><input type="number" min="0" max="100" step="0.01" value={form.tax} onChange={(event) => setForm({ ...form, tax: event.target.value })} required /></label>
              <label className="field"><span>Propina (%)</span><input type="number" min="0" max="100" step="0.01" value={form.tip} onChange={(event) => setForm({ ...form, tip: event.target.value })} required /></label>
            </div>
            {Number(form.tax) > 0 && <label className="field"><span>Nombre del impuesto</span><input value={form.taxName} onChange={(event) => setForm({ ...form, taxName: event.target.value })} required /></label>}
            <button className="button button--primary" disabled={busy}>{busy ? "Guardando..." : account ? "Actualizar cuenta" : "Generar cuenta"}</button>
          </form>}
          {payment ? <section className="payment-summary"><div className="inline-between"><h3>Pago #{payment.id}</h3><StatusBadge status={payment.status} /></div><p>Método: {payment.payment_method === "efectivo" ? "Efectivo" : "Tarjeta"}</p><p>Valor: <strong>{formatCurrency(payment.amount)}</strong></p>{payment.payment_method === "efectivo" && <p>Cambio: <strong>{formatCurrency(payment.change_amount)}</strong></p>}{payment.status === "registrado" && canPay && <button className="button button--danger button--full" onClick={() => void voidPayment()} disabled={busy}>{busy ? "Procesando..." : "Anular pago"}</button>}</section> : account && canPay && <form className="form-stack payment-form" onSubmit={registerPayment}>
            <h3>Registrar pago</h3>
            <label className="field"><span>Método de pago</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option></select></label>
            {paymentMethod === "efectivo" && <label className="field"><span>Efectivo recibido</span><input type="number" min={Number(account.total)} step="0.01" value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} required /></label>}
            <button className="button button--primary button--full" disabled={busy}>{busy ? "Registrando..." : `Registrar ${formatCurrency(account.total)}`}</button>
          </form>}
          <div className="modal__actions"><button className="button button--ghost" onClick={() => setSelected(null)}>Cerrar</button></div>
        </div>
      </Modal>}
    </div>
  );
}
