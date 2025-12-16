import type { ComponentType } from 'react';

export type ModuleKey =
  | 'ohm'
  | 'matthiessen'
  | 'mobility'
  | 'bands'
  | 'graphene'
  | 'superconductor'
  | 'compare';

export type ModuleComponentProps<T> = {
  presets: Preset<T>[];
  onSavePreset: (name: string, values: T) => void;
  onDeletePreset: (name: string) => void;
  registerValues: (values: T) => void;
};

export type ModuleMap = Record<ModuleKey, ComponentType<ModuleComponentProps<any>>>;

export type Preset<T> = {
  name: string;
  values: T;
};

export type Range = {
  min: number;
  max: number;
};
