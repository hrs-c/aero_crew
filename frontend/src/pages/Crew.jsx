import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Captain", "First Officer", "Purser", "Flight Attendant", "Engineer"];
const STATUSES = ["Active", "On Leave", "Training", "Suspended", "Inactive"];

const emptyForm = {
  employeeId: "",
  name: "",
  role: "Flight Attendant",
  email: "",
  phone: "",
  baseAirport: "",
  licenseNumber: "",
  status: "Active",
  seniority: 0,
  totalFlightHours: 0,
};

const Crew = () => {
  const { user } = useAuth();
  const [crew, setCrew] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [crewRes, assignmentsRes] = await Promise.all([
        api.get("/crew"),
        api.get("/assignments"),
      ]);
      setCrew(crewRes.data);
      setAssignments(assignmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load crew roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditingId(member._id);
    setForm({
      employeeId: member.employeeId,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || "",
      baseAirport: member.baseAirport,
      licenseNumber: member.licenseNumber || "",
      status: member.status,
      seniority: member.seniority,
      totalFlightHours: member.totalFlightHours,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/crew/${editingId}`, form);
      } else {
        await api.post("/crew", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save crew member");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/crew/${deleteTarget._id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete crew member");
    }
  };

  const filtered = crew.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Crew Roster</h1>
          <p className="view-subtitle">{crew.length} crew members on file</p>
        </div>
        {user?.role !== "viewer" && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add crew member
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-row">Loading roster...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No crew members match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Base</th>
                <th>Assignment</th>
                <th>Status</th>
                <th>Flight hours</th>
                {user?.role !== "viewer" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const nextAssignment = assignments
                  .filter(
                    (a) =>
                      a.crew?._id === c._id &&
                      a.flight &&
                      !["Completed", "Cancelled", "No Show"].includes(a.status)
                  )
                  .sort((a, b) => new Date(a.flight.departureTime) - new Date(b.flight.departureTime))[0];

                return (
                  <tr key={c._id}>
                    <td className="mono">{c.employeeId}</td>
                    <td>{c.name}</td>
                    <td>{c.role}</td>
                    <td className="mono">{c.baseAirport}</td>
                    <td>
                      {nextAssignment ? (
                        <Link to={`/flights/${nextAssignment.flight._id}`} className="mono">
                          {nextAssignment.flight.flightNumber}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--good)" }}>Free</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="mono">{c.totalFlightHours.toLocaleString()}</td>
                    {user?.role !== "viewer" && (
                      <td>
                        <button className="btn btn-ghost" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button className="btn btn-ghost" onClick={() => setDeleteTarget(c)}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete crew member</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                ×
              </button>
            </div>

            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.employeeId})?
              This will remove them from the crew roster.
            </p>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit crew member" : "Add crew member"}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Employee ID</label>
                  <input
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label>Base airport (IATA)</label>
                  <input
                    value={form.baseAirport}
                    onChange={(e) => setForm({ ...form, baseAirport: e.target.value.toUpperCase() })}
                    maxLength={4}
                    required
                  />
                </div>
                <div className="field">
                  <label>License number</label>
                  <input
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Seniority (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seniority}
                    onChange={(e) => setForm({ ...form, seniority: Number(e.target.value) })}
                  />
                </div>
                <div className="field">
                  <label>Total flight hours</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalFlightHours}
                    onChange={(e) => setForm({ ...form, totalFlightHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save changes" : "Add crew member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crew;
