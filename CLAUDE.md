# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build for production with Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Architecture

This is a minimal Vite + React 19 + TypeScript single-page app (currently close to the stock Vite React template, project name "minizine").

- `src/main.tsx` — entry point, mounts `<App />` into `#root` inside `StrictMode`.
- `src/App.tsx` — the only component; all UI currently lives here.
- `src/App.css` / `src/index.css` — styling.
- `public/icons.svg` — shared SVG sprite sheet, referenced via `<use href="/icons.svg#icon-id">` rather than importing individual icon files.
- TypeScript project is split via references: `tsconfig.json` points to `tsconfig.app.json` (app source, `src/`) and `tsconfig.node.json` (Vite config).

### Build tooling notes

- `vite.config.ts` wires up `@vitejs/plugin-react` together with `@rolldown/plugin-babel` running the `reactCompilerPreset()` — the React Compiler is enabled, so avoid manual memoization (`useMemo`/`useCallback`/`React.memo`) unless there's a specific reason the compiler can't handle it.
- ESLint config (`eslint.config.js`) uses flat config with `typescript-eslint` recommended rules, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` (Vite-specific fast-refresh rules). Type-aware lint rules are not enabled.
