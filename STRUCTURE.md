# Project Structure

This document provides a comprehensive map of the **Nonlinear Dynamics Visualizer** codebase.

## Directory Tree

```text
nonlinear-dynamics-visualizer/
├── ARCHITECTURE.md           # More about system design
├── DEVELOPMENT.md            # Guide for adding systems/tests
├── STRUCTURE.md              # [You are here] Directory map
├── README.md                 # Main project overview & setup
├── index.html                # Entry HTML for Vite
├── vite.config.ts            # Frontend build configuration
├── server/                   # BACKEND (Node.js/Express)
│   ├── prisma/               # Database schema & migrations
│   └── src/
│       ├── controllers/      # Request handlers (Auth, Presets)
│       ├── middleware/       # Auth, Logging, Error handling
│       ├── routes/           # API Endpoint definitions
│       ├── services/         # Database logic (Prisma)
│       └── utils/            # Async wrappers, Logger
└── src/                      # FRONTEND (React/Three.js)
    ├── api/                  # API client (Axios/Fetch wrappers)
    ├── assets/               # Static images and SVGs
    ├── components/
    │   ├── canvas/           # Three.js / R3F Rendering components
    │   └── ui/               # React UI components (Sidebar, Sliders)
    ├── core/                 # CORE LOGIC (Framework independent)
    │   ├── math/             # RK4 Integrator, Vector math
    │   ├── systems/          # Attractor & Map definitions (ODEs)
    │   └── utils/            # Coordinate transforms, Validation
    ├── hooks/                # Custom React hooks (Simulation loop)
    ├── pages/                # Main view components (Home, Library)
    ├── stores/               # Global state (Zustand)
    │   ├── slices/           # Modular state fragments
    │   ├── middleware/       # Custom Zustand loggers
    │   └── types/            # Store-specific TypeScript types
    └── styles/               # Global and component-level CSS
```

---

## Detailed Breakdown

### Frontend (`src/`)

| Folder | Responsibility |
| :--- | :--- |
| **`components/canvas/`** | Contains the Three.js visualizers. `SimulationVisualizer.tsx` handles lines (ODEs), while `SimulationVisualizerMap.tsx` handles points (Maps). |
| **`components/ui/`** | Standard React components for the interface (Sidebars, Sliders, Overlays). Uses CSS Modules for styling. |
| **`core/math/`** | The mathematical heart. Contains the `rk4` implementation and high-performance vector operations using `Float32Array`. |
| **`core/systems/`** | Every strange attractor has its own file here. This is where the physics equations ($dx/dt$) live. |
| **`stores/`** | Uses Zustand to manage everything from simulation points to the current theme. Divided into "slices" to keep logic modular. |
| **`hooks/`** | `useSimulationLoop.ts` is the most important file here; it bridges the R3F `useFrame` to the `SimulationEngine`. |

### Backend (`server/`)

| Folder | Responsibility |
| :--- | :--- |
| **`prisma/`** | Contains `schema.prisma`. Defines your database models (`User`, `Preset`) and stores migration history. |
| **`src/controllers/`** | Logic for handling incoming data. For example, `PresetController` checks if you own a preset before letting you delete it. |
| **`src/services/`** | Pure database interaction. These classes are injected into controllers to keep code clean and testable. |
| **`src/middleware/`** | Interceptors. `authenticate` checks your JWT, and `requestLogger` tracks API speed. |

---

## Key Files to Know

- **`src/core/SimulationEngine.ts`**: The engine that drives the math. It is stateless and optimized for 60FPS.
- **`src/stores/useSimulationStore.ts`**: The "Single Source of Truth" for all active simulations.
- **`server/src/app.ts`**: The entry point where all backend middleware and routes are wired together.
- **`server/src/utils/logger.ts`**: The structured logging utility used to track server health.
