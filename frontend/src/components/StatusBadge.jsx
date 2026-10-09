const STATUS_MAP = {
  Active: "good",
  Confirmed: "good",
  Completed: "good",
  "Checked In": "good",
  Scheduled: "info",
  Assigned: "info",
  Boarding: "info",
  "In Air": "accent",
  Departed: "accent",
  Training: "accent",
  "On Leave": "neutral",
  Delayed: "bad",
  Cancelled: "bad",
  "No Show": "bad",
  Suspended: "bad",
  Inactive: "neutral",
  Landed: "neutral",
};

const StatusBadge = ({ status }) => {
  const variant = STATUS_MAP[status] || "neutral";
  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};

export default StatusBadge;
