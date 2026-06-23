import type { Game } from '../types';

export function serializeForStorage(game: Game): Game {
  return {
    ...game,
    categories: game.categories.map(cat => ({
      ...cat,
      clues: cat.clues.map(clue => ({
        ...clue,
        media: clue.media ? { ...clue.media, blobUrl: null } : null,
        answerMedia: clue.answerMedia ? { ...clue.answerMedia, blobUrl: null } : null,
      })),
    })),
  };
}
