import { clamp } from '../utils/numbers';

export type BandsInputs = {
  Eg: number;
  T: number;
  dopaje: number;
  type: 'n' | 'p';
};

export type BandsOutputs = {
  clasificacion: 'Aislante' | 'Semiconductor' | 'Conductor';
  conductividadRel: number;
  curve: { T: number; cond: number }[];
  efOffset: number;
};

const classify = (Eg: number): BandsOutputs['clasificacion'] => {
  if (Eg > 2) return 'Aislante';
  if (Eg <= 0.1) return 'Conductor';
  return 'Semiconductor';
};

export const calcConductividadRel = (Eg: number, T: number, dopaje: number) => {
  const base = clamp(100 - Eg * 30, 0, 100);
  const tempBoost = clamp((T / 800) * 40, 0, 40);
  const dopeBoost = clamp((dopaje / 100) * 40, 0, 40);
  return clamp(base + tempBoost + dopeBoost, 0, 100);
};

export const computeBands = (inputs: BandsInputs): BandsOutputs => {
  const cond = calcConductividadRel(inputs.Eg, inputs.T, inputs.dopaje);
  const curve = Array.from({ length: 17 }, (_, i) => i * 50).map((temp) => ({
    T: temp,
    cond: calcConductividadRel(inputs.Eg, temp, inputs.dopaje),
  }));

  const efOffset = inputs.type === 'n'
    ? clamp(inputs.dopaje / 100, 0, 1)
    : clamp(-inputs.dopaje / 100, -1, 0);

  return {
    clasificacion: classify(inputs.Eg),
    conductividadRel: cond,
    curve,
    efOffset,
  };
};
