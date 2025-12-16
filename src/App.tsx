import { useCallback, useMemo, useState } from 'react';
import './style.css';
import type { ModuleKey, ModuleMap } from './types';
import { OhmModule } from './modules/ohm/OhmModule';
import { MatthiessenModule } from './modules/matthiessen/MatthiessenModule';
import { MobilityModule } from './modules/mobility/MobilityModule';
import { BandsModule } from './modules/bands/BandsModule';
import { GrapheneModule } from './modules/graphene/GrapheneModule';
import { SuperconductorModule } from './modules/superconductor/SuperconductorModule';
import { CompareModule } from './modules/compare/CompareModule';
import { PresetModal } from './components/PresetModal';
import { usePresets } from './state/usePresets';

const moduleComponents: ModuleMap = {
  ohm: OhmModule,
  matthiessen: MatthiessenModule,
  mobility: MobilityModule,
  bands: BandsModule,
  graphene: GrapheneModule,
  superconductor: SuperconductorModule,
  compare: CompareModule,
};

const moduleLabels: Record<ModuleKey, string> = {
  ohm: 'Ley de Ohm',
  matthiessen: 'Resistividad vs Temperatura',
  mobility: 'Movilidad y Scattering',
  bands: 'Teoría de Bandas',
  graphene: 'Grafeno vs Cobre',
  superconductor: 'Superconductividad',
  compare: 'Comparativa global',
};

export function App() {
  const [selected, setSelected] = useState<ModuleKey>('ohm');
  const [modalMode, setModalMode] = useState<'save' | 'load' | null>(null);
  const [lastValues, setLastValues] = useState<Partial<Record<ModuleKey, any>>>({});
  const { presets, savePreset, deletePreset, getModulePresets } = usePresets();

  const Module = useMemo(() => moduleComponents[selected], [selected]);

  const handleRegister = useCallback((moduleKey: ModuleKey, values: any) => {
    setLastValues((prev) => ({ ...prev, [moduleKey]: values }));
  }, []);

  const registerForSelected = useCallback(
    (values: any) => handleRegister(selected, values),
    [selected, handleRegister],
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-title">Materiales y Dispositivos</span>
          <span className="brand-sub">Demo offline React + Recharts</span>
        </div>
        <nav className="menu">
          {(Object.keys(moduleComponents) as ModuleKey[]).map((key) => (
            <button
              key={key}
              className={`menu-item ${selected === key ? 'active' : ''}`}
              onClick={() => setSelected(key)}
            >
              {moduleLabels[key]}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>{moduleLabels[selected]}</h1>
            <p className="subtitle">
              Ajustá parámetros y observa cómo cambian las magnitudes y gráficos.
            </p>
          </div>
          <div className="actions">
            <button className="ghost" onClick={() => window.location.reload()}>
              Reset total
            </button>
            <button className="primary" onClick={() => setModalMode('save')}>
              Guardar preset
            </button>
            <button className="secondary" onClick={() => setModalMode('load')}>
              Cargar preset
            </button>
          </div>
        </header>

        <section className="module-section">
          <Module
            presets={getModulePresets(selected)}
            registerValues={registerForSelected}
            onSavePreset={(name, values) => savePreset(selected, name, values)}
            onDeletePreset={(name) => deletePreset(selected, name)}
          />
        </section>
      </main>

      {modalMode && (
        <PresetModal
          mode={modalMode}
          moduleKey={selected}
          onClose={() => setModalMode(null)}
          presets={presets[selected] || []}
          onSave={(name) => {
            const values = lastValues[selected];
            if (values) {
              savePreset(selected, name, values);
            }
            setModalMode(null);
          }}
          onLoad={(values) => {
            const customEvent = new CustomEvent('load-preset', {
              detail: { moduleKey: selected, values },
            });
            window.dispatchEvent(customEvent);
            setModalMode(null);
          }}
          onDelete={(name) => deletePreset(selected, name)}
        />
      )}
    </div>
  );
}
