import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { BandsInputs } from '../../physics/bands';
import { computeBands } from '../../physics/bands';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: BandsInputs = {
  Eg: 1.1,
  T: 300,
  dopaje: 20,
  type: 'n',
};

type Props = ModuleComponentProps<BandsInputs>;

export const BandsModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<BandsInputs>(DEFAULTS);
  const outputs = useMemo(() => computeBands(state), [state]);

  useEffect(() => registerValues(state), [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'bands') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (key: keyof BandsInputs, value: number) => {
    const ranges: any = { Eg: { min: 0, max: 5 }, T: { min: 0, max: 800 }, dopaje: { min: 0, max: 100 } };
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
            <label>Eg (0..5 eV)</label>
            <input type="number" value={state.Eg} onChange={(e) => update('Eg', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>T (0..800 K)</label>
            <input type="number" value={state.T} onChange={(e) => update('T', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>Dopaje (0..100)</label>
            <input type="number" value={state.dopaje} onChange={(e) => update('dopaje', Number(e.target.value))} />
          </div>
          <div className="toggle-row">
            <button className={state.type === 'n' ? 'secondary' : 'ghost'} onClick={() => setState((p) => ({ ...p, type: 'n' }))}>
              n-type
            </button>
            <button className={state.type === 'p' ? 'secondary' : 'ghost'} onClick={() => setState((p) => ({ ...p, type: 'p' }))}>
              p-type
            </button>
          </div>
        </div>
        <div className="help">
          Gap grande → aislante, gap pequeño → metal. Dopar acerca el nivel de Fermi (Ef) a la banda de
          conducción (n) o de valencia (p).
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Conductividad relativa y bandas</h3>
        <div className="metrics">
          <div className="metric">
            <strong>Clasificación</strong>
            <span className="badge">{outputs.clasificacion}</span>
          </div>
          <div className="metric">
            <strong>ConductividadRel</strong>
            <span>{formatNumber(outputs.conductividadRel)}</span>
          </div>
        </div>

        <div className="svg-diagram">
          <BandDiagram Eg={state.Eg} efOffset={outputs.efOffset} type={state.type} />
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={outputs.curve}>
            <XAxis dataKey="T" label={{ value: 'T [K]', position: 'insideBottom', offset: -6 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line dataKey="cond" stroke="#10b981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
};

type DiagramProps = { Eg: number; efOffset: number; type: 'n' | 'p' };

const BandDiagram = ({ Eg, efOffset, type }: DiagramProps) => {
  const gapHeight = Math.min(120, Eg * 24);
  const efY = 130 - efOffset * 50;
  return (
    <svg className="svg-diagram" viewBox="0 0 520 260">
      <rect x="50" y="40" width="420" height="60" fill="#1d4ed8" opacity={0.2} />
      <rect x="50" y={140 + gapHeight} width="420" height="60" fill="#1d4ed8" opacity={0.2} />
      <text x="470" y="70" fill="#e2e8f0" fontSize="12">BC</text>
      <text x="470" y={170 + gapHeight} fill="#e2e8f0" fontSize="12">BV</text>
      <line x1="50" y1={140} x2="470" y2={140} stroke="#e2e8f0" strokeDasharray="4 6" />
      <line x1="50" y1={140 + gapHeight} x2="470" y2={140 + gapHeight} stroke="#e2e8f0" strokeDasharray="4 6" />
      <text x="60" y={135 + gapHeight / 2} fill="#e2e8f0" fontSize="12">Eg = {Eg.toFixed(2)} eV</text>
      <line x1="70" y1={efY} x2="450" y2={efY} stroke="#22c55e" strokeWidth={2} />
      <text x="80" y={efY - 6} fill="#22c55e" fontSize="12">Ef {type}-type</text>
    </svg>
  );
};
