import amqp from "amqplib";

// Declaramos el nombre de la cola exclusiva para reportes
const QUEUE_NAME = "reports_queue";

export async function publishToReportsQueue(data: any): Promise<void> {
  try {
    // 1. Abrimos conexión y canal dedicado temporal
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    const channel = await connection.createChannel();

    // 2. Nos aseguramos de que la cola exista antes de tirar el mensaje
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 3. Enviamos la data (id del reporte y lista de empleados) convertida a Buffer
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
      persistent: true, // El mensaje sobrevive a reinicios de RabbitMQ
    });

    console.log(
      `🐇 [Publisher] Event sent successfully to ${QUEUE_NAME} for Report ID: ${data.reportId}`,
    );

    // 4. PERFORMANCE CRUCIAL: Cerramos canal y socket al terminar la ráfaga
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("❌ Publisher failed to send message to RabbitMQ:", error);
    throw error;
  }
}
