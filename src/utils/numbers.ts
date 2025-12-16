export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const formatNumber = (value: number, digits = 3) => {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  if ((abs !== 0 && (abs < 1e-3 || abs > 1e4)) || String(value).length > 8) {
    return value.toExponential(digits);
  }
  return value.toFixed(digits);
};
