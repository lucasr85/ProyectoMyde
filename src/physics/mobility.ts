import { clamp } from '../utils/numbers';

export type MobilityInputs = {
  E: number;
  mu: number;
  n: number;
  saturation: boolean;
  vdMax: number;
};

export type MobilityOutputs = {
  vd: number;
  sigma: number;
  J: number;
  curveVd: { E: number; vd: number }[];
  curveJ: { E: number; J: number }[];
};

const q = 1.602e-19;

export const computeMobility = (inputs: MobilityInputs): MobilityOutputs => {
  const { E, mu, n, saturation, vdMax } = inputs;
  const vdRaw = mu * E;
  const vd = saturation ? clamp(vdRaw, 0, vdMax) : vdRaw;
  const sigma = n * q * mu;
  const J = sigma * E;

  const fields = Array.from({ length: 11 }, (_, i) => (E / 10) * i);
  const curveVd = fields.map((field) => {
    const vdFieldRaw = mu * field;
    const vdField = saturation ? Math.min(vdFieldRaw, vdMax) : vdFieldRaw;
    return { E: Number(field.toFixed(2)), vd: vdField };
  });
  const curveJ = fields.map((field) => {
    const vdFieldRaw = mu * field;
    const vdField = saturation ? Math.min(vdFieldRaw, vdMax) : vdFieldRaw;
    const effSigma = vdField === 0 ? 0 : (vdField / field) * sigma || 0;
    const JField = effSigma * field;
    return { E: Number(field.toFixed(2)), J: JField };
  });

  return { vd, sigma, J, curveVd, curveJ };
};
