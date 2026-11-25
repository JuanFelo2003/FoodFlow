import { statusLabel } from "../utils/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabel(status)}
    </span>
  );
}
