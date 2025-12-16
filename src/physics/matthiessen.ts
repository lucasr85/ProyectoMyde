export type MaterialKey = 'Cu' | 'Al' | 'Custom';

export type MatthiessenInputs = {
  material: MaterialKey;
  rho20: number;
  alpha: number;
  rhoI: number;
  rhoD: number;
  T: number;
  compare: boolean;
};

export const defaultMaterials: Record<Exclude<MaterialKey, 'Custom'>, Omit<MatthiessenInputs, 'material' | 'T' | 'compare'>> = {
  Cu: { rho20: 1.68e-8, alpha: 0.0039, rhoI: 1e-10, rhoD: 2e-9 },
  Al: { rho20: 2.82e-8, alpha: 0.0039, rhoI: 5e-11, rhoD: 1e-9 },
};

export const rhoMatthiessen = (rho20: number, alpha: number, rhoI: number, rhoD: number, T: number) =>
  rho20 * (1 + alpha * (T - 20)) + rhoI + rhoD;

export const buildRhoCurve = (inputs: MatthiessenInputs) => {
  const temps = Array.from({ length: 21 }, (_, i) => -100 + i * 25);
  return temps.map((temp) => ({
    T: temp,
    rho: rhoMatthiessen(inputs.rho20, inputs.alpha, inputs.rhoI, inputs.rhoD, temp),
  }));
};
