import type { Game, Category, Clue } from '../types';

function makeClues(): Clue[] {
  return Array.from({ length: 5 }, () => ({
    id: crypto.randomUUID(),
    question: '',
    answer: '',
    media: null,
    answerMedia: null,
  }));
}

function makeCategory(name: string): Category {
  return { id: crypto.randomUUID(), name, clues: makeClues() };
}

export function makeDefaultGame(): Game {
  return {
    title: 'My Jeopardy Game',
    categories: [
      makeCategory('Category 1'),
      makeCategory('Category 2'),
      makeCategory('Category 3'),
      makeCategory('Category 4'),
      makeCategory('Category 5'),
    ],
    players: [
      { id: crypto.randomUUID(), name: 'Player 1' },
      { id: crypto.randomUUID(), name: 'Player 2' },
    ],
  };
}
