import { Router } from "express";
import { getAllEmployeesController } from "../controllers/employees.controller.js";

export const employeesRouter = Router();

employeesRouter.get("/", getAllEmployeesController);
