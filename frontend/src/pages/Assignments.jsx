import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Assigned", "Confirmed", "Checked In", "Completed", "No Show", "Cancelled"];

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/assignments/${id}`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update assignment");
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove assignment");
    }
  };

  const filtered = assignments.filter((a) => !statusFilter || a.status === statusFilter);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Assignments</h1>
          <p className="view-subtitle">
            {assignments.length} crew-to-flight assignments · manage per-flight assignment from the flight
            detail page
          </p>
        </div>
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
        <div className="loading-row">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No assignments match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Flight</th>
                <th>Crew member</th>
                <th>Duty role</th>
                <th>Departure</th>
                <th>Status</th>
                {user?.role !== "viewer" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a._id}>
                  <td className="mono">
                    {a.flight ? <Link to={`/flights/${a.flight._id}`}>{a.flight.flightNumber}</Link> : "—"}
                  </td>
                  <td>{a.crew?.name || "—"}</td>
                  <td>{a.dutyRole}</td>
                  <td>{a.flight ? new Date(a.flight.departureTime).toLocaleString() : "—"}</td>
                  <td>
                    {user?.role !== "viewer" ? (
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a._id, e.target.value)}
                        style={{
                          background: "var(--panel)",
                          border: "1px solid var(--border)",
                          borderRadius: 3,
                          padding: "4px 8px",
                          fontSize: 12.5,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={a.status} />
                    )}
                  </td>
                  {user?.role !== "viewer" && (
                    <td>
                      <button className="btn btn-ghost" onClick={() => handleRemove(a._id)}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assignments;
