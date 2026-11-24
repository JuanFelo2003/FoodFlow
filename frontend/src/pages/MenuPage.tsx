import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { menuApi } from "../services/foodflowService";
import type { MenuItem } from "../types/foodflow";
import { EmptyState, Feedback, Loading } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { formatCurrency } from "../utils/format";

export default function MenuPage() {
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    available: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(isAdmin ? await menuApi.list() : await menuApi.available());
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar el menú.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setSelected(null);
    setForm({ name: "", description: "", price: "", available: true });
    setOpen(true);
  }

  function openEdit(item: MenuItem) {
    setSelected(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      available: item.available,
    });
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        available: form.available,
      };
      if (selected) await menuApi.update(selected.id, payload);
      else await menuApi.create(payload);
      setOpen(false);
      setNotice(selected ? "Producto actualizado." : "Producto creado.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: MenuItem) {
    if (!window.confirm(`¿Eliminar "${item.name}" del menú?`)) return;
    try {
      await menuApi.remove(item.id);
      setNotice("Producto eliminado.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo eliminar el producto.",
      );
    }
  }

  async function upload(item: MenuItem, file?: File) {
    if (!file) return;
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("La imagen debe tener contenido y no superar los 5 MB.");
      return;
    }
    try {
      await menuApi.uploadImage(item.id, file);
      setNotice("Imagen actualizada.");
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar la imagen.",
      );
    }
  }

  return (
    <div className="stack-lg">
      <div className="page-intro">
        <div>
          <span className="eyebrow">CATÁLOGO</span>
          <h2>Menú del restaurante</h2>
          <p>
            {isAdmin
              ? "Administra los productos, precios, disponibilidad e imágenes."
              : "Consulta los productos disponibles para los pedidos."}
          </p>
        </div>
        {isAdmin && (
          <button className="button button--primary" onClick={openCreate}>
            ＋ Nuevo producto
          </button>
        )}
      </div>
      <Feedback message={error} />
      <Feedback message={notice} tone="success" />
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          title="El menú está vacío"
          description="Cuando haya productos disponibles aparecerán aquí."
        />
      ) : (
        <div className="product-grid">
          {items.map((item) => (
            <article className="product-card" key={item.id}>
              <div className="product-card__image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <span>FF</span>
                )}
                {isAdmin && (
                  <span
                    className={`availability-dot ${item.available ? "is-available" : ""}`}
                  />
                )}
              </div>
              <div className="product-card__body">
                <div className="product-card__title">
                  <h3>{item.name}</h3>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>
                <p>{item.description || "Sin descripción."}</p>
                {isAdmin && (
                  <div className="product-card__actions">
                    <button
                      className="button button--small button--ghost"
                      onClick={() => openEdit(item)}
                    >
                      Editar
                    </button>
                    <label className="button button--small button--ghost file-button">
                      Imagen
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                          void upload(item, event.target.files?.[0])
                        }
                      />
                    </label>
                    <button
                      className="button button--small button--danger-ghost"
                      onClick={() => void remove(item)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {open && (
        <Modal
          title={selected ? "Editar producto" : "Nuevo producto"}
          onClose={() => setOpen(false)}
        >
          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              <span>Nombre</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
                maxLength={100}
              />
            </label>
            <label className="field">
              <span>Descripción</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                rows={3}
              />
            </label>
            <label className="field">
              <span>Precio (COP)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
                required
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) =>
                  setForm({ ...form, available: event.target.checked })
                }
              />
              <span>Disponible para pedidos</span>
            </label>
            <div className="modal__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button className="button button--primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar producto"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
