import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { SuperInputs } from '../../physics/superconductor';
import { computeSuperconductor } from '../../physics/superconductor';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: SuperInputs = {
  Tc: 90,
  T: 20,
  H: 0,
  Hc: 5,
  J: 1e5,
  Jc: 5e8,
  rhoN: 1e-6,
  k: 0.01,
};

type Props = ModuleComponentProps<SuperInputs>;

export const SuperconductorModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<SuperInputs>(DEFAULTS);
  const outputs = useMemo(() => computeSuperconductor(state), [state]);

  useEffect(() => registerValues(state), [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'superconductor') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (key: keyof SuperInputs, value: number) => {
    const ranges: any = {
      Tc: { min: 1, max: 200 },
      T: { min: 0, max: 300 },
      H: { min: 0, max: 20 },
      Hc: { min: 0, max: 20 },
      J: { min: 0, max: 1e9 },
      Jc: { min: 0, max: 1e9 },
      rhoN: { min: 1e-9, max: 1e-3 },
      k: { min: 0, max: 0.1 },
    };
    const range = ranges[key];
    const clamped = range ? clamp(value, range.min, range.max) : value;
    setState((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <>
      <section className="panel controls">
        <h3>Entradas</h3>
        <div className="controls">
          <div className="control-row">
            <label>Tc (1..200 K)</label>
            <input type="number" value={state.Tc} onChange={(e) => update('Tc', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>T (0..300 K)</label>
            <input type="number" value={state.T} onChange={(e) => update('T', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>H (0..20 T)</label>
            <input type="number" value={state.H} onChange={(e) => update('H', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>Hc (0..20 T)</label>
            <input type="number" value={state.Hc} onChange={(e) => update('Hc', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>J (0..1e9 A/m²)</label>
            <input type="number" value={state.J} onChange={(e) => update('J', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>Jc (0..1e9 A/m²)</label>
            <input type="number" value={state.Jc} onChange={(e) => update('Jc', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>ρn base (Ω·m)</label>
            <input type="number" value={state.rhoN} onChange={(e) => update('rhoN', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>k (pendiente normal)</label>
            <input type="number" value={state.k} onChange={(e) => update('k', Number(e.target.value))} />
          </div>
        </div>
        <div className="help">
          Condición superconductor: T&lt;Tc, H&lt;Hc y J&lt;Jc. Si se rompe alguna, aparece ρ normal que crece con la
          temperatura en forma lineal simple (modelo didáctico).
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Estado y Meissner</h3>
        <div className="metrics">
          <div className="metric">
            <strong>Estado</strong>
            <span className="badge">{outputs.isSuper ? 'Superconductor' : 'Normal'}</span>
          </div>
          <div className="metric">
            <strong>ρ actual</strong>
            <span>{formatNumber(outputs.rho)} Ω·m</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={outputs.curve}>
            <XAxis dataKey="T" label={{ value: 'T [K]', position: 'insideBottom', offset: -6 }} />
            <YAxis />
            <Tooltip />
            <Line dataKey="rho" stroke="#f43f5e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <MeissnerDiagram active={outputs.isSuper} />
      </section>
    </>
  );
};

const MeissnerDiagram = ({ active }: { active: boolean }) => {
  return (
    <svg className="svg-diagram" viewBox="0 0 520 200">
      <rect x="200" y="40" width="120" height="120" fill={active ? '#22c55e' : '#e11d48'} opacity={0.25} />
      {[...Array(6)].map((_, i) => {
        const x = 80 + i * 70;
        const color = '#38bdf8';
        return (
          <g key={i}>
            <line
              x1={x}
              y1="20"
              x2={active ? (x < 200 ? x : x + 30) : x}
              y2={active ? (x < 200 ? 80 : 150) : 180}
              stroke={color}
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            {active && x > 200 && x < 320 && (
              <line x1={x} y1="80" x2={x} y2="150" stroke={color} strokeWidth="3" strokeDasharray="6 4" />
            )}
          </g>
        );
      })}
      <text x="260" y="30" fill="#e2e8f0" fontSize="12" textAnchor="middle">
        {active ? 'Campo expulsado (Meissner)' : 'Campo penetra: estado normal'}
      </text>
    </svg>
  );
};
