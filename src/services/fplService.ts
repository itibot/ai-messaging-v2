
import { PlayerStats, Fixture, Article } from '../types';

// Mock data to simulate an external API response
const PLAYERS: PlayerStats[] = [
  { id: 1, name: "Mohamed Salah", team: "Liverpool", position: "MID", price: 12.8, points: 145, goals: 12, assists: 8, cleanSheets: 6, ownership: "45.2%", form: 8.5, ictIndex: 120.4 },
  { id: 2, name: "Erling Haaland", team: "Man City", position: "FWD", price: 15.3, points: 128, goals: 18, assists: 2, cleanSheets: 0, ownership: "68.4%", form: 7.2, ictIndex: 115.2 },
  { id: 3, name: "Cole Palmer", team: "Chelsea", position: "MID", price: 10.5, points: 112, goals: 9, assists: 7, cleanSheets: 4, ownership: "42.1%", form: 9.1, ictIndex: 108.7 },
  { id: 4, name: "Ollie Watkins", team: "Aston Villa", position: "FWD", price: 9.0, points: 105, goals: 10, assists: 6, cleanSheets: 0, ownership: "35.8%", form: 6.8, ictIndex: 95.4 },
  { id: 5, name: "Bukayo Saka", team: "Arsenal", position: "MID", price: 10.1, points: 118, goals: 8, assists: 9, cleanSheets: 7, ownership: "48.2%", form: 7.9, ictIndex: 112.1 },
  { id: 6, name: "Trent Alexander-Arnold", team: "Liverpool", position: "DEF", price: 7.0, points: 85, goals: 2, assists: 5, cleanSheets: 6, ownership: "22.5%", form: 5.4, ictIndex: 88.2 },
  { id: 7, name: "Gabriel Magalhães", team: "Arsenal", position: "DEF", price: 6.2, points: 78, goals: 3, assists: 1, cleanSheets: 8, ownership: "18.4%", form: 6.2, ictIndex: 72.5 },
  { id: 8, name: "David Raya", team: "Arsenal", position: "GKP", price: 5.6, points: 72, goals: 0, assists: 0, cleanSheets: 8, ownership: "25.1%", form: 5.8, ictIndex: 45.1 },
];

const INJURIES: Record<string, any[]> = {
  "Arsenal": [
    { player: "Martin Ødegaard", status: "Doubtful", returnDate: "Gameweek 22", news: "Ankle injury sustained on international duty." },
    { player: "Mikel Merino", status: "Available", returnDate: "Now", news: "Passed late fitness test." }
  ],
  "Man City": [
    { player: "Rodri", status: "Out", returnDate: "Next Season", news: "ACL surgery successful." },
    { player: "Kevin De Bruyne", status: "Doubtful", returnDate: "Gameweek 21", news: "Hamstring strain monitoring." }
  ],
  "Liverpool": [
    { player: "Alisson Becker", status: "Out", returnDate: "Gameweek 23", news: "Muscle injury in training." }
  ]
};

const FIXTURES: Record<string, Fixture[]> = {
  "Liverpool": [
    { gameweek: 21, opponent: "Man City", difficulty: 5, isHome: true },
    { gameweek: 22, opponent: "Everton", difficulty: 2, isHome: false },
    { gameweek: 23, opponent: "Newcastle", difficulty: 3, isHome: true }
  ],
  "Arsenal": [
    { gameweek: 21, opponent: "Chelsea", difficulty: 4, isHome: false },
    { gameweek: 22, opponent: "Wolves", difficulty: 2, isHome: true },
    { gameweek: 23, opponent: "Ipswich", difficulty: 1, isHome: false }
  ],
  "Man City": [
    { gameweek: 21, opponent: "Liverpool", difficulty: 5, isHome: false },
    { gameweek: 22, opponent: "Southampton", difficulty: 1, isHome: true },
    { gameweek: 23, opponent: "Tottenham", difficulty: 4, isHome: true }
  ]
};

const ARTICLES: Article[] = [
  {
    title: "Is Haaland still essential?",
    snippet: "With a price tag of £15.3m and a tough run of fixtures, some managers are considering a wildcard move without the Norwegian giant.",
    author: "FPL Scout",
    date: "2024-05-15",
    url: "https://fantasy.premierleague.com/scout"
  },
  {
    title: "The Rise of the Mid-Priced Midfielders",
    snippet: "Cole Palmer and Bukayo Saka continue to out-value their premium counterparts. Here's why you should triple up on London midfielders.",
    author: "The Athletic",
    date: "2024-05-14",
    url: "https://theathletic.com/fpl"
  }
];

export const fplApi = {
  async getPlayerStats(name: string): Promise<PlayerStats | null> {
    try {
      const response = await fetch(`/api/data/players?name=${encodeURIComponent(name)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch player stats:", error);
      return null;
    }
  },

  async getTopPlayers(position?: string, limit: number = 5): Promise<PlayerStats[]> {
    try {
      const url = `/api/data/top-players?limit=${limit}${position ? `&position=${position}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch top players:", error);
      return [];
    }
  },

  async getFixtures(team: string): Promise<Fixture[]> {
    try {
      const response = await fetch(`/api/data/fixtures?team=${encodeURIComponent(team)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
      return [];
    }
  },

  async getNews(topic: string): Promise<Article[]> {
    return ARTICLES.filter(a => a.title.toLowerCase().includes(topic.toLowerCase()) || a.snippet.toLowerCase().includes(topic.toLowerCase()));
  },

  async getInjuries(team: string): Promise<any[]> {
    return INJURIES[team] || [];
  }
};
