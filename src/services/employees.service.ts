import * as employeesRepo from "../respository/employees.repository.js";

const getAllEmployees = async () => {
  const repositoryData = await employeesRepo.getAllEmployees();

  return {
    message: "Respuesta generada desde el servicio de empleados",
    data: repositoryData,
  };
};

export { getAllEmployees };
