import { useEffect, useState } from 'react';
import type { ModuleKey, Preset } from '../types';

type Props = {
  mode: 'save' | 'load';
  moduleKey: ModuleKey;
  presets: Preset<any>[];
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (values: any) => void;
  onDelete: (name: string) => void;
};

export const PresetModal = ({
  mode,
  moduleKey,
  presets,
  onClose,
  onSave,
  onLoad,
  onDelete,
}: Props) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName('');
  }, [presets]);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{mode === 'save' ? 'Guardar preset' : 'Cargar preset'} · {moduleKey}</h3>
        {mode === 'save' && (
          <>
            <p>Asigná un nombre al preset actual.</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del preset"
            />
            <div className="actions" style={{ marginTop: 12 }}>
              <button
                className="primary"
                disabled={!name}
                onClick={() => onSave(name)}
              >
                Guardar
              </button>
              <button className="ghost" onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}

        {mode === 'load' && (
          <>
            <p>Seleccioná un preset guardado localmente.</p>
            <div className="preset-list">
              {presets.length === 0 && <span>No hay presets guardados.</span>}
              {presets.map((preset) => (
                <div key={preset.name} className="preset-item">
                  <span>{preset.name}</span>
                  <div className="actions">
                    <button className="secondary" onClick={() => onLoad(preset.values)}>
                      Cargar
                    </button>
                    <button className="ghost" onClick={() => onDelete(preset.name)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="ghost" onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
