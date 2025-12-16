import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { OhmInputs } from '../../physics/ohm';
import { computeOhm } from '../../physics/ohm';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: OhmInputs = {
  mode: 'vr',
  V: 10,
  R: 10,
  L: 1,
  A: 1e-4,
  rho: 1e-5,
};

const ranges = {
  V: { min: 0, max: 50 },
  R: { min: 0.1, max: 1000 },
  L: { min: 0.01, max: 10 },
  A: { min: 1e-8, max: 1e-2 },
  rho: { min: 1e-10, max: 1e-3 },
};

type Props = ModuleComponentProps<OhmInputs>;

export const OhmModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<OhmInputs>(DEFAULTS);
  const outputs = useMemo(() => computeOhm(state), [state]);

  useEffect(() => {
    registerValues(state);
  }, [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'ohm') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const update = (key: keyof OhmInputs, value: number) => {
    const range = (ranges as any)[key];
    const clamped = range ? clamp(value, range.min, range.max) : value;
    setState((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <>
      <section className="panel controls">
        <h3>Entradas</h3>
        <div className="toggle-row">
          <button
            className={state.mode === 'vr' ? 'secondary' : 'ghost'}
            onClick={() => setState((p) => ({ ...p, mode: 'vr' }))}
          >
            Modo V y R
          </button>
          <button
            className={state.mode === 'rho' ? 'secondary' : 'ghost'}
            onClick={() => setState((p) => ({ ...p, mode: 'rho' }))}
          >
            Modo ρ, L, A
          </button>
        </div>

        <div className="controls">
          <div className="control-row">
            <label>
              V (0-50 V) <small>Tensión aplicada</small>
            </label>
            <input
              type="number"
              value={state.V}
              onChange={(e) => update('V', Number(e.target.value))}
            />
          </div>
          {state.mode === 'vr' && (
            <div className="control-row">
              <label>
                R (0.1-1000 Ω) <small>Resistencia</small>
              </label>
              <input
                type="number"
                value={state.R}
                onChange={(e) => update('R', Number(e.target.value))}
              />
            </div>
          )}
          {state.mode === 'rho' && (
            <>
              <div className="control-row">
                <label>
                  ρ (1e-10..1e-3 Ω·m) <small>Resistividad</small>
                </label>
                <input
                  type="number"
                  value={state.rho}
                  onChange={(e) => update('rho', Number(e.target.value))}
                />
              </div>
              <div className="control-row">
                <label>
                  L (0.01-10 m) <small>Longitud</small>
                </label>
                <input
                  type="number"
                  value={state.L}
                  onChange={(e) => update('L', Number(e.target.value))}
                />
              </div>
              <div className="control-row">
                <label>
                  A (1e-8..1e-2 m²) <small>Área transversal</small>
                </label>
                <input
                  type="number"
                  value={state.A}
                  onChange={(e) => update('A', Number(e.target.value))}
                />
              </div>
            </>
          )}
        </div>

        <div className="help">
          Relacioná tensión, corriente y geometría. El modo ρ usa la ley R = ρL/A.
          Las magnitudes se ajustan al rango permitido automáticamente.
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Resultados</h3>
        <div className="metrics">
          <div className="metric">
            <strong>I</strong>
            <span>{formatNumber(outputs.I)} A</span>
          </div>
          <div className="metric">
            <strong>R efectiva</strong>
            <span>{formatNumber(outputs.Rcalc)} Ω</span>
          </div>
          <div className="metric">
            <strong>J</strong>
            <span>{formatNumber(outputs.J)} A/m²</span>
          </div>
          <div className="metric">
            <strong>E</strong>
            <span>{formatNumber(outputs.E)} V/m</span>
          </div>
          <div className="metric">
            <strong>σ</strong>
            <span>{formatNumber(outputs.sigma)} S/m</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={outputs.dataIV}>
            <XAxis dataKey="V" label={{ value: 'V [V]', position: 'insideBottom', offset: -6 }} />
            <YAxis label={{ value: 'I [A]', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line dataKey="I" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p>Pendiente = 1/R → recta de la ley de Ohm.</p>
      </section>
    </>
  );
};
