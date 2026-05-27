import "dotenv/config"; // Importante: Esto debe ir primero para cargar el .env
import express from "express";
import { testDatabaseConnection } from "./config/database.js";
import { ENV } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { listenToDepartmentsQueue } from "./config/queueConsumer.js";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("bienvenidos a employees api");
});

async function bootstrap() {
  try {
    await testDatabaseConnection();
    console.log("📁 Database connection successfully established.");

    await listenToDepartmentsQueue();

    // Aquí acoplaremos las rutas globales una vez que la DB esté lista
    app.use("/api", apiRouter);

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in production mode on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Critical failure during application bootstrap:", error);
    process.exit(1); // Cerramos el proceso si no se puede conectar la infraestructura
  }
}

// Ejecutamos el inicio de la app
bootstrap();
