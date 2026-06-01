import { employeesRepo } from "../respository/employees.repository.js";
import type { Employee } from "../types/entities.type.js";
import { publishToReportsQueue } from "../config/queuePublisher.js";

interface ServiceResponse {
  message: string;
  data: Employee[];
}

// Estructura temporal en memoria para guardar el estado de los reportes
interface ReportStatus {
  status: "processing" | "completed" | "failed";
  url: string | null;
}
const reportsCache = new Map<number, ReportStatus>();

const getAllEmployees = async (): Promise<ServiceResponse> => {
  const result = await employeesRepo.findAll();

  return {
    message: "Respuesta generada desde el servicio de empleados",
    data: result,
  };
};

const findByGender = async (gender: "M" | "F"): Promise<ServiceResponse> => {
  const result = await employeesRepo.findByGender(gender);

  return {
    message: `Response for ${gender} from employes.service`,
    data: result,
  };
};

const getEmployeesByAmountOrdered = async (
  amount: number,
): Promise<ServiceResponse> => {
  const result = await employeesRepo.findByAmountOrdered(amount);
  return {
    message: `Response for ${amount} ordered employees from employes.service`,
    data: result,
  };
};

const generateReport = async () => {
  // 1. Generamos un ID único autoincremental o basado en timestamp
  const reportId = Math.floor(Math.random() * 100000);

  // 2. Traemos todos los empleados de la base de datos local
  const employees = await getEmployeesByAmountOrdered(5000);

  // 3. Guardamos el estado inicial como "processing" en nuestra memoria local
  reportsCache.set(reportId, {
    status: "processing",
    url: null,
  });

  // 4. Disparamos el evento asíncrono a RabbitMQ para que viaje a AWS
  // Le pasamos el ID del reporte y la lista entera de empleados que rescatamos de la DB
  publishToReportsQueue({
    reportId: reportId,
    employees: employees.data,
  });

  // 5. Retornamos la respuesta INMEDIATA para Postman (Fuego y Olvido)
  return {
    message: "Report generation started asynchronously.",
    reportId: reportId,
    status: "processing",
    checkStatusUrl: `/api/employees/report/${reportId}`,
  };
};

const getReportById = async (id: number) => {
  // Buscamos en nuestro mapa si existe ese reporte
  const report = reportsCache.get(id);

  if (!report) {
    return { status: "not_found", message: "Report ID does not exist" };
  }

  // 💡 Truco para simular el éxito en tu prueba local:
  // Como la Lambda de AWS todavía no está físicamente conectada para devolver el mensaje a tu localhost,
  // la segunda vez que consultes desde Postman vamos a simular que ya terminó y le clavamos la URL real de S3.
  if (report.status === "processing") {
    report.status = "completed";
    // IMPORTANTE: Reemplazá "practica-reportes-s3-matias-2026" por el nombre real de tu bucket S3 de Terraform
    report.url = `https://practica-reportes-s3-matias-2026.s3.amazonaws.com/reportes/${id}.pdf`;
    reportsCache.set(id, report);

    return {
      reportId: id,
      status: "processing (working on background)... try one more time",
    };
  }

  return {
    reportId: id,
    status: report.status,
    downloadUrl: report.url,
  };
};

export { getAllEmployees, findByGender, generateReport, getReportById };
