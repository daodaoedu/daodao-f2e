# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `yarn dev` - Start development server on port 5438
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint and auto-fix issues
- `yarn ts:check` - Run TypeScript type checking

### Deployment
- `yarn pages:build` - Build for Cloudflare Pages
- `yarn preview` - Preview Cloudflare Pages build locally
- `yarn deploy` - Deploy to Cloudflare Pages

## Architecture Overview

### Current Migration State
This project is in active migration from Material-UI to shadcn/ui + Tailwind CSS. The codebase follows a hybrid approach:

**Modern Stack (Use for new features):**
- shadcn/ui + Radix UI components
- Tailwind CSS for styling
- React Hook Form + Zod for forms
- SWR for data fetching
- TypeScript

**Legacy Stack (Being phased out):**
- Material-UI (MUI)
- Emotion CSS-in-JS
- Redux + Redux Saga
- Some components still use JSX

### Folder Structure Principles

**Atomic Design Structure:**
- `components/atoms/` - Basic UI components (buttons, inputs)
- `components/molecules/` - Composed components (date-picker, search-input)
- `components/` - Legacy components (being migrated)

**Feature-Based Organization:**
- `features/` - Self-contained feature modules with their own components, hooks, and utils
- `services/` - API layer with schema definitions using Zod
- `pages/` - Next.js pages (should only orchestrate, minimal logic)

**Key Architectural Rules:**
1. Features should not depend on each other
2. Services modules should remain independent
3. Shared components go in `components/atoms|molecules|organisms`
4. Business logic stays in `features/`

### State Management Strategy

**For New Development:**
- Use React Context for component-level state sharing
- Use SWR for server state and data fetching
- Use React hooks for local component state

**Legacy (being migrated):**
- Redux + Redux Saga exists but avoid for new features
- Gradually migrate API calls from Saga to SWR

### Services Layer Pattern

The `services/` directory follows a specific pattern:
```
services/
  ├── _shared/        # Common schemas
  ├── resources/
  │   ├── core/       # Main API and schema
  │   ├── reviews/    # Sub-module
  │   └── index.ts    # Module exports
```

Each service module includes:
- `api.ts` - API interface definitions
- `schema.ts` - Zod schemas for validation
- `hooks.ts` - SWR hooks for the service

### Layout System

The project uses a layout system in `layout/`:
- `getBaseLayout()` - Standard layout with Header/Footer
- `getPrivateLayout()` - For authenticated pages
- Headers and Footers are automatically included, don't manually import them

### Important Cursor Rules

**UI Migration Rules (.cursor/rules/ui-migration-rules.mdc):**
- Never use Material-UI, emotion, dayjs, or react-icons
- Always use shadcn/ui, Tailwind CSS, date-fns, and Lucide React
- Use React Hook Form + Zod for all forms

**Project Refactoring Rules (.cursor/rules/project-refactoring-rules.mdc):**
- Follow Atomic Design principles
- Keep features independent
- Use TypeScript with proper typing
- Services should use Zod schemas

### Development Workflow

**Branch Strategy:**
- `dev` - Development branch for integration
- `prod` - Production branch for stable releases

**Code Quality:**
- ESLint with Airbnb config
- TypeScript strict mode
- Automatic formatting on lint

**Deployment:**
- Cloudflare Pages for hosting
- GitHub Actions for CI/CD
- Discord notifications for build status

### Key Technologies

**Frontend:**
- Next.js 15 + React 19
- Tailwind CSS + shadcn/ui
- SWR for data fetching
- Zod for validation

**Development:**
- TypeScript
- ESLint + Prettier
- Husky for pre-commit hooks

**Infrastructure:**
- Cloudflare Pages
- Cloudflare Workers for API
- PWA support

### Common Patterns

**Creating New Features:**
1. Create in `features/[feature-name]/`
2. Include components, hooks, and types within the feature
3. Export through `index.ts`
4. Use SWR for data fetching
5. Use shadcn/ui components

**Adding New API Services:**
1. Create service in `services/[service-name]/`
2. Define schemas with Zod in `schema.ts`
3. Implement API functions in `api.ts`
4. Create SWR hooks in `hooks.ts`

**Form Implementation:**
1. Define schema with Zod
2. Use React Hook Form with zodResolver
3. Use shadcn/ui form components
4. Handle validation and submission properly