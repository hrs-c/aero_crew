import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Scheduled", "Boarding", "Departed", "In Air", "Landed", "Cancelled", "Delayed"];

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

const emptyForm = {
  flightNumber: "",
  aircraftType: "",
  tailNumber: "",
  departureAirport: "",
  arrivalAirport: "",
  departureTime: "",
  arrivalTime: "",
  status: "Scheduled",
};

const Flights = () => {
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flights");
      setFlights(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load flights");
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

  const openEdit = (f) => {
    setEditingId(f._id);
    setForm({
      flightNumber: f.flightNumber,
      aircraftType: f.aircraftType,
      tailNumber: f.tailNumber || "",
      departureAirport: f.departureAirport,
      arrivalAirport: f.arrivalAirport,
      departureTime: toLocalInput(f.departureTime),
      arrivalTime: toLocalInput(f.arrivalTime),
      status: f.status,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/flights/${editingId}`, form);
      } else {
        await api.post("/flights", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save flight");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/flights/${deleteTarget._id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete flight");
    }
  };

  const filtered = flights.filter((f) => !statusFilter || f.status === statusFilter);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Flights</h1>
          <p className="view-subtitle">{flights.length} flights in the schedule</p>
        </div>
        {user?.role !== "viewer" && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Schedule flight
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-row">Loading flights...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No flights match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Aircraft</th>
                <th>Status</th>
                {user?.role !== "viewer" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f._id}>
                  <td className="mono">
                    <Link to={`/flights/${f._id}`}>{f.flightNumber}</Link>
                  </td>
                  <td className="mono">
                    {f.departureAirport} → {f.arrivalAirport}
                  </td>
                  <td>{new Date(f.departureTime).toLocaleString()}</td>
                  <td>{new Date(f.arrivalTime).toLocaleString()}</td>
                  <td>{f.aircraftType}</td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                  {user?.role !== "viewer" && (
                    <td>
                      <button className="btn btn-ghost" onClick={() => openEdit(f)}>
                        Edit
                      </button>
                      <button className="btn btn-ghost" onClick={() => setDeleteTarget(f)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete flight</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                ×
              </button>
            </div>

            <p>
              Are you sure you want to delete <strong>{deleteTarget.flightNumber}</strong>? This will also
              remove its crew assignments.
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
              <h2>{editingId ? "Edit flight" : "Schedule flight"}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Flight number</label>
                  <input
                    value={form.flightNumber}
                    onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Aircraft type</label>
                  <input
                    value={form.aircraftType}
                    onChange={(e) => setForm({ ...form, aircraftType: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Tail number</label>
                  <input
                    value={form.tailNumber}
                    onChange={(e) => setForm({ ...form, tailNumber: e.target.value.toUpperCase() })}
                  />
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
                  <label>Departure airport (IATA)</label>
                  <input
                    value={form.departureAirport}
                    onChange={(e) => setForm({ ...form, departureAirport: e.target.value.toUpperCase() })}
                    maxLength={4}
                    required
                  />
                </div>
                <div className="field">
                  <label>Arrival airport (IATA)</label>
                  <input
                    value={form.arrivalAirport}
                    onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value.toUpperCase() })}
                    maxLength={4}
                    required
                  />
                </div>
                <div className="field">
                  <label>Departure time</label>
                  <input
                    type="datetime-local"
                    value={form.departureTime}
                    onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Arrival time</label>
                  <input
                    type="datetime-local"
                    value={form.arrivalTime}
                    onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save changes" : "Schedule flight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flights;
