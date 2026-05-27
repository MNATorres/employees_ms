import amqp from "amqplib";
import { dbPool } from "./database.js"; // Importamos tu conexión a la DB de empleados

const QUEUE_NAME = "departments_events";

export async function listenToDepartmentsQueue() {
  try {
    // Conectamos al RabbitMQ local de Docker
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();

    // Aseguramos que la cola exista antes de escuchar
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(
      "🐇 [Subscriber] Listening permanently to RabbitMQ queue:",
      QUEUE_NAME,
    );

    // Empezamos a consumir los mensajes
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          // Parseamos el string que venía en el Buffer a un objeto JS
          const content = JSON.parse(msg.content.toString());
          console.log("📩 Event received from queue:", content.event);

          if (content.event === "DEPARTMENT_CREATED") {
            const { dept_no, dept_name } = content.data;

            // Insertamos en tu tabla departments_cache.
            // Usamos ON DUPLICATE KEY UPDATE por si el depto ya existe, para que actualice el nombre.
            const query = `
              INSERT INTO departments_cache (dept_no, dept_name) 
              VALUES (?, ?) 
              ON DUPLICATE KEY UPDATE dept_name = ?
            `;

            await dbPool.execute(query, [dept_no, dept_name, dept_name]);
            console.log(`💾 Cache updated in DB: ${dept_no} -> ${dept_name}`);
          }

          // IMPORTANTE: Le avisamos a RabbitMQ que procesamos el mensaje con éxito (Acknowledge)
          // Así RabbitMQ lo borra de la cola de forma segura.
          channel.ack(msg);
        } catch (dbError) {
          console.error("❌ Error processing message in database:", dbError);
          // Si falló la DB, no hacemos ack para que el mensaje no se pierda y se reencole
        }
      }
    });
  } catch (error) {
    console.error("❌ Subscriber failed to connect to RabbitMQ:", error);
  }
}
