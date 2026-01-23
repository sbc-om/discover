# GitHub Copilot Instructions

You are assisting on a Next.js (App Router) + TypeScript codebase for a localized admin dashboard.

## Goals
- Keep code consistent with existing patterns
- Prefer clear, minimal changes over broad refactors
- Ensure RTL support for Arabic locales
- Avoid hard-coded strings; use i18n messages

## Project Context
- App pages live in src/app/[locale]/...
- API routes live in src/app/api/...
- Shared logic is in src/lib
- UI components are in src/components
- Localization messages are in messages/*.json
- Database schema is in database/init.sql and patches in database/patches

## Coding Guidelines
- Use TypeScript types and interfaces for props and API payloads
- Keep components small and reusable
- Prefer server components unless client state is required
- Keep API routes thin; move logic to src/lib when reusable
- Maintain existing naming and folder conventions

## UI Guidelines
- Match existing styling patterns (Tailwind classes)
- Use accessible HTML and labels for inputs
- Keep layouts responsive

## Safety
- Never include secrets or credentials
- Don’t modify environment variables unless explicitly asked

## Output
- Provide concise summaries of changes
- If editing files, limit changes to what is required
