import mongoose from "mongoose";

const crewSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Captain", "First Officer", "Purser", "Flight Attendant", "Engineer"],
      required: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    baseAirport: { type: String, required: true, uppercase: true, trim: true, minlength: 3, maxlength: 4 },
    licenseNumber: { type: String, trim: true },
    certifications: [{ type: String, trim: true }],
    // aircraft types this crew member is qualified/type-rated on
    qualifiedAircraft: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["Active", "On Leave", "Training", "Suspended", "Inactive"],
      default: "Active",
    },
    seniority: { type: Number, default: 0 }, // years of service
    // duty-time tracking, relevant to flight crew scheduling / rest rules
    totalFlightHours: { type: Number, default: 0 },
    lastFlightDate: { type: Date },
    restUntil: { type: Date }, // crew unavailable for assignment before this datetime
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

crewSchema.index({ name: "text", employeeId: "text" });

export default mongoose.model("Crew", crewSchema);
