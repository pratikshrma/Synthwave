export default function remapClamp(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  // 1. Remap the value
  let remapped =
    outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));

  // 2. Clamp the result between outMin and outMax (handling either direction)
  const lower = Math.min(outMin, outMax);
  const upper = Math.max(outMin, outMax);
  return Math.min(Math.max(remapped, lower), upper);
}
