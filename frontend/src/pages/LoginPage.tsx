import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Feedback } from "../components/Feedback";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch (cause) {
      setEmail("");
      setPassword("");
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-aside">
        <div className="brand brand--light"><span className="brand__mark">F</span><span>foodflow</span></div>
        <div className="login-aside__copy"><span className="eyebrow">GESTIÓN INTELIGENTE</span><h1>Todo el restaurante, en un solo lugar.</h1><p>Coordina el servicio, organiza los pedidos y mantén cada operación bajo control.</p></div>
        <div className="login-aside__foot">FOODFLOW · RESTAURANT OPERATIONS</div>
      </section>
      <section className="login-main">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card__mark">F</div>
          <span className="eyebrow">BIENVENIDO DE NUEVO</span>
          <h2>Iniciar sesión</h2>
          <p className="muted">Ingresa tus credenciales para continuar.</p>
          <Feedback message={error} />
          <label className="field"><span>Correo electrónico</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@restaurante.com" required /></label>
          <label className="field"><span>Contraseña</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" required /></label>
          <button className="button button--primary button--full" type="submit" disabled={loading}>{loading ? "Validando acceso..." : "Ingresar al sistema"} <span>→</span></button>
          <span className="login-card__foot">Acceso exclusivo para personal autorizado.</span>
        </form>
      </section>
    </main>
  );
}
