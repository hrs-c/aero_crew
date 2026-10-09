import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@aerocrew.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("scheduler");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-name">AeroCrew</div>
            <div className="brand-sub">CREW OPS</div>
          </div>
        </div>

        <h1 className="auth-title">{mode === "login" ? "Sign in" : "Create an account"}</h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Access the crew scheduling dashboard."
            : "Set up scheduler access for your operation."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="field">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Account type</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="scheduler">Scheduler</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Need an account?{" "}
              <button onClick={() => setMode("register")}>Register</button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button onClick={() => setMode("login")}>Sign in</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;
