
export interface PlayerStats {
  id: number;
  name: string;
  team: string;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  price: number;
  points: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  ownership: string;
  form: number;
  ictIndex: number;
}

export interface Fixture {
  gameweek: number;
  opponent: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isHome: boolean;
}

export interface Article {
  title: string;
  snippet: string;
  author: string;
  date: string;
  url: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  data?: any;
}
