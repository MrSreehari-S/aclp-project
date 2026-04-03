export const getTimeLimit = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return 300;   // 5 min
    case "MEDIUM":
      return 600;   // 10 min
    case "HARD":
      return 900;   // 15 min
    case "EXPERT":
      return 1200;  // 20 min
    default:
      return 600;
  }
};