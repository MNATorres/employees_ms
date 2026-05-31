import type { Request, Response } from "express";
import * as employeesService from "../services/employees.service.js";

export const getAllEmployeesController = async (
  _req: Request,
  res: Response,
) => {
  const result = await employeesService.getAllEmployees();
  res.status(200).json(result);
};

export const findByGender = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { gender } = req.body;

  if (gender !== "M" && gender !== "F") {
    res.status(400).json({ message: "Invalid gender. Must be 'M' or 'F'" });
    return;
  }

  const result = await employeesService.findByGender(gender);
  res.status(200).json(result);
};

export const generateReport = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const result = await employeesService.generateReport();
  res.status(200).json(result);
};

export const getReportById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const result = await employeesService.getReportById(Number(id));
  res.status(200).json(result);
};
