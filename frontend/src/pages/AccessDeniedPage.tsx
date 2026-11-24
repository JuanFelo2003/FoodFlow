import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
  return (
    <main className="center-page">
      <div className="center-card">
        <span className="center-card__code">403</span>
        <h1>Acceso denegado</h1>
        <p>Tu rol no tiene permisos para acceder a esta sección.</p>
        <Link className="button button--primary" to="/dashboard">
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
