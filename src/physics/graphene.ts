const q = 1.602e-19;

export type GrapheneInputs = {
  ng: number;
  mug: number;
  sigmaCu: number;
  thickness: number;
  logScale: boolean;
};

export const computeGraphene = (inputs: GrapheneInputs) => {
  const sigma2DG = inputs.ng * q * inputs.mug;
  const sigma2DCu = inputs.sigmaCu * inputs.thickness;
  return {
    sigma2DG,
    sigma2DCu,
  };
};
