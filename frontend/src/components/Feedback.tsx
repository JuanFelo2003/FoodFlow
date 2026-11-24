interface FeedbackProps {
  message: string;
  tone?: "error" | "success" | "info";
}

export function Feedback({ message, tone = "error" }: FeedbackProps) {
  if (!message) return null;
  return <div className={`feedback feedback--${tone}`} role={tone === "error" ? "alert" : "status"}>{message}</div>;
}

export function Loading({ label = "Cargando..." }: { label?: string }) {
  return <div className="loading"><span className="spinner" />{label}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-state__icon">⌁</span><h3>{title}</h3><p>{description}</p></div>;
}
