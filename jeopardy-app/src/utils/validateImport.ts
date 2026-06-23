import type { Game } from '../types';

export function validateImport(raw: unknown): Game {
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid JSON object');
  const obj = raw as Record<string, unknown>;
  if (typeof obj.title !== 'string') throw new Error('Missing "title" field');
  if (!Array.isArray(obj.categories)) throw new Error('Missing "categories" array');
  if (!Array.isArray(obj.players)) throw new Error('Missing "players" array');
  return raw as Game;
}
