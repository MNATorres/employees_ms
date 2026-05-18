import { dbPool } from "../config/database.js";

const getAllEmployees = async () => {
  const result = await dbPool.query("SELECT * FROM employees");

  return result;
};

export { getAllEmployees };
