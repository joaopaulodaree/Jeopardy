const CLUE_VALUES = [200, 400, 600, 800, 1000];

export function getClueValue(index: number): number {
  return CLUE_VALUES[index] ?? (index + 1) * 200;
}
