# 👥 Employees Microservice (employes_ms)

<p align="center">
  <img src="https://img.shields.io/badge/node.js-v20+-8CC84B?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/typescript-v6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/express-v5--beta-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/mysql2-v3+-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/rabbitmq-v3.x-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/zod-v4+-3068B2?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

---

## 📌 Overview

This repository is a production-grade, highly strict backend environment built with **Node.js**, **Express 5**, **TypeScript 6**, and **MySQL 8**. It serves as an architectural sandbox to master advanced TypeScript mechanics, runtime boundary safety, **SOLID** design principles, and asynchronous data synchronization using **RabbitMQ**.

### Core Objectives
*   **Zero `any` Policy:** Leverages `unknown`, Generics, and Type Predicates to handle dynamic data securely.
*   **Database Type Synchronization:** Implements a robust Data Access Layer using Advanced Generics (`<T>`) to guarantee compile-time safety on raw database queries.
*   **Decoupled Caching (New Feature):** Integrates with a RabbitMQ queue listener that consumes department events and updates a local cached departments table to achieve eventual consistency.
*   **Request & Input Hardening:** Secures the HTTP boundary by strongly typing Express payloads (`req.body`, `req.params`) and validating variables via schemas.
*   **SOLID & Clean Architecture:** Decouples the HTTP routing layer (Express), business logic (Services), and infrastructure layer (MySQL/Docker).

---

## 🔗 Connected Repositories

This microservice works in cooperation with other services in the ecosystem. Ensure you have them running locally for full feature testing:

*   **API Gateway:** [employees_api_gateway](https://github.com/MNATorres/employees_api_gateway.git)
*   **Departments Microservice:** [departments_ms](https://github.com/MNATorres/departments_ms.git)
*   **Employees Microservice (This repo):** [typescript-exercises](https://github.com/MNATorres/typescript-exercises.git)
*   **PDF Generator (AWS Lambda):** [pdf_generator_employees](https://github.com/MNATorres/pdf_generator_employees.git)
*   **Reports Infrastructure (Terraform):** [reports_infra_ms](https://github.com/MNATorres/reports_infra_ms.git)

---

## 🏗️ System Architecture & Message Flow

The architecture consists of several microservices cooperating over synchronous proxy requests, asynchronous RabbitMQ event streaming, and serverless PDF generation in the cloud.

```mermaid
graph TD
    Client[📱 Cliente / Postman] -->|HTTP Request| GW[🔀 API Gateway: Port 8081]
    
    %% Proxies
    GW -->|/api/departments/*| MS_Dept[🏢 Departments MS: Port 3001]
    GW -->|/api/employees/*| MS_Emp["👥 Employees MS: Port 3000<br>📍 YOU ARE HERE"]
    
    %% Pub/Sub
    MS_Dept -->|1. Publish: DEPARTMENT_CREATED| RMQ[🐇 RabbitMQ Broker: Port 5672]
    RMQ -->|2. Consume Event| MS_Emp
    MS_Emp -->|3. Update Cache Table| DB_Emp[(💾 Employees MySQL DB: Port 3306)]
    
    %% Reportes
    MS_Emp -->|4. Publish: reportId & employees| RMQ
    RMQ -.->|5. Trigger Lambda| Lambda[⚡ AWS Lambda: pdf_generator_employees]
    
    %% AWS Infra
    Infra[🏗️ Reports Infra: Terraform] -.->|Deploys| Lambda
    Infra -.->|Deploys| S3[🪣 AWS S3: practica-reportes-s3-matias-2026]
    Lambda -->|6. Upload PDF| S3

    classDef current fill:#ffcc00,stroke:#ff6600,stroke-width:4px,color:#000000;
    classDef gateway fill:#1f6feb,stroke:#58a6ff,stroke-width:2px,color:#ffffff;
    classDef service fill:#238636,stroke:#2ea043,stroke-width:1px,color:#ffffff;
    classDef broker fill:#d2691e,stroke:#ff8c00,stroke-width:2px,color:#ffffff;
    classDef aws fill:#e05c2b,stroke:#ff9900,stroke-width:2px,color:#ffffff;
    
    class MS_Emp current;
    class GW,MS_Dept service;
    class RMQ broker;
    class Lambda,S3,Infra aws;
```

---

## 🛠️ Tech Stack & Infrastructure

*   **Runtime & Framework:** Node.js, Express, TypeScript (Strict Mode).
*   **Database & Tools:** MySQL 8.0, phpMyAdmin (Database Management).
*   **Messaging Broker client:** `amqplib` (Node.js RabbitMQ client).
*   **Containerization:** Docker & Docker Compose for immutable environment replication.
*   **Development Utilities:** `tsx` (Watch mode/execution), `tsconfig` production-hardened flags.

---

## ⚙️ Hardened TypeScript Configuration

To simulate a real-world enterprise production environment, the compiler is configured with maximum strictness:
*   `strict: true` — Enables all strict type-checking options.
*   `noUncheckedIndexedAccess: true` — Forces explicit handling of potential `undefined` values when accessing arrays or lookup objects, eliminating the #1 runtime crash vector in production.
*   `exactOptionalPropertyTypes: true` — Strictly differentiates between a missing property and a property explicitly passed as `undefined`.

---

## 📁 Project Structure

```text
employes_ms/
├── src/
│   ├── config/
│   │   ├── database.ts        # MySQL connection pooling & lifecycle management
│   │   ├── env.ts             # Environment variables validation with Zod
│   │   └── queueConsumer.ts   # RabbitMQ event consumer listener (DEPARTMENT_CREATED)
│   ├── controllers/           # Strongly-typed Express controllers (HTTP layer)
│   ├── database/
│   │   └── repository.ts      # Advanced Generic Repositories (Data Access Layer)
│   ├── routes/                # API Route definitions mapping to controllers
│   ├── types/
│   │   └── entities.ts        # Core domain entities and data-transfer types
│   └── index.ts               # Application bootstrap entry-point
├── docker/                    # MySQL schema initialization files
├── docker-compose.yml         # MySQL and phpMyAdmin containers
├── package.json
└── tsconfig.json              # Production-ready compiler rules
```

---

## 🐇 RabbitMQ Queue Consumer (New Feature)

To maintain loose-coupling between the microservices, this service does not make synchronous calls to the Departments Microservice database. Instead, it maintains a read-only table called `departments_cache` and listens to real-time updates broadcast over **RabbitMQ**.

### Event Processing Flow:
1.  **Background Listener (`queueConsumer.ts`):** On startup, the service establishes a permanent connection to `amqp://guest:guest@localhost:5672` and asserts the queue `departments_events`.
2.  **Consuming Events:** When a new message arrives with the event name `DEPARTMENT_CREATED`, it parses the department data (`dept_no`, `dept_name`).
3.  **Local Database Synchronization:** It executes an upsert query to update `departments_cache` safely:
    ```sql
    INSERT INTO departments_cache (dept_no, dept_name) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE dept_name = ?
    ```
4.  **Message Acknowledgement (`ack`):** Upon successful database write, it sends a positive acknowledgement (`channel.ack(msg)`) to RabbitMQ. If the write fails, the message remains in the queue (or is re-queued) so no data is lost.

---

## 🚦 API Endpoints

All application routes are prefixed with `/api`.

### 🩺 Health Checks
*   **`GET /`**
    *   **Description:** Basic greeting check.
    *   **Response:** `200 OK`
*   **`GET /api/health`**
    *   **Description:** Active service health status.
    *   **Response:** `200 OK`

### 👥 Employees Management
*   **`GET /api/employees`**
    *   **Description:** Retrieves all registered employees.
    *   **Response:** `200 OK`
*   **`POST /api/employees/by-gender`**
    *   **Description:** Filter employees by gender.
    *   **Request Body:**
        ```json
        {
          "gender": "M" // or "F"
        }
        ```
    *   **Response:** `200 OK`

---

## 🚀 Getting Started & Local Testing

To test the microservices flow locally, **all three repositories and their respective databases/brokers must be running concurrently.**

### 1. Prerequisites
Ensure you have **Node.js** (v20+ recommended) and **Docker / Docker Compose** installed.

### 2. Spin up the Infrastructure
Launch the MySQL database and phpMyAdmin containers in the background:
1.  **In this project folder (`employes_ms`):** Start the Employees MySQL database (running on port `3306`) and phpMyAdmin (on `8080`):
    ```bash
    docker compose up -d
    ```
    *phpMyAdmin is accessible at [http://localhost:8080](http://localhost:8080)*
2.  **In the `api_gateway` folder:** Start the RabbitMQ broker:
    ```bash
    docker compose up -d
    ```
3.  **In the `departments_ms` folder:** Start the Departments MySQL database (running on port `3307`) and phpMyAdmin (on `8082`):
    ```bash
    docker compose up -d
    ```

### 3. Environment Setup
Create a `.env` file in the root directory (or edit the existing one):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_DATABASE=employees
```

### 4. Run the Application
Install dependencies and start the development server with hot-reloading:
```bash
npm install
npm run dev
```

On startup, you should see the following logs confirming successful connections:
```text
🐇 [Subscriber] Listening permanently to RabbitMQ queue: departments_events
🚀 Server running on port 3000
```

To test, trigger a department creation in `departments_ms` and inspect the logs of this service to verify that the message is consumed and the database cache is updated!

---

## 📄 License
This project is licensed under the **ISC License**. Developed for modern microservices practice.
