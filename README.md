# Nonlinear Dynamics Visualizer

An interactive, high-performance web platform for modeling and visualizing chaotic dynamical systems (strange attractors). Built with React, TypeScript and Three.js.

## Overview

This project allows users to explore visuals of chaos theory through real-time 3D and 2D simulations. It features a robust numerical integration engine (RK4) and a highly optimized rendering pipeline capable of handling tens of thousands of points with smooth performance.

### Key Features
- **Real-time 3D Visualization**: Explore attractors like Lorenz, Aizawa, and Chua in a fully interactive 3D space.
- **Discrete Maps Support**: Visualize 2D maps (Henon, Logistic, Clifford) with specialized point-cloud rendering.
- **Side-by-Side Comparison**: Compare different systems or the same system with different parameters.
- **Butterfly Effect Mode**: Observe how tiny initial differences lead to vastly different outcomes.
- **Preset Library**: Save and share your favorite mathematical configurations.
- **Dark/Light Mode**: Fully responsive UI tailored for mathematical exploration.

## Tech Stack

- **Frontend**: Vite, React, TypeScript, Three.js (@react-three/fiber)
- **State Management**: Zustand (with middleware for logging and devtools)
- **Backend**: Node.js, Express, Prisma (PostgreSQL)
- **Testing**: Vitest (Unit & Property-based tests)
- **Styling**: Vanilla CSS Modules

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (for the backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nonlinear-dynamics-visualizer.git
   cd nonlinear-dynamics-visualizer
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the `server` folder:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/attractors"
   JWT_SECRET="your_secret_key"
   ```

4. **Initialize Database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the Application**
   ```bash
   # Start the backend (from /server folder)
   npm run dev
   
   # Start the frontend (from root folder)
   cd ..
   npm run dev
   ```

## Documentation

The project is documented across several specialized files:

- [**Architecture & Design**](ARCHITECTURE.md): More about system design, engine logic and state flow.
- [**Development & Testing**](DEVELOPMENT.md): Guide for adding new systems, running tests and logging.
- [**Code structure**](STRUCTURE.md): More detailed explanation of the entire code structure.
- [**Mathematical Models**](src/core/systems/README.md): Detailed explanation of the attractors included in this project.

## Testing

Run the full suite of unit and mathematical health checks:
```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
