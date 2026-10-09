import Assignment from "../models/Assignment.js";
import Flight from "../models/Flight.js";
import Crew from "../models/Crew.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const REST_HOURS_AFTER_FLIGHT = 10;

export const getAssignments = asyncHandler(async (req, res) => {
  const { flight, crew, status } = req.query;
  const filter = {};
  if (flight) filter.flight = flight;
  if (crew) filter.crew = crew;
  if (status) filter.status = status;

  const assignments = await Assignment.find(filter)
    .populate("flight")
    .populate("crew")
    .sort({ createdAt: -1 });
  res.json(assignments);
});

// core scheduling logic: reject an assignment if the crew member
// is already booked on an overlapping flight, or is still on required rest
export const createAssignment = asyncHandler(async (req, res) => {
  const { flight: flightId, crew: crewId, dutyRole } = req.body;

  const [flight, crewMember] = await Promise.all([
    Flight.findById(flightId),
    Crew.findById(crewId),
  ]);

  if (!flight) return res.status(404).json({ message: "Flight not found" });
  if (!crewMember) return res.status(404).json({ message: "Crew member not found" });

  if (crewMember.status !== "Active") {
    return res.status(409).json({
      message: `${crewMember.name} is not active (status: ${crewMember.status}) and cannot be assigned`,
    });
  }

  if (crewMember.restUntil && new Date(crewMember.restUntil) > new Date(flight.departureTime)) {
    return res.status(409).json({
      message: `${crewMember.name} is on required rest until ${new Date(
        crewMember.restUntil
      ).toLocaleString()}`,
    });
  }

  // find this crew member's other active assignments and check for time overlap
  const existingAssignments = await Assignment.find({
    crew: crewId,
    status: { $nin: ["Cancelled", "No Show"] },
  }).populate("flight");

  const newStart = new Date(flight.departureTime).getTime();
  const newEnd = new Date(flight.arrivalTime).getTime();

  for (const existing of existingAssignments) {
    if (!existing.flight) continue;
    const existingStart = new Date(existing.flight.departureTime).getTime();
    const existingEnd = new Date(existing.flight.arrivalTime).getTime();
    const restBufferMs = REST_HOURS_AFTER_FLIGHT * 60 * 60 * 1000;

    const overlaps =
      newStart < existingEnd + restBufferMs && existingStart < newEnd + restBufferMs;

    if (overlaps) {
      return res.status(409).json({
        message: `${crewMember.name} conflicts with flight ${existing.flight.flightNumber} (needs ${REST_HOURS_AFTER_FLIGHT}h rest between duties)`,
      });
    }
  }

  const assignment = await Assignment.create({
    flight: flightId,
    crew: crewId,
    dutyRole,
    assignedBy: req.user?._id,
  });

  const populated = await assignment.populate(["flight", "crew"]);
  res.status(201).json(populated);
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate(["flight", "crew"]);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  res.json(assignment);
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  res.json({ message: "Assignment removed" });
});
