const GAME_MESSAGES = {
  success: [
    "Great job! Language skills shining!",
    "Impressive work! Mastering language!",
    "You've got it! Keep learning!",
    "Well done! Proficiency rising!",
    "Fantastic effort! Flourishing skills!",
    "Keep it up! Language virtuoso!",
    "Incredible job! Remarkable grasp!",
    "Nailed it! Inspiring progress!",
    "Outstanding! Unmatched aptitude!",
    "Acing it! Commendable dedication!",
  ],
  error: [
    "Keep going, you're making progress!",
    "Mistakes are stepping stones to success. Don't give up!",
    "You've got this! Keep practicing!",
    "Learning is a journey. Keep pushing forward!",
    "Embrace challenges to learn and grow!",
    "Believe in yourself! You'll master it.",
    "Keep at it, and you'll see results!",
    "You're getting there! Keep practicing!",
    "Progress comes from perseverance!",
    "Stay positive! You've got this!",
  ],
  initial: ["Let's get started"],
};

export function randomMessage(key: keyof typeof GAME_MESSAGES): string {
  const options = GAME_MESSAGES[key];
  return options[Math.floor(Math.random() * options.length)];
}
