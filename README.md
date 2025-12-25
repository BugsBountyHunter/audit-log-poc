# 🔍 NestJS Audit Log System

> A production-ready audit logging system built with NestJS that automatically tracks all database operations (Create, Update, Delete) in PostgreSQL and stores comprehensive audit trails in MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Core Concept](#core-concept)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Key Features](#key-features)
- [Design Patterns](#design-patterns)

---

## 🎯 Overview

This project demonstrates a **zero-code audit logging solution** using NestJS, TypeORM, and MongoDB. Every database operation (create, update, delete) is automatically captured without manual logging calls, providing complete traceability for compliance, security, and debugging purposes.

**Key Benefits:**

- ✅ Automatic audit trail for all database changes
- ✅ Dual database architecture (PostgreSQL for data, MongoDB for audit logs)
- ✅ User context tracking via async local storage (CLS)
- ✅ Clean architecture with domain-driven design
- ✅ Zero impact on business logic code

---

## 💡 Core Concept

### The Problem

Traditional audit logging requires developers to manually insert logging code throughout the application:

```typescript
// ❌ Manual approach - repetitive and error-prone
async createTodo(data) {
  const todo = await this.repo.save(data);
  await this.auditService.log('create', 'todo', todo.id, userId); // Easy to forget!
  return todo;
}
```

### The Solution

Our system uses **TypeORM Event Subscribers** to automatically intercept all database operations:

```typescript
// ✅ Automatic approach - just save, logging happens automatically
async createTodo(data) {
  return this.repo.save(data); // Audit log created automatically!
}
```

---

## 🔄 How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HTTP Request                                 │
│                  POST /todos { "title": "..." }                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  ClsAuthMiddleware  │ ◄── Sets user context
                    │  (Mock User: 123)   │     in async storage
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  TodoController     │
                    │  @Post('/todos')    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   TodoService       │ ◄── Wraps operation in
                    │   create(data)      │     cls.run() for context
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  TodoRepository     │
                    │  repo.save(todo)    │ ◄── Saves to PostgreSQL
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ TypeORM INSERT      │ ◄── Database operation
                    │ INTO todos          │
                    └──────────┬──────────┘
                               │
                    ╔══════════▼══════════╗
                    ║  AuditSubscriber    ║ ◄── 🔔 Automatically triggered!
                    ║  afterInsert()      ║     TypeORM event listener
                    ╚══════════╤══════════╝
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AuditService      │ ◄── Gets user from CLS
                    │   recordCreate()    │     Enriches audit data
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ AuditLogRepository  │
                    │ MongoDB.insertOne() │ ◄── Saves audit log
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB          │
                    │  {                  │
                    │   action: "create", │
                    │   entity: "Todo",   │
                    │   entityId: "...",  │
                    │   after: {...},     │
                    │   userId: "123",    │
                    │   timestamp: "..."  │
                    │  }                  │
                    └─────────────────────┘
```

### Step-by-Step Explanation

1. **HTTP Request** arrives at the server (e.g., `POST /todos`)
2. **ClsAuthMiddleware** extracts user info and stores it in async context (CLS)
3. **Controller** receives the request and delegates to service
4. **Service** wraps the operation in `cls.run()` to maintain user context
5. **Repository** performs database operation (TypeORM save/update/remove)
6. **TypeORM** emits an event (`afterInsert`, `afterUpdate`, or `afterRemove`)
7. **AuditSubscriber** catches the event automatically
8. **AuditService** retrieves user from CLS and creates audit log entry
9. **AuditLogRepository** saves the audit log to MongoDB
10. **Response** returns to client (audit happens transparently)

---

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│                  (Controllers, Middleware)                  │
│  ┌────────────────────┐  ┌──────────────────────────────┐  │
│  │  TodoController    │  │  AuditController             │  │
│  │  GET /todos        │  │  GET /audit-logs             │  │
│  │  POST /todos       │  │  GET /audit-logs/entity/:id  │  │
│  └────────────────────┘  └──────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Application Layer                         │
│                   (Services, Use Cases)                      │
│  ┌────────────────────┐  ┌──────────────────────────────┐  │
│  │   TodoService      │  │   AuditService               │  │
│  │   Business Logic   │  │   Audit Recording            │  │
│  └────────────────────┘  └──────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     Domain Layer (Global)                    │
│           (Entities, Repositories, Subscribers)              │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Todo.entity    │  │ TodoRepository  │  │ Audit       │  │
│  │ @Entity('todos')│  │ CRUD Operations │  │ Subscriber  │  │
│  └────────────────┘  └─────────────────┘  └─────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Infrastructure Layer                        │
│               (Database, External Services)                  │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │   PostgreSQL         │  │   MongoDB                │    │
│  │   (TypeORM)          │  │   (Native Driver)        │    │
│  │   Business Data      │  │   Audit Logs             │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Component              | Technology | Version | Purpose                              |
| ---------------------- | ---------- | ------- | ------------------------------------ |
| **Framework**          | NestJS     | 11.x    | Backend application framework        |
| **Language**           | TypeScript | 5.x     | Type-safe development                |
| **Primary Database**   | PostgreSQL | 15      | Business data storage                |
| **Audit Database**     | MongoDB    | 7       | Audit log persistence                |
| **ORM**                | TypeORM    | 0.3.20  | Database operations & event system   |
| **Context Management** | nestjs-cls | 4.4.1   | Async local storage for user context |
| **Containers**         | Docker     | -       | Local development databases          |

---

## 📁 Project Structure

```
nestjs-audit-log/
├── src/
│   ├── app.module.ts                    # Root module
│   ├── main.ts                          # Application bootstrap
│   │
│   ├── common/                          # Shared utilities
│   │   ├── types/
│   │   │   └── audit-log.type.ts        # AuditLog interface & types
│   │   └── middleware/
│   │       └── cls-auth.middleware.ts   # User context middleware (mock)
│   │
│   ├── database/                        # Database configuration
│   │   ├── postgres.datasource.ts       # PostgreSQL config (TypeORM)
│   │   ├── mongo.datasource.ts          # MongoDB config (native driver)
│   │   └── database.module.ts           # Database providers
│   │
│   ├── domain/                          # Domain layer (@Global)
│   │   ├── entities/
│   │   │   ├── todo.entity.ts           # Todo TypeORM entity
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── todo.repository.ts       # Todo data access layer
│   │   │   ├── audit-log.repository.ts  # MongoDB audit repository
│   │   │   └── index.ts
│   │   ├── subscribers/
│   │   │   └── audit.subscriber.ts      # TypeORM event subscriber
│   │   └── domain.module.ts             # Exports repositories globally
│   │
│   └── modules/                         # Feature modules
│       ├── audit/
│       │   ├── audit.service.ts         # Audit business logic
│       │   ├── audit.controller.ts      # Audit query endpoints
│       │   └── audit.module.ts          # @Global audit module
│       └── todo/
│           ├── todo.service.ts          # Todo business logic
│           ├── todo.controller.ts       # Todo CRUD endpoints
│           └── todo.module.ts
│
├── docker-compose.yml                   # Production Docker setup
├── docker-compose.dev.yml               # Development Docker setup
├── Dockerfile                           # Production image
├── Dockerfile.dev                       # Development image
├── .dockerignore                        # Docker ignore patterns
├── setup-databases.sh                   # Docker setup script (standalone)
├── stop-databases.sh                    # Stop containers
├── remove-databases.sh                  # Remove containers & data
├── tsconfig.json                        # TypeScript config with path aliases
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable       | Default                                                   | Description                  |
| -------------- | --------------------------------------------------------- | ---------------------------- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/audit_poc` | PostgreSQL connection string |
| `MONGO_URL`    | `mongodb://localhost:27017/audit_logs`                    | MongoDB connection string    |
| `PORT`         | `3000`                                                    | Application port             |
| `NODE_ENV`     | `development`                                             | Environment mode             |

Create a `.env` file for local development:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/audit_poc
MONGO_URL=mongodb://localhost:27017/audit_logs
PORT=3000
NODE_ENV=development
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [nestjs-cls Documentation](https://github.com/Papooch/nestjs-cls)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Built with ❤️ by the development team for production-ready audit logging.

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: `connection refused` or `database does not exist`

**Solution**:

```bash
# Stop any existing containers
docker stop nestjs-audit-postgres nestjs-audit-mongo
docker rm nestjs-audit-postgres nestjs-audit-mongo

# Recreate databases
./setup-databases.sh

# Verify containers are running
docker ps
```

### CLS Context Issues

**Problem**: `userId` is `null` or `undefined` in audit logs

**Solution**: Ensure repository operations are wrapped with `cls.run()`:

```typescript
create(data) {
  return this.cls.run(async () => {
    return this.repository.create(data);
  });
}
```

### TypeORM Synchronize Warning

**Problem**: `synchronize: true` warning in production

**Solution**: For production, disable synchronize and use migrations:

```typescript
// src/database/postgres.datasource.ts
synchronize: process.env.NODE_ENV !== 'production',
```

---

**Happy Auditing! 🎉**
