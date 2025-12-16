export type OhmMode = 'vr' | 'rho';

export type OhmInputs = {
  mode: OhmMode;
  V: number;
  R: number;
  L: number;
  A: number;
  rho: number;
};

export type OhmOutputs = {
  I: number;
  J: number;
  E: number;
  sigma: number;
  Rcalc: number;
  dataIV: { V: number; I: number }[];
};

export const computeOhm = (inputs: OhmInputs): OhmOutputs => {
  const { mode, V, R, L, A, rho } = inputs;
  const resistance = mode === 'vr' ? R : (rho * L) / A;
  const current = resistance > 0 ? V / resistance : 0;
  const J = A > 0 ? current / A : 0;
  const E = L > 0 ? V / L : 0;
  const sigma = rho > 0 ? 1 / rho : 0;

  const points = Array.from({ length: 11 }, (_, i) => {
    const Vp = (V / 10) * i;
    const Ip = resistance > 0 ? Vp / resistance : 0;
    return { V: Number(Vp.toFixed(3)), I: Number(Ip.toFixed(6)) };
  });

  return {
    I: current,
    J,
    E,
    sigma,
    Rcalc: resistance,
    dataIV: points,
  };
};
