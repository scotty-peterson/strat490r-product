// Conversation starters grouped by mood/category
// Each idea detail page shows 3 contextual questions

type StarterPool = Record<string, string[]>;

export const MOOD_STARTERS: StarterPool = {
  chill: [
    "What's something small that made you smile today?",
    "If we had zero responsibilities tomorrow, what would we do?",
    "What's a comfort food you could eat every day?",
    "What's the most relaxed you've ever felt?",
    "If you could live anywhere for a year, where?",
    "What's a song that always puts you in a good mood?",
    "What's the best nap you've ever taken?",
    "What show could you rewatch forever?",
  ],
  romantic: [
    "What's your favorite memory of us?",
    "When did you first know you liked me?",
    "What's something I do that you find attractive?",
    "If we could relive one day together, which one?",
    "What's a dream trip you'd want us to take?",
    "What's something you admire about our relationship?",
    "What's a small thing I do that means a lot to you?",
    "Where do you see us in five years?",
  ],
  adventurous: [
    "What's the most spontaneous thing you've ever done?",
    "What's on your bucket list that we could do together?",
    "If money were no object, what adventure would you plan?",
    "What's a skill you'd love to learn together?",
    "What's the scariest thing you've ever done willingly?",
    "If we could teleport anywhere right now, where?",
    "What's an adventure you had as a kid that shaped you?",
    "Would you rather explore the ocean or outer space?",
  ],
  social: [
    "Who's someone you'd love to have dinner with?",
    "What's the best party or event you've ever been to?",
    "If we threw a dinner party, who are the 6 guests?",
    "What's a conversation topic you never get tired of?",
    "What's the best advice someone has given you?",
    "Who in your life would you describe as truly happy?",
    "What's a friendship you're really grateful for?",
    "What makes someone instantly likeable to you?",
  ],
  creative: [
    "If you could master any art form overnight, which one?",
    "What's the most creative thing you've ever made?",
    "If we started a business together, what would it be?",
    "What's a project you've always wanted to try?",
    "If you could design your dream home, what's the wildest room?",
    "What inspires you most — music, art, nature, or people?",
    "If you wrote a book, what would it be about?",
    "What's something you'd love to build with your hands?",
  ],
  active: [
    "What sport did you love as a kid?",
    "What's the hardest physical thing you've ever done?",
    "If you could compete in any Olympic event, which one?",
    "What's your favorite way to move your body?",
    "Morning workout or evening workout?",
    "What's a physical challenge you'd like us to try?",
    "What's the longest you've ever hiked or walked?",
    "If we trained for something together, what would it be?",
  ],
};

export const GENERAL_STARTERS: string[] = [
  "What's something you've changed your mind about recently?",
  "What's the best meal you've had this month?",
  "What are you most looking forward to right now?",
  "What's a random fact you learned recently?",
  "If you could have dinner with anyone in history, who?",
  "What's something that always makes you laugh?",
  "What's a skill you have that most people don't know about?",
  "What's the best piece of advice you've ever received?",
  "If you had to describe yourself in three words, what would they be?",
  "What's a goal you're working toward right now?",
  "What does your ideal weekend look like?",
  "What's a simple pleasure you never take for granted?",
];

export function getStarters(moods: string[], seed: number): string[] {
  // Collect mood-specific starters
  const pool: string[] = [];
  moods.forEach((mood) => {
    if (MOOD_STARTERS[mood]) {
      pool.push(...MOOD_STARTERS[mood]);
    }
  });

  // Fill with general if not enough
  if (pool.length < 3) {
    pool.push(...GENERAL_STARTERS);
  }

  // Deterministic pick of 3 using seed
  const picked: string[] = [];
  const available = [...pool];
  for (let i = 0; i < 3 && available.length > 0; i++) {
    const idx = Math.abs(Math.floor(Math.sin(seed * (i + 1) * 127.1) * 10000)) % available.length;
    picked.push(available[idx]);
    available.splice(idx, 1);
  }

  return picked;
}
