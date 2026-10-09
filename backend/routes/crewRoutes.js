import express from "express";
import {
  getCrewMembers,
  getCrewMember,
  createCrewMember,
  updateCrewMember,
  deleteCrewMember,
  getAvailableCrew,
} from "../controllers/crewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/available", getAvailableCrew);
router.route("/").get(getCrewMembers).post(authorize("admin", "scheduler"), createCrewMember);
router
  .route("/:id")
  .get(getCrewMember)
  .put(authorize("admin", "scheduler"), updateCrewMember)
  .delete(authorize("admin"), deleteCrewMember);

export default router;
