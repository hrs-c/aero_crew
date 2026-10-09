import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, trim: true, uppercase: true },
    aircraftType: { type: String, required: true, trim: true },
    tailNumber: { type: String, trim: true, uppercase: true },
    departureAirport: { type: String, required: true, uppercase: true, trim: true, minlength: 3, maxlength: 4 },
    arrivalAirport: { type: String, required: true, uppercase: true, trim: true, minlength: 3, maxlength: 4 },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "Boarding", "Departed", "In Air", "Landed", "Cancelled", "Delayed"],
      default: "Scheduled",
    },
    requiredCrew: {
      captains: { type: Number, default: 1 },
      firstOfficers: { type: Number, default: 1 },
      flightAttendants: { type: Number, default: 4 },
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

flightSchema.index({ flightNumber: 1, departureTime: 1 });

export default mongoose.model("Flight", flightSchema);
