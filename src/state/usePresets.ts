import { useEffect, useState } from 'react';
import type { ModuleKey, Preset } from '../types';

type Store = Record<ModuleKey, Preset<any>[]>;

const STORAGE_KEY = 'myde-presets';

const loadStore = (): Store => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { } as Store;
  try {
    return JSON.parse(raw);
  } catch {
    return {} as Store;
  }
};

export const usePresets = () => {
  const [presets, setPresets] = useState<Store>({} as Store);

  useEffect(() => {
    setPresets(loadStore());
  }, []);

  const persist = (next: Store) => {
    setPresets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const savePreset = (moduleKey: ModuleKey, name: string, values: any) => {
    const current = presets[moduleKey] || [];
    const filtered = current.filter((p) => p.name !== name);
    const next = { ...presets, [moduleKey]: [...filtered, { name, values }] };
    persist(next as Store);
  };

  const deletePreset = (moduleKey: ModuleKey, name: string) => {
    const current = presets[moduleKey] || [];
    const next = { ...presets, [moduleKey]: current.filter((p) => p.name !== name) };
    persist(next as Store);
  };

  const getModulePresets = (moduleKey: ModuleKey) => presets[moduleKey] || [];

  return { presets, savePreset, deletePreset, getModulePresets };
};
