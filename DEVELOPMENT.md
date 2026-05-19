# Development & Testing Guide

This guide is for developers who want to extend the visualizer or understand its internal workflows.

## Adding a New System

To add a new strange attractor (ODE) or discrete Map:

1.  **Define the System**: Create a new file in `src/core/systems/`.
2.  **Define Derivatives/Map Logic**:
    ```typescript
    export const myNewSystem: RegisteredSystem = {
      math: {
        id: "my-system",
        type: "ode", // or "map"
        dimension: 3,
        defaultParams: { a: 10, b: 28, c: 8/3 },
        initialState: [1, 1, 1],
        getDerivative: (params) => (state, t) => {
          const [x, y, z] = state;
          return [
            params.a * (y - x),
            x * (params.b - z) - y,
            x * y - params.c * z
          ];
        }
      },
      meta: {
        name: "My System",
        // ... sliders and descriptions
      }
    };
    ```
3.  **Register it**: Add it to `SYSTEM_REGISTRY` in `src/core/systems/index.ts`.

## Testing Strategy

We use **Vitest** for all testing. Tests are categorized into three types:

### 1. Mathematical Health Checks
Located in `src/core/systems/healthcheck.test.ts`. Every system in the registry is automatically tested to ensure:
- It produces finite numbers (no `NaN`).
- Metadata is correctly formatted.
- Initial states are valid.

### 2. Core Unit Tests
- `integrator.test.ts`: Verifies RK4 accuracy.
- `validation.test.ts`: Tests the safety guards against mathematical "explosions".

### 3. Backend Tests
Located in `server/src/`. We use Mocks for Prisma and Express to test controllers and services without needing a live database.

Run tests: `npm test` (root or server folder).

## Logging System

The project uses a custom structured logging system.

### Frontend
- **State Logs**: Every Zustand update is logged to the console in a collapsed group. You can see exactly what changed.
- **Diagnostic Logs**: If a simulation diverges (goes to infinity), the `SimulationEngine` will log a warning with the last valid coordinates.

### Backend
- **Request Logs**: Every API request is logged with its method, URL, status code, and response time.
- **Error Boundary**: All 500 errors are logged with full stack traces.

## Performance Tips
- **Buffer Reuse**: Always use `Float32Array` when passing data to Three.js.
- **Stateless Math**: Keep the `SimulationEngine` pure. Don't store points in the class; store them in the Zustand store.
- **Frame Capping**: The simulation loop is capped at 500 sub-steps per frame to prevent the browser from freezing on low-end hardware.
