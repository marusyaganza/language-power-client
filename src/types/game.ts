export interface Game {
  id: number;
  slug: string;
  title: string;
  description: string;
  gameType: string;
  availableWordCount: number;
  isEnabled: boolean;
}