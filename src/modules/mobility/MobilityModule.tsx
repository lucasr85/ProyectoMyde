import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { MobilityInputs } from '../../physics/mobility';
import { computeMobility } from '../../physics/mobility';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: MobilityInputs = {
  E: 50,
  mu: 0.5,
  n: 1e22,
  saturation: false,
  vdMax: 1e5,
};

type Props = ModuleComponentProps<MobilityInputs>;

export const MobilityModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<MobilityInputs>(DEFAULTS);
  const outputs = useMemo(() => computeMobility(state), [state]);
  const [graphMode, setGraphMode] = useState<'vd' | 'J'>('vd');

  useEffect(() => registerValues(state), [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'mobility') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (key: keyof MobilityInputs, value: number) => {
    const clamped = clamp(value, 0, key === 'n' ? 1e30 : key === 'vdMax' ? 2e5 : 200);
    setState((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <>
      <section className="panel controls">
        <h3>Entradas</h3>
        <div className="controls">
          <div className="control-row">
            <label>E (0-200 V/m)</label>
            <input type="number" value={state.E} onChange={(e) => update('E', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>μ (0-1 m²/Vs)</label>
            <input type="number" value={state.mu} onChange={(e) => update('mu', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>n (1e20..1e29 m⁻³)</label>
            <input type="number" value={state.n} onChange={(e) => update('n', Number(e.target.value))} />
          </div>
          <div className="control-row">
            <label>vd máx (0..2e5 m/s)</label>
            <input type="number" value={state.vdMax} onChange={(e) => update('vdMax', Number(e.target.value))} />
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={state.saturation}
              onChange={(e) => setState((p) => ({ ...p, saturation: e.target.checked }))}
            />
            Saturación de velocidad
          </label>
        </div>
        <div className="help">
          vd = μ·E, σ = n·q·μ, J = σ·E. Si hay saturación, vd no supera vd_max y J se recalcula en
          consecuencia (modelo didáctico).
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Resultados</h3>
        <div className="metrics">
          <div className="metric">
            <strong>vd</strong>
            <span>{formatNumber(outputs.vd)} m/s</span>
          </div>
          <div className="metric">
            <strong>σ</strong>
            <span>{formatNumber(outputs.sigma)} S/m</span>
          </div>
          <div className="metric">
            <strong>J</strong>
            <span>{formatNumber(outputs.J)} A/m²</span>
          </div>
        </div>

        <div className="toggle-row" style={{ marginTop: 12 }}>
          <button className={graphMode === 'vd' ? 'secondary' : 'ghost'} onClick={() => setGraphMode('vd')}>
            vd vs E
          </button>
          <button className={graphMode === 'J' ? 'secondary' : 'ghost'} onClick={() => setGraphMode('J')}>
            J vs E
          </button>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={graphMode === 'vd' ? outputs.curveVd : outputs.curveJ}>
            <XAxis dataKey="E" label={{ value: 'E [V/m]', position: 'insideBottom', offset: -6 }} />
            <YAxis />
            <Tooltip />
            <Line dataKey={graphMode === 'vd' ? 'vd' : 'J'} stroke="#7c3aed" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
};
