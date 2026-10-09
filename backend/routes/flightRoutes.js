import express from "express";
import {
  getFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getFlights).post(authorize("admin", "scheduler"), createFlight);
router
  .route("/:id")
  .get(getFlight)
  .put(authorize("admin", "scheduler"), updateFlight)
  .delete(authorize("admin"), deleteFlight);

export default router;
