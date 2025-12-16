import { clamp } from '../utils/numbers';

export type SuperInputs = {
  Tc: number;
  T: number;
  H: number;
  Hc: number;
  J: number;
  Jc: number;
  rhoN: number;
  k: number;
};

export type SuperOutputs = {
  isSuper: boolean;
  rho: number;
  curve: { T: number; rho: number }[];
};

export const computeSuperconductor = (inputs: SuperInputs): SuperOutputs => {
  const isSuper = inputs.T < inputs.Tc && inputs.H < inputs.Hc && inputs.J < inputs.Jc;
  const rho = isSuper ? 0 : inputs.rhoN * (1 + inputs.k * (inputs.T - inputs.Tc));

  const curveTemps = Array.from({ length: 16 }, (_, i) => i * 20);
  const curve = curveTemps.map((temp) => {
    const activeSuper = temp < inputs.Tc && inputs.H < inputs.Hc && inputs.J < inputs.Jc;
    const rhoTemp = activeSuper ? 0 : inputs.rhoN * (1 + inputs.k * (temp - inputs.Tc));
    return { T: temp, rho: clamp(rhoTemp, 0, inputs.rhoN * 5) };
  });

  return { isSuper, rho: clamp(rho, 0, inputs.rhoN * 5), curve };
};
