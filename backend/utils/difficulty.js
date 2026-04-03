export const getDifficultyFromRating = (rating) => {
  if (rating < 1000) return "EASY";
  if (rating < 1400) return "MEDIUM";
  if (rating < 1800) return "HARD";
  return "EXPERT";
};