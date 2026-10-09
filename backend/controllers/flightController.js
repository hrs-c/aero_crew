import Flight from "../models/Flight.js";
import Assignment from "../models/Assignment.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getFlights = asyncHandler(async (req, res) => {
  const { status, departureAirport, arrivalAirport, from, to } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (departureAirport) filter.departureAirport = departureAirport.toUpperCase();
  if (arrivalAirport) filter.arrivalAirport = arrivalAirport.toUpperCase();
  if (from || to) {
    filter.departureTime = {};
    if (from) filter.departureTime.$gte = new Date(from);
    if (to) filter.departureTime.$lte = new Date(to);
  }

  const flights = await Flight.find(filter).sort({ departureTime: 1 });
  res.json(flights);
});

export const getFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ message: "Flight not found" });

  const assignments = await Assignment.find({ flight: flight._id }).populate("crew");
  res.json({ flight, assignments });
});

export const createFlight = asyncHandler(async (req, res) => {
  if (new Date(req.body.arrivalTime) <= new Date(req.body.departureTime)) {
    return res.status(400).json({ message: "Arrival time must be after departure time" });
  }
  const flight = await Flight.create(req.body);
  res.status(201).json(flight);
});

export const updateFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!flight) return res.status(404).json({ message: "Flight not found" });
  res.json(flight);
});

export const deleteFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndDelete(req.params.id);
  if (!flight) return res.status(404).json({ message: "Flight not found" });
  await Assignment.deleteMany({ flight: flight._id });
  res.json({ message: "Flight removed" });
});
