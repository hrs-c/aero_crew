import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const Dashboard = () => {
  const [crew, setCrew] = useState([]);
  const [flights, setFlights] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [crewRes, flightsRes, assignmentsRes] = await Promise.all([
          api.get("/crew"),
          api.get("/flights"),
          api.get("/assignments"),
        ]);
        setCrew(crewRes.data);
        setFlights(flightsRes.data);
        setAssignments(assignmentsRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-row">Loading operations data...</div>;

  const activeCrew = crew.filter((c) => c.status === "Active").length;
  const upcomingFlights = flights.filter(
    (f) => new Date(f.departureTime) > new Date() && f.status !== "Cancelled"
  );
  const unassignedFlights = upcomingFlights.filter(
    (f) => !assignments.some((a) => a.flight?._id === f._id)
  );

  const nextFlights = [...upcomingFlights]
    .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
    .slice(0, 6);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Operations Overview</h1>
          <p className="view-subtitle">Live snapshot of crew and flight status</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-value">{activeCrew}</div>
          <div className="stat-label">Active crew members</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{crew.length}</div>
          <div className="stat-label">Total roster size</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{upcomingFlights.length}</div>
          <div className="stat-label">Upcoming flights</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: unassignedFlights.length ? "var(--bad)" : "var(--good)" }}>
            {unassignedFlights.length}
          </div>
          <div className="stat-label">Flights with no crew assigned</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>Next departures</h2>
          <Link to="/flights" className="btn btn-ghost">
            View all flights
          </Link>
        </div>

        {nextFlights.length === 0 ? (
          <div className="empty-state">No upcoming flights scheduled.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Aircraft</th>
                  <th>Crew assigned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {nextFlights.map((f) => {
                  const count = assignments.filter((a) => a.flight?._id === f._id).length;
                  return (
                    <tr key={f._id}>
                      <td className="mono">{f.flightNumber}</td>
                      <td className="mono">
                        {f.departureAirport} → {f.arrivalAirport}
                      </td>
                      <td>{new Date(f.departureTime).toLocaleString()}</td>
                      <td>{f.aircraftType}</td>
                      <td>{count}</td>
                      <td>
                        <StatusBadge status={f.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
