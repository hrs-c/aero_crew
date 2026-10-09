import Crew from "../models/Crew.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getCrewMembers = asyncHandler(async (req, res) => {
  const { search, role, status, baseAirport } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (baseAirport) filter.baseAirport = baseAirport.toUpperCase();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const crew = await Crew.find(filter).sort({ name: 1 });
  res.json(crew);
});

export const getCrewMember = asyncHandler(async (req, res) => {
  const crew = await Crew.findById(req.params.id);
  if (!crew) return res.status(404).json({ message: "Crew member not found" });
  res.json(crew);
});

export const createCrewMember = asyncHandler(async (req, res) => {
  const crew = await Crew.create(req.body);
  res.status(201).json(crew);
});

export const updateCrewMember = asyncHandler(async (req, res) => {
  const crew = await Crew.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!crew) return res.status(404).json({ message: "Crew member not found" });
  res.json(crew);
});

export const deleteCrewMember = asyncHandler(async (req, res) => {
  const crew = await Crew.findByIdAndDelete(req.params.id);
  if (!crew) return res.status(404).json({ message: "Crew member not found" });
  res.json({ message: "Crew member removed" });
});

import Assignment from "../models/Assignment.js";
import Flight from "../models/Flight.js";

// crew members who are not on leave/suspended, not currently resting, and don't have overlapping flights
export const getAvailableCrew = asyncHandler(async (req, res) => {
  const now = new Date();
  let crew = await Crew.find({
    status: "Active",
    $or: [{ restUntil: { $exists: false } }, { restUntil: null }, { restUntil: { $lte: now } }],
  }).sort({ name: 1 });

  const { flightId } = req.query;
  if (flightId) {
    const flight = await Flight.findById(flightId);
    if (flight) {
      const REST_HOURS_AFTER_FLIGHT = 10;
      const newStart = new Date(flight.departureTime).getTime();
      const newEnd = new Date(flight.arrivalTime).getTime();

      const activeAssignments = await Assignment.find({
        status: { $nin: ["Cancelled", "No Show"] },
      }).populate("flight");

      const busyCrewIds = new Set();
      for (const a of activeAssignments) {
        if (!a.flight || !a.crew) continue;
        const existingStart = new Date(a.flight.departureTime).getTime();
        const existingEnd = new Date(a.flight.arrivalTime).getTime();
        const restBufferMs = REST_HOURS_AFTER_FLIGHT * 60 * 60 * 1000;

        const overlaps = newStart < existingEnd + restBufferMs && existingStart < newEnd + restBufferMs;
        if (overlaps) {
          busyCrewIds.add(a.crew.toString());
        }
      }

      crew = crew.filter(c => !busyCrewIds.has(c._id.toString()));
    }
  }

  res.json(crew);
});
