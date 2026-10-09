import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
    crew: { type: mongoose.Schema.Types.ObjectId, ref: "Crew", required: true },
    dutyRole: {
      type: String,
      enum: ["Captain", "First Officer", "Purser", "Flight Attendant", "Engineer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "Confirmed", "Checked In", "Completed", "No Show", "Cancelled"],
      default: "Assigned",
    },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// a crew member can only hold one active assignment per flight
assignmentSchema.index({ flight: 1, crew: 1 }, { unique: true });

export default mongoose.model("Assignment", assignmentSchema);
