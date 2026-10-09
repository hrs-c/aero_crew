import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const DUTY_ROLES = ["Captain", "First Officer", "Purser", "Flight Attendant", "Engineer"];

const FlightDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [availableCrew, setAvailableCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignForm, setAssignForm] = useState({ crew: "", dutyRole: "Flight Attendant" });
  const [assignError, setAssignError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [flightRes, crewRes] = await Promise.all([
        api.get(`/flights/${id}`),
        api.get(`/crew/available?flightId=${id}`),
      ]);
      setFlight(flightRes.data.flight);
      setAssignments(flightRes.data.assignments);
      setAvailableCrew(crewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load flight");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError("");
    if (!assignForm.crew) {
      setAssignError("Choose a crew member");
      return;
    }
    try {
      await api.post("/assignments", { flight: id, ...assignForm });
      setAssignForm({ crew: "", dutyRole: "Flight Attendant" });
      load();
    } catch (err) {
      setAssignError(err.response?.data?.message || "Could not create assignment");
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!confirm("Remove this crew assignment?")) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove assignment");
    }
  };

  if (loading) return <div className="loading-row">Loading flight...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!flight) return null;

  const assignedCrewIds = new Set(assignments.map((a) => a.crew?._id));
  const selectableCrew = availableCrew.filter((c) => !assignedCrewIds.has(c._id));

  return (
    <div>
      <div className="view-header">
        <div>
          <Link to="/flights" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            ← All flights
          </Link>
          <h1 className="view-title mono" style={{ marginTop: 6 }}>
            {flight.flightNumber}
          </h1>
          <p className="view-subtitle mono">
            {flight.departureAirport} → {flight.arrivalAirport} · {flight.aircraftType}
          </p>
        </div>
        <StatusBadge status={flight.status} />
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ fontSize: 16 }}>
            {new Date(flight.departureTime).toLocaleString()}
          </div>
          <div className="stat-label">Departure</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ fontSize: 16 }}>
            {new Date(flight.arrivalTime).toLocaleString()}
          </div>
          <div className="stat-label">Arrival</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{assignments.length}</div>
          <div className="stat-label">Crew assigned</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 15 }}>Assigned crew</h2>

        {assignments.length === 0 ? (
          <div className="empty-state">No crew assigned to this flight yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Duty role</th>
                  <th>Base</th>
                  <th>Status</th>
                  {user?.role !== "viewer" && <th></th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.crew?.name}</td>
                    <td>{a.dutyRole}</td>
                    <td className="mono">{a.crew?.baseAirport}</td>
                    <td>
                      <StatusBadge status={a.status} />
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

      {user?.role !== "viewer" && (
        <div className="panel">
          <h2 style={{ margin: "0 0 14px", fontSize: 15 }}>Assign crew member</h2>
        {assignError && <div className="alert alert-error">{assignError}</div>}
        <form onSubmit={handleAssign} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ minWidth: 220, marginBottom: 0 }}>
            <label>Crew member (available only)</label>
            <select
              value={assignForm.crew}
              onChange={(e) => setAssignForm({ ...assignForm, crew: e.target.value })}
            >
              <option value="">Select crew member...</option>
              {selectableCrew.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.role} ({c.baseAirport})
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 180, marginBottom: 0 }}>
            <label>Duty role for this flight</label>
            <select
              value={assignForm.dutyRole}
              onChange={(e) => setAssignForm({ ...assignForm, dutyRole: e.target.value })}
            >
              {DUTY_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Assign
          </button>
        </form>
      </div>
      )}
    </div>
  );
};

export default FlightDetail;
