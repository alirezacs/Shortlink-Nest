# INSTALL.md

# URL Shortener Project

This document explains how to set up and run the project for development.

---

# Prerequisites

Make sure the following software is installed:

- Node.js 22+
- npm 10+
- PostgreSQL 16+
- Git

---

# Clone the repositories

Backend

```bash
git clone https://github.com/alirezacs/Shortlink-Nest
cd Shortlink-Nest
```

Frontend

```bash
git clone https://github.com/alirezacs/Shortlink-Next
cd Shortlink-Next
```

---

# Install dependencies

Backend

```bash
npm install
```

Frontend

```bash
npm install
```

---

# Environment Variables

## Backend

Create a `.env` file in the project root.

Example:

```env
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=shortlink

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## Frontend

Create a `.env.local` file.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

# Database

Create a PostgreSQL database:

```sql
CREATE DATABASE shortlink;
```

---

# Run Migrations

```bash
npm run migration:run
```

---

# Seed Database

```bash
npm run seed
```

This will create:

- Default roles
- Default permissions (`users.*`, `roles.*`, `permissions.*`)
- Administrator account

The seeder is idempotent. Re-run it after pulling changes that add new
permissions, otherwise existing accounts cannot reach the matching endpoints.

---

# Run the Backend

```bash
npm run start:dev
```

Backend URL:

```
http://localhost:3002
```

---

# Run the Frontend

```bash
npm run dev
```

Frontend URL:

```
http://localhost:3000
```

---

# Default Administrator

Email

```
admin@example.com
```

Password

```
Alireza@1383
```

---

# Permissions Module

Every endpoint requires a signed in account whose roles grant the listed
permission.

## API (http://localhost:3002)

| Method | Endpoint | Permission | Notes |
| ------ | -------- | ---------- | ----- |
| GET | `/permissions` | `permissions.read` | Paginated list. Query: `page`, `limit` (max 100), `search`, `group`, `assigned` (`true`/`false`), `sortBy` (`name`, `createdAt`, `updatedAt`), `sortOrder` (`ASC`/`DESC`) |
| GET | `/permissions/groups` | `permissions.read` | Distinct name prefixes, powers the group filter |
| GET | `/permissions/:id` | `permissions.read` | Single permission including the roles that use it |
| POST | `/permissions` | `permissions.create` | Body: `name`, optional `description` |
| PATCH | `/permissions/:id` | `permissions.update` | Partial update, `description: null` clears it |
| DELETE | `/permissions/:id` | `permissions.delete` | Answers 204, or 409 while roles still use the permission |

Names are stored lower case and dot separated, for example `users.read`. The
first segment is the group the dashboard filters and badges by.

## Dashboard (http://localhost:3000)

| Page | Path |
| ---- | ---- |
| List with search, filters, sorting and pagination | `/permissions` |
| Create | `/permissions/create` |
| Edit | `/permissions/<id>/edit` |

The browser never calls NestJS directly. The `/api/permissions/*` route
handlers forward the HttpOnly access token from the Next.js server.

---

# Useful Commands

Generate Migration

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

Run Migrations

```bash
npm run migration:run
```

Revert Migration

```bash
npm run migration:revert
```

Run Seeder

```bash
npm run seed
```

Start Development Server

```bash
npm run start:dev
```

---

# Troubleshooting

## Migration Issues

- Ensure PostgreSQL is running.
- Verify the `.env` configuration.
- Check database credentials.

## Port Already in Use

Change the application port inside the `.env` file.

## Seeder Errors

Run all pending migrations before executing the seed command.

---

# Support

If the application cannot be started, verify that:

- PostgreSQL service is running.
- Environment variables are correctly configured.
- All dependencies have been installed.
- Database migrations have been executed successfully.