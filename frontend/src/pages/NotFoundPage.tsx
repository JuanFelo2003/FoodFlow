import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="center-page">
      <div className="center-card">
        <span className="center-card__code">404</span>
        <h1>Página no encontrada</h1>
        <p>La dirección que buscas no existe.</p>
        <Link className="button button--primary" to="/dashboard">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
