export type StateVector = number[] | Float32Array | Float64Array;
export type Vector3 = [number, number, number];

export interface SystemState {
  point: StateVector;
  t: number;
}

export type DerivativeFn = (state: StateVector, t: number) => StateVector;
