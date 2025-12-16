import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { ModuleComponentProps } from '../../types';
import type { MatthiessenInputs } from '../../physics/matthiessen';
import { buildRhoCurve, defaultMaterials, rhoMatthiessen } from '../../physics/matthiessen';
import { clamp, formatNumber } from '../../utils/numbers';

const DEFAULTS: MatthiessenInputs = {
  material: 'Cu',
  rho20: defaultMaterials.Cu.rho20,
  alpha: defaultMaterials.Cu.alpha,
  rhoI: defaultMaterials.Cu.rhoI,
  rhoD: defaultMaterials.Cu.rhoD,
  T: 20,
  compare: false,
};

type Props = ModuleComponentProps<MatthiessenInputs>;

export const MatthiessenModule = ({ registerValues }: Props) => {
  const [state, setState] = useState<MatthiessenInputs>(DEFAULTS);

  const currentRho = rhoMatthiessen(state.rho20, state.alpha, state.rhoI, state.rhoD, state.T);
  const currentSigma = currentRho > 0 ? 1 / currentRho : 0;
  const curve = useMemo(() => buildRhoCurve(state), [state]);
  const curveAl = useMemo(
    () =>
      buildRhoCurve({
        ...state,
        material: 'Al',
        rho20: defaultMaterials.Al.rho20,
        alpha: defaultMaterials.Al.alpha,
        rhoI: defaultMaterials.Al.rhoI,
        rhoD: defaultMaterials.Al.rhoD,
      }),
    [state],
  );

  useEffect(() => registerValues(state), [state, registerValues]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.moduleKey === 'matthiessen') {
        setState((prev) => ({ ...prev, ...e.detail.values }));
      }
    };
    window.addEventListener('load-preset', handler);
    return () => window.removeEventListener('load-preset', handler);
  }, []);

  const applyMaterial = (mat: 'Cu' | 'Al' | 'Custom') => {
    if (mat === 'Custom') {
      setState((p) => ({ ...p, material: mat }));
    } else {
      setState((p) => ({
        ...p,
        material: mat,
        rho20: defaultMaterials[mat].rho20,
        alpha: defaultMaterials[mat].alpha,
        rhoI: defaultMaterials[mat].rhoI,
        rhoD: defaultMaterials[mat].rhoD,
      }));
    }
  };

  const update = (key: keyof MatthiessenInputs, value: number) => {
    const clamped = clamp(value, -1e3, 1e3);
    setState((prev) => ({ ...prev, [key]: clamped }));
  };

  return (
    <>
      <section className="panel controls">
        <h3>Entradas</h3>
        <div className="toggle-row">
          {(['Cu', 'Al', 'Custom'] as const).map((mat) => (
            <button
              key={mat}
              className={state.material === mat ? 'secondary' : 'ghost'}
              onClick={() => applyMaterial(mat)}
            >
              {mat}
            </button>
          ))}
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={state.compare}
              onChange={(e) => setState((p) => ({ ...p, compare: e.target.checked }))}
            />
            Comparar Cu vs Al
          </label>
        </div>

        <div className="controls">
          <div className="control-row">
            <label>ρ20 (Ω·m)</label>
            <input
              type="number"
              value={state.rho20}
              onChange={(e) => update('rho20', Number(e.target.value))}
            />
          </div>
          <div className="control-row">
            <label>α (1/°C)</label>
            <input
              type="number"
              value={state.alpha}
              onChange={(e) => update('alpha', Number(e.target.value))}
            />
          </div>
          <div className="control-row">
            <label>ρi (Ω·m)</label>
            <input
              type="number"
              value={state.rhoI}
              onChange={(e) => update('rhoI', Number(e.target.value))}
            />
          </div>
          <div className="control-row">
            <label>ρd (Ω·m)</label>
            <input
              type="number"
              value={state.rhoD}
              onChange={(e) => update('rhoD', Number(e.target.value))}
            />
          </div>
          <div className="control-row">
            <label>
              T (-100..400 °C) <small>Temperatura actual</small>
            </label>
            <input
              type="number"
              value={state.T}
              onChange={(e) => update('T', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="help">
          ρ(T) = ρ20 · (1 + α·(T-20)) + ρi + ρd. La suma muestra el aporte térmico
          y defectos (Matthiessen). Activá comparación para ver Cu vs Al.
        </div>
      </section>

      <section className="panel graph-card">
        <h3>Resistividad y conductividad</h3>
        <div className="metrics">
          <div className="metric">
            <strong>ρ(T)</strong>
            <span>{formatNumber(currentRho)} Ω·m</span>
          </div>
          <div className="metric">
            <strong>σ(T)</strong>
            <span>{formatNumber(currentSigma)} S/m</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={state.compare ? curveAl : curve}>
            <XAxis dataKey="T" label={{ value: 'T [°C]', position: 'insideBottom', offset: -6 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              data={curve}
              dataKey="rho"
              name={`ρ ${state.material}`}
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />
            {state.compare && (
              <Line
                data={curveAl}
                dataKey="rho"
                name="ρ Al"
                stroke="#f97316"
                strokeWidth={3}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
};
