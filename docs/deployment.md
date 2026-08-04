# Nazareman Deployment Guide

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- PostgreSQL 14+
- Access to a PostgreSQL database (local or cloud)

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nazareman?schema=public"
ADMIN_PASSWORD="your-strong-admin-password"