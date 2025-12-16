export type CompareMaterialKey = 'Cobre' | 'Polímero' | 'Grafeno' | 'Superconductor' | 'ITO';

export type CompareMetrics = {
  Conductividad: number;
  Movilidad: number;
  Costo: number;
  'Impacto extracción': number;
  'Impacto desecho': number;
};

export const comparePresets: Record<CompareMaterialKey, CompareMetrics> = {
  Cobre: { Conductividad: 10, Movilidad: 5, Costo: 4, 'Impacto extracción': 8, 'Impacto desecho': 6 },
  'Polímero': { Conductividad: 4, Movilidad: 3, Costo: 2, 'Impacto extracción': 4, 'Impacto desecho': 3 },
  Grafeno: { Conductividad: 9, Movilidad: 10, Costo: 7, 'Impacto extracción': 5, 'Impacto desecho': 4 },
  Superconductor: { Conductividad: 10, Movilidad: 6, Costo: 8, 'Impacto extracción': 6, 'Impacto desecho': 7 },
  ITO: { Conductividad: 7, Movilidad: 5, Costo: 6, 'Impacto extracción': 6, 'Impacto desecho': 6 },
};
