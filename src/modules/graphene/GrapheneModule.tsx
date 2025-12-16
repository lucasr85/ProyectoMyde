import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { GrapheneInputs } from '../../physics/graphene';
import { computeGraphene } from '../../physics/graphene';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: GrapheneInputs = {
  ng: 1e15,
  mug: 1,
  sigmaCu: 5.8e7,
  thickness: 5e-8,
  logScale: false,
};

type Props = ModuleComponentProps<GrapheneInputs>;

export const GrapheneModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<GrapheneInputs>(DEFAULTS);
  const outputs = useMemo(() => computeGraphene(state), [state]);

  useEffect(() => registerValues(state), [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'graphene') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (key: keyof GrapheneInputs, value: number) => {
    const ranges: any = {
      ng: { min: 1e14, max: 1e17 },
      mug: { min: 0, max: 5 },
      sigmaCu: { min: 1e6, max: 1e8 },
      thickness: { min: 1e-9, max: 1e-5 },
    };
    const range = ranges[key];
    const clamped = range ? clamp(value, range.min, range.max) : value;
    setState((prev) => ({ ...prev, [key]: clamped }));
  };

  const data = [
    { name: 'Grafeno', sigma: outputs.sigma2DG },
    { name: 'Cobre 2D', sigma: outputs.sigma2DCu },
  ];

  return (
    <>
      <section className="panel controls">
        <h3>Entradas</h3>
        <div className="controls">
          <div className="control-row">
            <label>ng (1e14..1e17 m⁻²)</label>
            <input type="number" value={state.ng} onChange={(e) => update('ng', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>μg (0..5 m²/Vs)</label>
            <input type="number" value={state.mug} onChange={(e) => update('mug', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>σCu (1e6..1e8 S/m)</label>
            <input
              type="number"
              value={state.sigmaCu}
              onChange={(e) => update('sigmaCu', Number(e.target.value))}
            />
          </div>
          <div className="control-row">
            <label>t (1e-9..1e-5 m)</label>
            <input
              type="number"
              value={state.thickness}
              onChange={(e) => update('thickness', Number(e.target.value))}
            />
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={state.logScale}
              onChange={(e) => setState((p) => ({ ...p, logScale: e.target.checked }))}
            />
            Escala logarítmica
          </label>
        </div>
        <div className="help">
          σ2D = n·q·μ para grafeno. Para Cu se aproxima σ2D = σ·t. La comparativa resalta cómo una capa delgada de
          Cu pierde conductividad respecto a grafeno de alta movilidad.
        </div>
      </section>

      <section className="panel graph-card">
        <h3>σ2D comparativa</h3>
        <div className="metrics">
          <div className="metric">
            <strong>Grafeno</strong>
            <span>{formatNumber(outputs.sigma2DG)} S</span>
          </div>
          <div className="metric">
            <strong>Cobre 2D</strong>
            <span>{formatNumber(outputs.sigma2DCu)} S</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis scale={state.logScale ? 'log' : undefined} />
            <Tooltip />
            <Bar dataKey="sigma" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
        <p>Grafeno: alta μ y densidad 2D; Cu: volumétrico, reducido a película delgada.</p>
      </section>
    </>
  );
};
