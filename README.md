# Senior Node.js & TypeScript Architectural Challenge

A production-grade, highly strict backend environment built with Node.js, Express, and MySQL (Dockerized). This repository serves as a practical sandbox to master advanced TypeScript type mechanics, runtime boundary safety, and **SOLID** architectural patterns required for high-throughput, resilient distributed systems.

## 🎯 The Mission

The goal of this challenge is to move away from basic type annotations and build an enterprise-ready API boilerplate where **type safety is strictly enforced at every systemic boundary** (Database, HTTP Requests, and Internal Services) without introducing redundant or unreadable code.

### Core Objectives

- **Zero `any` Policy:** Leverage `unknown`, Generics, and Type Predicates to handle dynamic data securely.
- **Database Type Synchronization:** Implement a robust Data Access Layer using Advanced Generics (`<T>`) to guarantee compile-time safety on raw or repository-driven database queries.
- **Request & Input Hardening:** Secure the HTTP boundary by strongly typing Express payloads (`req.body`, `req.params`) and implementing runtime validation.
- **SOLID & Clean Architecture:** Enforce strict decoupling between the HTTP layer (Express), the business logic (Services), and the infrastructure layer (MySQL/Docker).

---

## 🛠️ Tech Stack & Infrastructure

- **Runtime & Framework:** Node.js, Express, TypeScript (Strict Mode).
- **Database & Tools:** MySQL 8.0, phpMyAdmin (Database Management).
- **Containerization:** Docker & Docker Compose for immutable environment replication.
- **Development Utilities:** `tsx` (Watch mode/execution), `tsconfig` production-hardened flags.

---

## ⚙️ Hardened TypeScript Configuration

To simulate a real-world enterprise production environment, the compiler is configured with maximum strictness:

- `strict: true` — Enables all strict type-checking options.
- `noUncheckedIndexedAccess: true` — Forces explicit handling of potential `undefined` values when accessing arrays or lookup objects, eliminating the #1 runtime crash vector in production.
- `exactOptionalPropertyTypes: true` — Strictly differentiates between a missing property and a property explicitly passed as `undefined`.

---

## 📁 Project Structure

Following the principles of Clean Architecture and Separation of Concerns:

```text
├── src/
│   ├── config/
│   │   └── database.ts    # MySQL connection pooling & lifecycle management
│   ├── controllers/       # Strongly-typed Express controllers (HTTP layer)
│   ├── database/
│   │   └── repository.ts  # Advanced Generic Repositories (Data Access Layer)
│   ├── routes/            # API Route definitions mapping to controllers
│   ├── types/
│   │   └── entities.ts    # Core domain entities and data-transfer types
│   └── index.ts           # Application entry-point
├── docker-compose.yml     # Multi-container local environment orchestration
├── package.json
└── tsconfig.json          # Production-ready compiler rules
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js (v18+ recommended) and Docker / Docker Compose installed on your system.

### 2. Environment Setup

Clone the repository, navigate to the root directory, and install the dependencies:

```bash
npm install
```

### 3. Spin up the Infrastructure

Launch the MySQL database and phpMyAdmin containers detached in the background:

```bash
docker compose up -d
```

- **Database Port:** `3306`
- **phpMyAdmin GUI:** Accessible via your browser at [http://localhost:8080](http://localhost:8080)
  _(Credentials -> User: `root`, Password: `password`, Server: `db`)_

### 4. Run the Application

Start the development server with hot-reloading enabled:

```bash
npm run dev
```

---

## 🎓 Learning Pillars & Roadmap

- **Phase 1: Generic Data Repositories** — Crafting single, abstract classes that safely handle multiple database entities mapping parameter types to query results.
- **Phase 2: Request Payload Hardening** — Overriding default Express types to ensure untrusted user inputs match expected system shapes before hitting business logic.
- **Phase 3: Dependency Inversion (SOLID)** — Building decoupled contracts (interfaces) so services never depend directly on infrastructure components.
