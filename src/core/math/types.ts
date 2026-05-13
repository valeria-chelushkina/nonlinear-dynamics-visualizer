export type Vector3 = [number, number, number];

export interface SystemState {
  point: Vector3;
  t: number;
}

export type DerivativeFn = (state: Vector3, t: number) => Vector3;
