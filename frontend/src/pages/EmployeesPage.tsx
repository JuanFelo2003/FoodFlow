import { useCallback, useEffect, useState, type FormEvent } from "react";
import { employeesApi } from "../services/foodflowService";
import type { EmployeeRecord } from "../types/foodflow";
import type { EmployeeRole } from "../types/auth";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { roleLabel } from "../utils/format";

const roles: EmployeeRole[] = ["admin", "waiter", "cashier", "kitchen"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<EmployeeRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "waiter" as EmployeeRole });

  const load = useCallback(async () => {
    setLoading(true);
    try { setEmployees(await employeesApi.list()); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los empleados."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function startEdit(employee: EmployeeRecord) {
    try {
      const record = await employeesApi.get(employee.id);
      setSelected(record);
      setForm({ name: record.name, email: record.email, password: "", role: record.role });
      setOpen(true);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo consultar el empleado."); }
  }

  function startCreate() {
    setSelected(null);
    setForm({ name: "", email: "", password: "", role: "waiter" });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (selected) {
        const payload = { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) };
        await employeesApi.update(selected.id, payload);
        setNotice("Empleado actualizado correctamente.");
      } else {
        await employeesApi.create(form);
        setNotice("Empleado creado correctamente.");
      }
      setOpen(false);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el empleado."); }
    finally { setSaving(false); }
  }

  async function toggleActive(employee: EmployeeRecord) {
    const confirmed = window.confirm(`${employee.active ? "¿Desactivar" : "¿Activar"} a ${employee.name}?`);
    if (!confirmed) return;
    try {
      await employeesApi.setActive(employee.id, !employee.active);
      setNotice("Estado del empleado actualizado.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado."); }
  }

  return (
    <div className="stack-lg">
      <div className="page-intro"><div><span className="eyebrow">ADMINISTRACIÓN</span><h2>Equipo de trabajo</h2><p>Administra las cuentas, los roles y el acceso del personal.</p></div><button className="button button--primary" onClick={startCreate}>＋ Nuevo empleado</button></div>
      <Feedback message={error} /><Feedback message={notice} tone="success" />
      {loading ? <Loading /> : employees.length === 0 ? <EmptyState title="No hay empleados" description="Crea el primer usuario del equipo." /> : (
        <div className="panel"><div className="table-wrap"><table><thead><tr><th>Empleado</th><th>Correo</th><th>Rol</th><th>Estado</th><th className="align-right">Acciones</th></tr></thead><tbody>
          {employees.map((employee) => <tr key={employee.id}>
            <td><div className="person-cell"><span className="person-avatar">{employee.name.slice(0,1).toUpperCase()}</span><span className="cell-strong">{employee.name}</span></div></td>
            <td>{employee.email}</td><td>{roleLabel(employee.role)}</td><td><span className={`status-badge ${employee.active ? "status-badge--available" : "status-badge--inactive"}`}>{employee.active ? "Activo" : "Inactivo"}</span></td>
            <td><div className="table-actions"><button className="button button--small button--ghost" onClick={() => void startEdit(employee)}>Editar</button><button className="button button--small button--outline" onClick={() => void toggleActive(employee)}>{employee.active ? "Desactivar" : "Activar"}</button></div></td>
          </tr>)}
        </tbody></table></div></div>
      )}
      {open && <Modal title={selected ? "Editar empleado" : "Nuevo empleado"} onClose={() => setOpen(false)}>
        <form className="form-stack" onSubmit={submit}>
          <label className="field"><span>Nombre completo</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={100} required /></label>
          <label className="field"><span>Correo electrónico</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={150} required /></label>
          <label className="field"><span>{selected ? "Nueva contraseña (opcional)" : "Contraseña"}</span><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!selected} autoComplete="new-password" /></label>
          <label className="field"><span>Rol</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as EmployeeRole })}>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
          <div className="modal__actions"><button type="button" className="button button--ghost" onClick={() => setOpen(false)}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? "Guardando..." : "Guardar empleado"}</button></div>
        </form>
      </Modal>}
    </div>
  );
}
