# Mathematical Models Reference

This folder contains the definitions for all dynamical systems supported by the visualizer.

## Continuous Attractors (ODEs)

These systems are defined by a set of Ordinary Differential Equations (ODEs) solved using the RK4 method.

### [Lorenz Attractor](lorenz.ts)
The "father" of chaos theory. A simplified mathematical model for atmospheric convection.
- **Key Discovery**: Shows extreme sensitivity to initial conditions (The Butterfly Effect).

### [Aizawa Attractor](aizawa.ts)
A complex 3D system that produces a sphere-like attractor with a central "tube". Often considered one of the most beautiful attractors.

### [Chua's Circuit](chua.ts)
A non-linear electronic circuit that exhibits chaotic behavior. It is a physical system that can be built in the real world.

### [Rossler Attractor](rossler.ts)
Designed to be a simpler version of the Lorenz attractor, it consists of a single "folded" band.

### [Chen Attractor](chen.ts)
A chaotic attractor that bridges the gap between the Lorenz and Rossler systems. It belongs to the same family of attractors as Lorenz but with different topological properties.

### [Halvorsen Attractor](halvorsen.ts)
A symmetric cyclic system with three distinct lobes. It is known for its elegant, rhythmic geometric structure.

### [Thomas Attractor](thomas.ts)
A system known for its "labyrinthine" chaos and cyclic structure. It models a particle moving in a three-dimensional friction-driven environment.

### [Hindmarsh-Rose Model](hindmarshRose.ts)
A mathematical model of the electrochemical activity of neurons. It is capable of simulating the complex "bursting" behavior seen in real brain cells.

### [Double Pendulum](doublePendulum.ts)
A classic physical system consisting of one pendulum attached to another. It is a simple system that exhibits rich, complex, and unpredictable behavior.

---

## Discrete Maps

These systems evolve in distinct "steps" or iterations rather than continuous time.

### [Henon Map](henon.ts)
A discrete-time dynamical system that exhibits chaotic behavior. It is a simplified version of a Poincaré section of the Lorenz model.

### [Clifford Map](clifford.ts)
A set of equations that produce intricate, fractal-like patterns. Very sensitive to the $a, b, c, d$ parameters.

### [Ikeda Map](ikeda.ts)
A discrete-time dynamical system modeling the behavior of light pulses in a nonlinear optical resonator (specifically a ring cavity).

### [Logistic Map](logistic.ts)
A 2D phase-space projection ($x_n$ vs $x_{n-1}$) of the classic population model. It reveals the parabolic "arch" that causes chaos.

---

## Adding Your Own
See the [**Development Guide**](../../../DEVELOPMENT.md) for instructions on how to implement your own mathematical models.
