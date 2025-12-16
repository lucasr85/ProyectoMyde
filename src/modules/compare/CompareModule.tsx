import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { CompareMaterialKey, CompareMetrics } from '../../physics/compare';
import { comparePresets } from '../../physics/compare';
import { clamp } from '../../utils/numbers';

type Props = ModuleComponentProps<Record<CompareMaterialKey, CompareMetrics>>;

export const CompareModule = ({ registerValues }: Props) => {
  const [materials, setMaterials] = useState<Record<CompareMaterialKey, CompareMetrics>>(comparePresets);

  useEffect(() => registerValues(materials), [materials, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'compare') {
        setMaterials((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (mat: CompareMaterialKey, key: keyof CompareMetrics, value: number) => {
    const clamped = clamp(value, 1, 10);
    setMaterials((prev) => ({
      ...prev,
      [mat]: { ...prev[mat], [key]: clamped },
    }));
  };

  const radarData = Object.keys(materials.Cobre).map((metric) => ({
    metric,
    ...Object.fromEntries(Object.entries(materials).map(([k, v]) => [k, (v as any)[metric]])),
  }));

  const barData = Object.entries(materials).map(([name, vals]) => ({
    name,
    Conductividad: vals.Conductividad,
    Movilidad: vals.Movilidad,
    Costo: vals.Costo,
    'Impacto extracción': vals['Impacto extracción'],
    'Impacto desecho': vals['Impacto desecho'],
  }));

  return (
    <>
      <section className="panel controls">
        <h3>Editar métricas (1..10)</h3>
        <div className="controls">
          {(Object.keys(materials) as CompareMaterialKey[]).map((mat) => (
            <div key={mat} className="metric">
              <strong>{mat}</strong>
              {Object.keys(materials[mat]).map((metric) => (
                <div key={metric} className="control-row">
                  <label>{metric}</label>
                  <input
                    type="number"
                    value={(materials as any)[mat][metric]}
                    onChange={(e) => update(mat, metric as keyof CompareMetrics, Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="help">
          Ajustá conductividad, movilidad, costo e impactos ambientales. Las cifras son cualitativas (1-10) para
          comparar rápidamente materiales en clase.
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Radar y barras</h3>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <Radar name="Cobre" dataKey="Cobre" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
            <Radar name="Grafeno" dataKey="Grafeno" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            <Radar name="Superconductor" dataKey="Superconductor" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Conductividad" fill="#2563eb" />
            <Bar dataKey="Movilidad" fill="#22c55e" />
            <Bar dataKey="Costo" fill="#f97316" />
            <Bar dataKey="Impacto extracción" fill="#a855f7" />
            <Bar dataKey="Impacto desecho" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </>
  );
};
