# System Architecture

This document describes the high-level architecture of the Nonlinear Dynamics Visualizer.

## System Overview

The application is split into two main layers: the **Mathematical Simulation Layer** and the **Rendering/UI Layer**.

### 1. Simulation Pipeline
The heart of the application is a stateless numerical engine that transforms differential equations into spatial coordinates.

- **`SimulationEngine`**: A pure calculation class that uses the RK4 (Runge-Kutta 4) method. It is stateless, meaning it calculates the "next" point based on whatever "last" point is passed to it from the state store.
- **`Integrator`**: Implements the RK4 algorithm using `Float32Array` for maximum performance and minimal garbage collection.
- **`Systems Registry`**: A modular collection of ODE (Ordinary Differential Equation) and Discrete Map definitions.

### 2. State & Data Flow
We use **Zustand** for global state management because it provides the low-latency updates required for 60FPS simulations.

- **`useSimulationStore`**: Manages the history of points, current parameters, and comparison modes.
- **`useSimulationLoop` Hook**: The bridge between React and the Animation Loop. It triggers the `SimulationEngine` on every frame (via `useFrame`) and updates the store.
- **Partial Updates**: To maintain 60FPS, the store only broadcasts "new points" rather than replacing the entire array, reducing React re-render overhead.

### 3. Rendering Engine
Built on **Three.js** via `@react-three/fiber`.

- **`SimulationVisualizer`**: Uses `THREE.BufferGeometry` and `THREE.Line` for continuous attractors. It directly manipulates GPU buffers for high performance.
- **`SimulationVisualizerMap`**: Uses `THREE.Points` with additive blending to render discrete systems like the Clifford Map.

## Backend Design

The backend is a REST API built with Express and Prisma.

- **Layered Pattern**: Controllers handle requests, Services handle business logic (DB queries), and Middleware handles Auth/Validation.
- **Security**: JWT-based authentication with `bcryptjs` for password hashing.
- **Database**: PostgreSQL managed by Prisma. The schema includes `User` and `Preset` models.

## State Lifecycle
1. **User Action**: User changes a slider (e.g., Lorenz `sigma`).
2. **Store Update**: `useSimulationStore` updates the parameter and clears the current points.
3. **Loop Detection**: `useSimulationLoop` sees the reset, clears the `SimulationEngine`, and starts integration from the `initialState`.
4. **Visual Sync**: `SimulationVisualizer` detects the new array and re-binds the WebGL buffers.
