# Project Agent Guide

## Overview
This repository contains the Discover web app built with Next.js (App Router). It provides authentication, role-based access control, user management, and a localized dashboard experience.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS (via PostCSS)
- PostgreSQL (Dockerized)
- pnpm workspace

## Key Directories
- src/app: App Router pages and API routes
- src/components: Reusable UI components
- src/lib: Auth, DB, permissions, and session helpers
- src/i18n: Request/locale helpers
- messages: Localization files (ar.json, en.json)
- database: SQL schema and patches

## App Routes
- App pages: src/app/[locale]/...
- API routes: src/app/api/...

## Database
- SQL initialization: database/init.sql
- Migrations/patches: database/patches/

## Environment
- Configure env variables in .env (see .env.example)
- Typical DB connection: postgresql://postgres:postgres@localhost:5433/discover

## Common Commands
- Install: pnpm install
- Dev server: pnpm dev
- Build: pnpm build
- Lint: pnpm lint

## Conventions
- Prefer functional React components with TypeScript types
- Keep API route logic in src/app/api
- Keep shared business logic in src/lib
- Keep UI components small and reusable
- Use messages/*.json for localized strings

## UI/UX Expectations
- Clean, modern admin dashboard
- RTL-friendly when locale is Arabic
- Avoid hard-coded strings; use i18n messages

## When Editing
- Preserve existing APIs and route structure
- Reuse existing components and hooks where possible
- Avoid unnecessary refactors
