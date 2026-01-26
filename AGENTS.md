# AGENTS.md

Guidance for agentic coding assistants working in this repo.

## Repo layout
- Root is a Yarn 4 + Turborepo workspace.
- `apps/backend`: NestJS service (TypeScript, Jest, ESLint + Prettier).
- `apps/mobile`: React Native / Expo app (TypeScript, Jest).
- `apps/tui`: Go TUI + daemon (Makefile, go test/gofmt/go vet).
- `apps/shared`: shared package (types/utilities; no scripts).

## Cursor/Copilot rules
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Install
- Root: `yarn install`
- App-local installs are managed by workspaces; run app scripts from each app folder.

## Build / lint / test

### Root (Turborepo)
- Build all apps: `yarn build`
- Lint all apps: `yarn lint`
- Test all apps: `yarn test`
- Dev tasks: `yarn dev`

### Backend (apps/backend)
- Build: `yarn build`
- Lint (with autofix): `yarn lint`
- Format: `yarn format`
- Test all: `yarn test`
- Test watch: `yarn test:watch`
- Test coverage: `yarn test:cov`
- Test e2e: `yarn test:e2e`
- Single test file: `yarn test -- src/rest/app/app.controller.spec.ts`
- Single test name: `yarn test -- -t "creates"`

### Mobile (apps/mobile)
- Start Expo: `yarn start`
- Run Android: `yarn android`
- Run iOS: `yarn ios`
- Web: `yarn web`
- Test all: `yarn test`
- Test watch: `yarn test:watch`
- Test coverage: `yarn test:coverage`
- Single test file: `yarn test -- src/__tests__/some.test.tsx`
- Single test name: `yarn test -- -t "renders"`

### TUI (apps/tui)
- Build binaries: `make build`
- Run tests: `make test`
- Format: `make fmt`
- Lint: `make lint` (runs gofmt + go vet; golangci-lint optional)
- Coverage: `make coverage`
- Wire DI: `make wire`
- Single Go test: `go test ./internal/domain/service -run TestName`

## Code style guidelines

### General
- Prefer small, focused files; keep functions narrowly scoped.
- Use descriptive names; avoid ambiguous abbreviations.
- Keep error paths explicit; return early on failures.
- Preserve existing module boundaries and folder structure.
- Add comments only for non-obvious behavior or constraints.

### Backend (NestJS, TypeScript)
- Formatting: Prettier enforced via ESLint (`eslint.config.mjs`).
- Lint: `@typescript-eslint` rules, with `no-floating-promises` and `no-unsafe-argument` as warnings; `no-explicit-any` is off.
- Imports:
  - Use NestJS imports from `@nestjs/*` first.
  - Use local DTO/module imports with relative paths.
  - Use absolute `src/...` imports for core modules (e.g., `src/core/...`).
- Types:
  - Prefer explicit interfaces/types for DTOs (`*.request.ts`, `*.response.ts`).
  - Use `Promise<...>` return types on async methods.
  - `any` is allowed but avoid unless forced by external API constraints.
- Naming:
  - Files use dot-separated names (`task.create.usecase.ts`).
  - Classes: PascalCase (`TaskCreateUseCase`).
  - REST paths use kebab or resource names; controllers use `@Controller`.
- Error handling:
  - Use NestJS exceptions (`NotFoundException`, `BadRequestException`) in use cases/controllers.
  - Return `null` or `undefined` only when the caller explicitly checks it and converts to an exception.
- Architecture:
  - REST layer in `src/rest/**` with DTOs and mappers.
  - Core layer in `src/core/**` with repositories, services, and use cases.

### Mobile (React Native / Expo, TypeScript)
- TypeScript strict mode enabled (`tsconfig.json`).
- Imports:
  - Prefer absolute aliases via `@/...` and feature aliases (`@domain/*`, `@services/*`).
  - Keep React/React Native imports at the top, then local modules.
- Components:
  - Component files are PascalCase (`Button.tsx`).
  - Export named components and a default when it is the primary component.
- Types:
  - Use explicit props interfaces and exported types for shared entities.
  - Keep domain models under `src/domain` and UI types under `src/shared`.
- Styling:
  - Use `StyleSheet.create` and the `shared/theme` primitives.
  - Centralize spacing/typography/color in `src/shared/theme`.
- Error handling:
  - Surface UI errors via shared components (e.g., error boundary/alerts) when possible.
  - In services, return structured results and log via `src/utils/logger.ts` if needed.

### TUI (Go)
- Formatting: `gofmt` via `make fmt`.
- Linting: `go vet` and optional `golangci-lint` via `make lint`.
- Imports:
  - Standard library first, then third-party, then local module imports.
  - Let `gofmt` order imports.
- Naming:
  - Exported types/functions in PascalCase; unexported fields use lowerCamelCase.
  - Files use snake or lower-case names consistent with existing folders.
- Error handling:
  - Return `(value, error)` and check errors immediately.
  - Domain entities validate in constructors and return domain errors (see `internal/domain/entity/errors.go`).
- Architecture:
  - Domain entities/value objects in `internal/domain/**`.
  - Use cases in `internal/application/usecase/**`.
  - Infrastructure adapters in `internal/infrastructure/**`.

## Tests and fixtures
- Backend: Jest tests are `*.spec.ts` under `src/`.
- Mobile: Jest tests are under `__tests__` or `*.test.tsx`.
- TUI: Go tests live near packages (`*_test.go`).

## PR hygiene
- Avoid formatting-only changes unless required by lint.
- Update DTOs/mappers when changing REST shapes.
- Keep cross-app changes isolated (backend/mobile/tui are independent).
