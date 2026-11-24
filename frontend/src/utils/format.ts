export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    waiter: "Mesero",
    cashier: "Cajero",
    kitchen: "Cocina",
  };
  return labels[role] ?? role;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    disponible: "Disponible",
    ocupada: "Ocupada",
    en_atencion: "En atención",
    en_proceso: "En preparación",
    servida: "Servido",
    pagada: "Pagado",
    registrado: "Registrado",
    anulado: "Anulado",
  };
  return labels[status] ?? status;
}
