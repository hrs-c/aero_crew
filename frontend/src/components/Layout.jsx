import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/crew", label: "Crew Roster" },
  { to: "/flights", label: "Flights" },
  { to: "/assignments", label: "Assignments" },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-name">AeroCrew</div>
            <div className="brand-sub">CREW OPS</div>
          </div>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-view">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
