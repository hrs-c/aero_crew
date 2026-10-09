import express from "express";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAssignments).post(authorize("admin", "scheduler"), createAssignment);
router
  .route("/:id")
  .put(authorize("admin", "scheduler"), updateAssignment)
  .delete(authorize("admin", "scheduler"), deleteAssignment);

export default router;
