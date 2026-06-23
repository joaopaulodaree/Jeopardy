export interface Media {
  type: 'image' | 'video' | 'youtube' | 'link';
  blobUrl: string | null;
  externalUrl: string | null;
}

export interface Clue {
  id: string;
  question: string;
  answer: string;
  media: Media | null;
  answerMedia: Media | null;
}

export interface Category {
  id: string;
  name: string;
  clues: Clue[];
}

export interface Player {
  id: string;
  name: string;
}

export interface Game {
  title: string;
  categories: Category[];
  players: Player[];
}

export interface RuntimeState {
  scores: Record<string, number>;
  answered: Record<string, boolean>;
}
