export interface Game {
  id: number;
  slug: string;
  title: string;
  description: string;
  gameType: string;
  availableWordCount: number;
  isEnabled: boolean;
}

export interface GameQuestion {
  id: number;
  question: string[]; // up to 3 definitions
  additional_info: {
    audio_url: string | null;
    img_url: string | null;
    examples: { text: string; translation: string }[] | null;
  };
}

export interface GameResult {
  result_percentage: number;
  learned_words: number;
  correct_count: number;
}

export interface GameSession {
  task: string;
  session_id: string;
  questions: GameQuestion[];
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: string | null;
}