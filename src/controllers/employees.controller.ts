import type { Request, Response } from "express";
import * as employeesService from "../services/employees.service.js";

export const getAllEmployeesController = async (
  _req: Request,
  res: Response,
) => {
  const result = await employeesService.getAllEmployees();
  res.status(200).json(result);
};
