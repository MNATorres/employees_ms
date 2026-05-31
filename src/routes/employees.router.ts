import { Router } from "express";
import {
  getAllEmployeesController,
  findByGender,
  generateReport,
  getReportById,
} from "../controllers/employees.controller.js";

export const employeesRouter = Router();

employeesRouter.get("/", getAllEmployeesController);
employeesRouter.post("/by-gender", findByGender);
employeesRouter.get("/report", generateReport);
employeesRouter.get("/report/:id", getReportById);
